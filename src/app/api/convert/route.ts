import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { PDFProcessor } from '@/lib/pdf-processor';
import { MTNParser } from '@/lib/parsers/mtn-parser';
import { AirtelParser } from '@/lib/parsers/airtel-parser';
import { MobileMoneyParser } from '@/lib/parsers';
import {
  upsertProfile,
  getMonthlyConversionCount,
  getUserPlan,
  logConversion,
} from '@/lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const FREE_TIER_LIMIT = 5;

export async function POST(request: NextRequest) {
  // ── Auth check ─────────────────────────────────────────────────────────────
  const { userId } = await auth();
  let userEmail = '';

  if (userId) {
    // Sync profile to Supabase and enforce plan limits
    const user = await currentUser();
    userEmail = user?.emailAddresses?.[0]?.emailAddress ?? '';

    await upsertProfile(userId, userEmail);

    const plan = await getUserPlan(userId);

    if (plan === 'free') {
      const usedThisMonth = await getMonthlyConversionCount(userId);
      if (usedThisMonth >= FREE_TIER_LIMIT) {
        return NextResponse.json(
          {
            error: `You've used all ${FREE_TIER_LIMIT} free conversions this month. Upgrade to Pro for unlimited conversions.`,
            code: 'LIMIT_REACHED',
          },
          { status: 402 }
        );
      }
    }
  }
  // Anonymous users: no limit enforced yet — rely on client-side UX

  // ── Parse form data ─────────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request. Expected multipart form data.' }, { status: 400 });
  }

  const file = formData.get('file');
  const provider = formData.get('provider') as string | null;

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No PDF file provided.' }, { status: 400 });
  }

  if (!provider || !['MTN', 'Airtel'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider. Must be MTN or Airtel.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
  }

  if (file.type && file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Invalid file type. Please upload a PDF.' }, { status: 400 });
  }

  // ── PDF processing ──────────────────────────────────────────────────────────
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!PDFProcessor.validatePDF(buffer)) {
    return NextResponse.json({ error: 'The uploaded file does not appear to be a valid PDF.' }, { status: 400 });
  }

  const pdfResult = await PDFProcessor.processForMobileMoneyParsing(buffer);
  if (!pdfResult.success || !pdfResult.text) {
    return NextResponse.json(
      { error: pdfResult.error ?? 'Failed to extract text from PDF.' },
      { status: 422 }
    );
  }

  const text = pdfResult.text;

  const parseResult = provider === 'MTN'
    ? MTNParser.parse(text)
    : AirtelParser.parse(text);

  if (!parseResult.success || !parseResult.data) {
    return NextResponse.json(
      { error: parseResult.error ?? 'Failed to parse the statement. Make sure you selected the correct network.' },
      { status: 422 }
    );
  }

  if (parseResult.data.transactions.length === 0) {
    return NextResponse.json(
      { error: 'No transactions were found in this statement. Ensure you uploaded the correct PDF and selected the right network.' },
      { status: 422 }
    );
  }

  // ── Log conversion ──────────────────────────────────────────────────────────
  const { period, accountNumber, totalTransactions } = parseResult.data;

  await logConversion({
    clerkId: userId ?? null,
    provider: provider as 'MTN' | 'Airtel',
    transactionCount: totalTransactions,
    accountNumber,
    periodFrom: period.from,
    periodTo: period.to,
  });

  // ── Generate and return CSV ─────────────────────────────────────────────────
  const csv = MobileMoneyParser.generateCSV(parseResult.data);
  const safePeriod = `${period.from}_${period.to}`.replace(/\//g, '-');
  const filename = `${provider}_MoMo_${accountNumber}_${safePeriod}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Transaction-Count': String(totalTransactions),
      'X-Provider': provider,
    },
  });
}
