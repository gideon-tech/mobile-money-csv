import pdf from 'pdf-parse';

export interface PDFProcessorResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    pages: number;
    title?: string;
    creator?: string;
  };
}

export class PDFProcessor {
  /**
   * Extract text from PDF buffer
   */
  static async extractText(buffer: Buffer): Promise<PDFProcessorResult> {
    try {
      const data = await pdf(buffer);
      
      return {
        success: true,
        text: data.text,
        metadata: {
          pages: data.numpages,
          title: data.info?.Title,
          creator: data.info?.Creator,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validate if uploaded file is a PDF
   */
  static validatePDF(buffer: Buffer): boolean {
    // Check PDF magic number (first 4 bytes should be %PDF)
    const header = buffer.subarray(0, 4).toString();
    return header === '%PDF';
  }

  /**
   * Extract text and clean it for mobile money parsing
   */
  static async processForMobileMoneyParsing(buffer: Buffer): Promise<PDFProcessorResult> {
    // First validate it's a PDF
    if (!this.validatePDF(buffer)) {
      return {
        success: false,
        error: 'Invalid file format. Please upload a PDF file.',
      };
    }

    // Extract text
    const result = await this.extractText(buffer);
    
    if (!result.success || !result.text) {
      return result;
    }

    // Clean the text for better parsing
    const cleanedText = this.cleanTextForParsing(result.text);
    
    return {
      ...result,
      text: cleanedText,
    };
  }

  /**
   * Clean extracted text to improve parsing accuracy
   */
  private static cleanTextForParsing(text: string): string {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Fix line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove page breaks and form feeds
      .replace(/\f/g, '\n')
      // Clean up common OCR errors in currency
      .replace(/UGX(\s+)/g, 'UGX ')
      // Normalize phone numbers (common in mobile money)
      .replace(/(\d{3})(\s*)(\d{3})(\s*)(\d{3})/g, '$1$3$5')
      // Clean up transaction IDs (remove extra spaces)
      .replace(/([A-Z0-9]{2,})\s+([A-Z0-9]{2,})/g, '$1$2')
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  /**
   * Attempt to fix common PDF extraction issues
   */
  static repairExtractedText(text: string): string {
    return text
      // Fix common date format issues
      .replace(/(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})/g, '$1/$2/$3')
      .replace(/(\d{2})\s*-\s*(\d{2})\s*-\s*(\d{4})/g, '$1-$2-$3')
      
      // Fix time format issues
      .replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2})/g, '$1:$2:$3')
      
      // Fix amount formatting (remove spaces in numbers)
      .replace(/(\d{1,3})\s*,\s*(\d{3})/g, '$1,$2')
      .replace(/UGX\s*(\d)/g, 'UGX $1')
      
      // Fix reference numbers (remove internal spaces)
      .replace(/([A-Z]{2})\s+([0-9]{8,})/g, '$1$2')
      
      // Remove common headers/footers that might interfere
      .replace(/Page \d+ of \d+/gi, '')
      .replace(/Generated on .*/gi, '')
      .replace(/Confidential.*$/gim, '');
  }
}