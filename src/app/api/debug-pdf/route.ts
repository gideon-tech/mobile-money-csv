import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';

// TEMPORARY debug route — remove before going to production
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await PDFProcessor.processForMobileMoneyParsing(buffer);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  // Return the raw extracted text so we can see the real format
  return NextResponse.json({
    metadata: result.metadata,
    // Split into lines so it's easy to read in the browser
    lines: result.text?.split('\n').map((line, i) => ({ i, line })),
    rawText: result.text,
  });
}
