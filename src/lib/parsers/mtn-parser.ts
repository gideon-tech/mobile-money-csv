import { MobileMoneyTransaction, ParsedStatement, ParserResult } from './types';

export class MTNParser {
  private static readonly MTN_PATTERNS = {
    // Common MTN Mobile Money transaction patterns
    TRANSACTION_LINE: /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(.*?)\s+([\d,]+)\s+([\d,]+)\s+([A-Z0-9]+)/g,
    SEND_MONEY: /Send Money to (\d+)/i,
    RECEIVE_MONEY: /You have received UGX ([\d,]+) from (\d+)/i,
    WITHDRAW: /Cash Out|Withdraw/i,
    DEPOSIT: /Cash In|Deposit/i,
    AIRTIME: /Buy Airtime|Airtime Purchase/i,
    PAY_BILL: /Pay Bill|Payment to/i,
    ACCOUNT_INFO: /Account Number[:\s]+(\d+)/i,
    PERIOD: /Statement Period[:\s]+(\d{2}\/\d{2}\/\d{4})\s+to\s+(\d{2}\/\d{2}\/\d{4})/i,
    OPENING_BALANCE: /Opening Balance[:\s]+UGX\s*([\d,]+)/i,
    CLOSING_BALANCE: /Closing Balance[:\s]+UGX\s*([\d,]+)/i,
  };

  static parse(text: string): ParserResult {
    try {
      const statement = this.extractStatementInfo(text);
      const transactions = this.extractTransactions(text);
      
      return {
        success: true,
        data: {
          ...statement,
          transactions,
          totalTransactions: transactions.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `MTN parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static extractStatementInfo(text: string): Omit<ParsedStatement, 'transactions' | 'totalTransactions'> {
    // Extract account number
    const accountMatch = text.match(this.MTN_PATTERNS.ACCOUNT_INFO);
    const accountNumber = accountMatch ? accountMatch[1] : 'Unknown';

    // Extract statement period
    const periodMatch = text.match(this.MTN_PATTERNS.PERIOD);
    const period = periodMatch ? {
      from: periodMatch[1],
      to: periodMatch[2],
    } : {
      from: 'Unknown',
      to: 'Unknown',
    };

    // Extract opening balance
    const openingBalanceMatch = text.match(this.MTN_PATTERNS.OPENING_BALANCE);
    const openingBalance = openingBalanceMatch ? 
      parseFloat(openingBalanceMatch[1].replace(/,/g, '')) : 0;

    // Extract closing balance
    const closingBalanceMatch = text.match(this.MTN_PATTERNS.CLOSING_BALANCE);
    const closingBalance = closingBalanceMatch ? 
      parseFloat(closingBalanceMatch[1].replace(/,/g, '')) : 0;

    return {
      provider: 'MTN',
      accountNumber,
      period,
      openingBalance,
      closingBalance,
    };
  }

  private static extractTransactions(text: string): MobileMoneyTransaction[] {
    const transactions: MobileMoneyTransaction[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const transaction = this.parseTransactionLine(line);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private static parseTransactionLine(line: string): MobileMoneyTransaction | null {
    // Try to match the standard transaction format
    const match = this.MTN_PATTERNS.TRANSACTION_LINE.exec(line);
    
    if (!match) {
      // Reset regex lastIndex for next iteration
      this.MTN_PATTERNS.TRANSACTION_LINE.lastIndex = 0;
      return null;
    }

    const [, date, time, description, amountStr, balanceStr, reference] = match;
    
    // Reset regex lastIndex
    this.MTN_PATTERNS.TRANSACTION_LINE.lastIndex = 0;

    // Determine transaction type
    const type = this.determineTransactionType(description);
    
    // Extract counterparty if applicable
    const counterParty = this.extractCounterParty(description, type);

    return {
      date,
      time,
      type,
      amount: parseFloat(amountStr.replace(/,/g, '')),
      balance: parseFloat(balanceStr.replace(/,/g, '')),
      reference,
      counterParty,
      description: description.trim(),
      transactionId: reference,
      provider: 'MTN',
    };
  }

  private static determineTransactionType(description: string): MobileMoneyTransaction['type'] {
    if (this.MTN_PATTERNS.SEND_MONEY.test(description)) return 'Send';
    if (this.MTN_PATTERNS.RECEIVE_MONEY.test(description)) return 'Receive';
    if (this.MTN_PATTERNS.WITHDRAW.test(description)) return 'Withdraw';
    if (this.MTN_PATTERNS.DEPOSIT.test(description)) return 'Deposit';
    if (this.MTN_PATTERNS.AIRTIME.test(description)) return 'Buy Airtime';
    if (this.MTN_PATTERNS.PAY_BILL.test(description)) return 'Pay Bill';
    return 'Other';
  }

  private static extractCounterParty(description: string, type: MobileMoneyTransaction['type']): string | undefined {
    if (type === 'Send') {
      const match = description.match(this.MTN_PATTERNS.SEND_MONEY);
      return match ? match[1] : undefined;
    }
    
    if (type === 'Receive') {
      const match = description.match(this.MTN_PATTERNS.RECEIVE_MONEY);
      return match ? match[2] : undefined;
    }

    return undefined;
  }
}