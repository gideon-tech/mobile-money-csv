import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';
import { MTNParser } from '@/lib/parsers/mtn-parser';
import { AirtelParser } from '@/lib/parsers/airtel-parser';
import { MobileMoneyParser } from '@/lib/parsers';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request. Expected multipart form data.' }, { status: 400 });
  }

  const file = formData.get('file');
  const provider = formData.get('provider') as string | null;

  // Validate file presence
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No PDF file provided.' }, { status: 400 });
  }

  // Validate provider
  if (!provider || !['MTN', 'Airtel'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider. Must be MTN or Airtel.' }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
  }

  // Validate MIME type
  if (file.type && file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Invalid file type. Please upload a PDF.' }, { status: 400 });
  }

  // Convert file to Buffer for pdf-parse
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate PDF header magic bytes
  if (!PDFProcessor.validatePDF(buffer)) {
    return NextResponse.json({ error: 'The uploaded file does not appear to be a valid PDF.' }, { status: 400 });
  }

  // Extract text from PDF
  const pdfResult = await PDFProcessor.processForMobileMoneyParsing(buffer);
  if (!pdfResult.success || !pdfResult.text) {
    return NextResponse.json(
      { error: pdfResult.error ?? 'Failed to extract text from PDF.' },
      { status: 422 }
    );
  }

  const text = pdfResult.text;

  // Parse using the provider the user selected (skip auto-detect — user already chose)
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

  // Generate CSV
  const csv = MobileMoneyParser.generateCSV(parseResult.data);

  // Build a descriptive filename
  const { period, accountNumber } = parseResult.data;
  const safePeriod = `${period.from}_${period.to}`.replace(/\//g, '-');
  const filename = `${provider}_MoMo_${accountNumber}_${safePeriod}.csv`;

  // Return CSV as a downloadable file
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Transaction-Count': String(parseResult.data.totalTransactions),
      'X-Provider': provider,
    },
  });
}
