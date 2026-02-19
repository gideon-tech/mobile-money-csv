import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';
import { MobileMoneyParser } from '@/lib/parsers';
import { uploadedFiles } from '../../upload/route';

// In-memory storage for processed statements
const processedStatements = new Map<string, {
  uploadId: string;
  provider: 'MTN' | 'Airtel';
  accountNumber: string;
  period: {
    from: string;
    to: string;
  };
  openingBalance: number;
  closingBalance: number;
  transactions: any[];
  totalTransactions: number;
  processedAt: Date;
  rawText: string;
  summary: any;
}>();

export async function POST(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  const uploadId = params.uploadId;

  try {
    // Get uploaded file
    const fileData = uploadedFiles.get(uploadId);
    if (!fileData) {
      return NextResponse.json(
        { error: 'File not found or expired' },
        { status: 404 }
      );
    }

    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const pdfResult = await PDFProcessor.processForMobileMoneyParsing(fileData.buffer);
    
    if (!pdfResult.success || !pdfResult.text) {
      return NextResponse.json(
        { error: pdfResult.error || 'Failed to extract text from PDF' },
        { status: 400 }
      );
    }

    // Parse mobile money statement
    console.log('Parsing mobile money statement...');
    const parseResult = await MobileMoneyParser.parseStatement(pdfResult.text);
    
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        { error: parseResult.error || 'Failed to parse mobile money statement' },
        { status: 400 }
      );
    }

    // Generate summary
    const summary = MobileMoneyParser.getStatementSummary(parseResult.data);

    // Store processed data
    processedStatements.set(uploadId, {
      uploadId,
      ...parseResult.data,
      processedAt: new Date(),
      rawText: pdfResult.text,
      summary
    });

    console.log(`Successfully processed ${parseResult.data.provider} statement with ${parseResult.data.totalTransactions} transactions`);

    return NextResponse.json({
      success: true,
      uploadId,
      provider: parseResult.data.provider,
      accountNumber: parseResult.data.accountNumber,
      period: parseResult.data.period,
      totalTransactions: parseResult.data.totalTransactions,
      openingBalance: parseResult.data.openingBalance,
      closingBalance: parseResult.data.closingBalance,
      summary,
      message: `Successfully processed ${parseResult.data.provider} statement`
    });

  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  const uploadId = params.uploadId;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format'); // 'preview' or 'summary'

  try {
    const processedData = processedStatements.get(uploadId);
    if (!processedData) {
      return NextResponse.json(
        { error: 'Processed data not found' },
        { status: 404 }
      );
    }

    if (format === 'preview') {
      // Return first 10 transactions for preview
      return NextResponse.json({
        success: true,
        uploadId,
        provider: processedData.provider,
        accountNumber: processedData.accountNumber,
        period: processedData.period,
        totalTransactions: processedData.totalTransactions,
        previewTransactions: processedData.transactions.slice(0, 10),
        hasMore: processedData.transactions.length > 10
      });
    }

    if (format === 'summary') {
      return NextResponse.json({
        success: true,
        uploadId,
        summary: processedData.summary,
        provider: processedData.provider,
        totalTransactions: processedData.totalTransactions
      });
    }

    // Return full data
    return NextResponse.json({
      success: true,
      ...processedData
    });

  } catch (error) {
    console.error('Get processing data error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve processing data' },
      { status: 500 }
    );
  }
}

// Export for use in download route
export { processedStatements };