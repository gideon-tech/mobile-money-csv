import { MTNParser } from './mtn-parser';
import { AirtelParser } from './airtel-parser';
import { ParsedStatement, ParserResult } from './types';

export class MobileMoneyParser {
  /**
   * Auto-detect provider and parse mobile money statement
   */
  static async parseStatement(text: string): Promise<ParserResult> {
    const provider = this.detectProvider(text);
    
    if (!provider) {
      return {
        success: false,
        error: 'Unable to detect mobile money provider. Supported: MTN Mobile Money, Airtel Money',
      };
    }

    switch (provider) {
      case 'MTN':
        return MTNParser.parse(text);
      case 'Airtel':
        return AirtelParser.parse(text);
      default:
        return {
          success: false,
          error: `Unsupported provider: ${provider}`,
        };
    }
  }

  /**
   * Detect mobile money provider from statement text
   */
  private static detectProvider(text: string): 'MTN' | 'Airtel' | null {
    const upperText = text.toUpperCase();
    
    // MTN indicators
    const mtnIndicators = [
      'MTN MOBILE MONEY',
      'MTN MOMO',
      'MTN UGANDA',
      'MOBILE MONEY STATEMENT',
      'MM STATEMENT'
    ];

    // Airtel indicators
    const airtelIndicators = [
      'AIRTEL MONEY',
      'AIRTEL UGANDA',
      'AIRTEL AFRICA',
      'MONEY STATEMENT'
    ];

    // Check for MTN indicators
    if (mtnIndicators.some(indicator => upperText.includes(indicator))) {
      return 'MTN';
    }

    // Check for Airtel indicators
    if (airtelIndicators.some(indicator => upperText.includes(indicator))) {
      return 'Airtel';
    }

    // Fallback: check transaction patterns
    if (this.hasMTNPatterns(text)) {
      return 'MTN';
    }

    if (this.hasAirtelPatterns(text)) {
      return 'Airtel';
    }

    return null;
  }

  private static hasMTNPatterns(text: string): boolean {
    // Look for MTN-specific transaction patterns
    const mtnPatterns = [
      /Send Money to \d+/i,
      /You have received UGX/i,
      /Cash Out/i,
      /Cash In/i,
    ];

    return mtnPatterns.some(pattern => pattern.test(text));
  }

  private static hasAirtelPatterns(text: string): boolean {
    // Look for Airtel-specific transaction patterns
    const airtelPatterns = [
      /Transfer to \d+/i,
      /Received from \d+/i,
      /Cash withdrawal/i,
      /Cash deposit/i,
      /Merchant payment/i,
    ];

    return airtelPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Generate standardized CSV from parsed statement
   */
  static generateCSV(statement: ParsedStatement): string {
    const headers = [
      'Date',
      'Time', 
      'Type',
      'Description',
      'Amount',
      'Balance',
      'Counter Party',
      'Reference',
      'Provider'
    ];

    const rows = statement.transactions.map(transaction => [
      transaction.date,
      transaction.time,
      transaction.type,
      `"${transaction.description}"`, // Escape description for CSV
      transaction.amount.toFixed(2),
      transaction.balance.toFixed(2),
      transaction.counterParty || '',
      transaction.reference,
      transaction.provider
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Get statement summary
   */
  static getStatementSummary(statement: ParsedStatement) {
    const { transactions } = statement;
    
    const summary = {
      provider: statement.provider,
      period: statement.period,
      totalTransactions: transactions.length,
      openingBalance: statement.openingBalance,
      closingBalance: statement.closingBalance,
      
      // Transaction breakdown
      sent: {
        count: transactions.filter(t => t.type === 'Send').length,
        total: transactions.filter(t => t.type === 'Send').reduce((sum, t) => sum + t.amount, 0),
      },
      received: {
        count: transactions.filter(t => t.type === 'Receive').length,
        total: transactions.filter(t => t.type === 'Receive').reduce((sum, t) => sum + t.amount, 0),
      },
      withdrawals: {
        count: transactions.filter(t => t.type === 'Withdraw').length,
        total: transactions.filter(t => t.type === 'Withdraw').reduce((sum, t) => sum + t.amount, 0),
      },
      deposits: {
        count: transactions.filter(t => t.type === 'Deposit').length,
        total: transactions.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + t.amount, 0),
      },
      bills: {
        count: transactions.filter(t => t.type === 'Pay Bill').length,
        total: transactions.filter(t => t.type === 'Pay Bill').reduce((sum, t) => sum + t.amount, 0),
      },
      airtime: {
        count: transactions.filter(t => t.type === 'Buy Airtime').length,
        total: transactions.filter(t => t.type === 'Buy Airtime').reduce((sum, t) => sum + t.amount, 0),
      },
    };

    return summary;
  }
}

// Export all parsers
export { MTNParser } from './mtn-parser';
export { AirtelParser } from './airtel-parser';
export * from './types';