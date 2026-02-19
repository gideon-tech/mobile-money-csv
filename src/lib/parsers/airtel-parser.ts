import { MobileMoneyTransaction, ParsedStatement, ParserResult } from './types';

export class AirtelParser {
  private static readonly AIRTEL_PATTERNS = {
    // Airtel Money transaction patterns (different format from MTN)
    TRANSACTION_LINE: /(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(.*?)\s+([\d,]+)\s+([\d,]+)\s+([A-Z0-9]+)/g,
    SEND_MONEY: /Transfer to (\d+)/i,
    RECEIVE_MONEY: /Received from (\d+)/i,
    WITHDRAW: /Cash withdrawal|ATM withdrawal/i,
    DEPOSIT: /Cash deposit|Deposit from agent/i,
    AIRTIME: /Airtime purchase|Buy airtime/i,
    PAY_BILL: /Bill payment|Pay to/i,
    MERCHANT_PAYMENT: /Payment to merchant|Merchant payment/i,
    ACCOUNT_INFO: /Mobile Number[:\s]+(\d+)/i,
    PERIOD: /Period[:\s]+(\d{2}-\d{2}-\d{4})\s+to\s+(\d{2}-\d{2}-\d{4})/i,
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
        error: `Airtel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static extractStatementInfo(text: string): Omit<ParsedStatement, 'transactions' | 'totalTransactions'> {
    // Extract account number (mobile number for Airtel)
    const accountMatch = text.match(this.AIRTEL_PATTERNS.ACCOUNT_INFO);
    const accountNumber = accountMatch ? accountMatch[1] : 'Unknown';

    // Extract statement period
    const periodMatch = text.match(this.AIRTEL_PATTERNS.PERIOD);
    const period = periodMatch ? {
      from: this.convertAirtelDate(periodMatch[1]),
      to: this.convertAirtelDate(periodMatch[2]),
    } : {
      from: 'Unknown',
      to: 'Unknown',
    };

    // Extract opening balance
    const openingBalanceMatch = text.match(this.AIRTEL_PATTERNS.OPENING_BALANCE);
    const openingBalance = openingBalanceMatch ? 
      parseFloat(openingBalanceMatch[1].replace(/,/g, '')) : 0;

    // Extract closing balance
    const closingBalanceMatch = text.match(this.AIRTEL_PATTERNS.CLOSING_BALANCE);
    const closingBalance = closingBalanceMatch ? 
      parseFloat(closingBalanceMatch[1].replace(/,/g, '')) : 0;

    return {
      provider: 'Airtel',
      accountNumber,
      period,
      openingBalance,
      closingBalance,
    };
  }

  private static convertAirtelDate(airtelDate: string): string {
    // Convert Airtel date format (DD-MM-YYYY) to standard (DD/MM/YYYY)
    return airtelDate.replace(/-/g, '/');
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
    // Try to match the standard Airtel transaction format
    const match = this.AIRTEL_PATTERNS.TRANSACTION_LINE.exec(line);
    
    if (!match) {
      // Reset regex lastIndex for next iteration
      this.AIRTEL_PATTERNS.TRANSACTION_LINE.lastIndex = 0;
      return null;
    }

    const [, date, time, description, amountStr, balanceStr, reference] = match;
    
    // Reset regex lastIndex
    this.AIRTEL_PATTERNS.TRANSACTION_LINE.lastIndex = 0;

    // Convert Airtel date format
    const standardDate = this.convertAirtelDate(date);

    // Determine transaction type
    const type = this.determineTransactionType(description);
    
    // Extract counterparty if applicable
    const counterParty = this.extractCounterParty(description, type);

    return {
      date: standardDate,
      time,
      type,
      amount: parseFloat(amountStr.replace(/,/g, '')),
      balance: parseFloat(balanceStr.replace(/,/g, '')),
      reference,
      counterParty,
      description: description.trim(),
      transactionId: reference,
      provider: 'Airtel',
    };
  }

  private static determineTransactionType(description: string): MobileMoneyTransaction['type'] {
    if (this.AIRTEL_PATTERNS.SEND_MONEY.test(description)) return 'Send';
    if (this.AIRTEL_PATTERNS.RECEIVE_MONEY.test(description)) return 'Receive';
    if (this.AIRTEL_PATTERNS.WITHDRAW.test(description)) return 'Withdraw';
    if (this.AIRTEL_PATTERNS.DEPOSIT.test(description)) return 'Deposit';
    if (this.AIRTEL_PATTERNS.AIRTIME.test(description)) return 'Buy Airtime';
    if (this.AIRTEL_PATTERNS.PAY_BILL.test(description) || this.AIRTEL_PATTERNS.MERCHANT_PAYMENT.test(description)) {
      return 'Pay Bill';
    }
    return 'Other';
  }

  private static extractCounterParty(description: string, type: MobileMoneyTransaction['type']): string | undefined {
    if (type === 'Send') {
      const match = description.match(this.AIRTEL_PATTERNS.SEND_MONEY);
      return match ? match[1] : undefined;
    }
    
    if (type === 'Receive') {
      const match = description.match(this.AIRTEL_PATTERNS.RECEIVE_MONEY);
      return match ? match[1] : undefined;
    }

    // Extract merchant name for bill payments
    if (type === 'Pay Bill') {
      const merchantMatch = description.match(/to\s+(.+?)(?:\s|$)/i);
      return merchantMatch ? merchantMatch[1].trim() : undefined;
    }

    return undefined;
  }
}