// Types for mobile money transactions
export interface MobileMoneyTransaction {
  date: string;
  time: string;
  type: 'Send' | 'Receive' | 'Withdraw' | 'Deposit' | 'Pay Bill' | 'Buy Airtime' | 'Other';
  amount: number;
  fees?: number;
  taxes?: number;
  balance: number;
  reference: string;
  counterParty?: string;
  description: string;
  transactionId: string;
  provider: 'MTN' | 'Airtel';
}

export interface ParsedStatement {
  provider: 'MTN' | 'Airtel';
  accountNumber: string;
  period: {
    from: string;
    to: string;
  };
  openingBalance: number;
  closingBalance: number;
  transactions: MobileMoneyTransaction[];
  totalTransactions: number;
}

export interface ParserResult {
  success: boolean;
  data?: ParsedStatement;
  error?: string;
}
