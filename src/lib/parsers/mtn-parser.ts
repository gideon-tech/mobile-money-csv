import { MobileMoneyTransaction, ParserResult } from './types';

/**
 * MTN Mobile Money statement parser.
 *
 * The PDF text (after extraction) is effectively one long line.
 * Each transaction has this structure — date and time are NOT space-separated:
 *
 *   DD-MM-YYYYhh:mm:ss  TYPE  Description  TxID  FromTo  UGXamount UGXfees UGXtaxes UGXbalance
 *
 * Example:
 *   19-09-202514:07:27 Cash Out Cash to RAPHAEAL35343306810 GIDEONMAKURAPHAEAL UGX20,000UGX 880UGX 100UGX 99,127
 *
 * Transaction types seen in real statements: Cash Out, Cash In, Transfer, Payment
 */
export class MTNParser {
  // Split the whole text into per-transaction chunks using the date+time boundary.
  // Date and time are concatenated with no space: DD-MM-YYYYhh:mm:ss
  private static readonly TX_SPLIT_RE = /(?=\d{2}-\d{2}-\d{4}\d{2}:\d{2}:\d{2})/;

  // Parse one transaction chunk.
  // Groups: date, time, type, description, txId, fromTo, amount, fees, taxes, balance
  private static readonly TX_RE =
    /^(\d{2}-\d{2}-\d{4})(\d{2}:\d{2}:\d{2})\s+(Cash Out|Cash In|Transfer|Payment)\s+(.*?)\s*(\d{9,12})\s+(.*?)\s*UGX\s*([\d,]+)\s*UGX\s*([\d,]+)\s*UGX\s*([\d,]+)\s*UGX\s*([\d,]+)/;

  // Mobile number from the statement header
  private static readonly MOBILE_RE = /Mobile Number\s+(\d+)/i;

  static parse(text: string): ParserResult {
    try {
      const accountMatch = text.match(this.MOBILE_RE);
      const accountNumber = accountMatch ? accountMatch[1] : 'Unknown';

      const { transactions, accountHolderFromName } = this.extractTransactions(text);

      // Second pass: fix Transfer direction now that we know the account holder name.
      // In outgoing transfers, the account holder is the "From" party.
      // In incoming transfers, the description says "Transfer to GIDEON" where GIDEON
      // is the account holder's first name (a prefix of the full From name e.g. "GIDEONMAKU").
      if (accountHolderFromName) {
        for (const tx of transactions) {
          if (tx.description.startsWith('Transfer to')) {
            const toName = tx.description.replace(/^Transfer to\s*/i, '').trim().toUpperCase();
            const holderUpper = accountHolderFromName.toUpperCase();
            // If the holder's name starts with the "to" name → this is incoming (Receive)
            tx.type = holderUpper.startsWith(toName) ? 'Receive' : 'Send';
          }
        }
      }

      // Transactions in the PDF are newest-first; period = last→first transaction date
      const dates = transactions.map((t) => t.date);
      const period =
        dates.length > 0
          ? { from: dates[dates.length - 1], to: dates[0] }
          : { from: 'Unknown', to: 'Unknown' };

      // Closing balance = the most recent transaction's balance
      const closingBalance = transactions.length > 0 ? transactions[0].balance : 0;

      return {
        success: true,
        data: {
          provider: 'MTN',
          accountNumber,
          period,
          openingBalance: 0,
          closingBalance,
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

  // ─── private helpers ───────────────────────────────────────────────────────

  private static extractTransactions(text: string): {
    transactions: MobileMoneyTransaction[];
    accountHolderFromName: string;
  } {
    const chunks = text
      .split(this.TX_SPLIT_RE)
      .map((c) => c.trim())
      .filter((c) => /^\d{2}-\d{2}-\d{4}/.test(c));

    const transactions: MobileMoneyTransaction[] = [];
    const cashOutFromTos: string[] = [];

    for (const chunk of chunks) {
      const result = this.parseChunk(chunk);
      if (!result) continue;
      transactions.push(result.tx);
      if (result.rawType === 'Cash Out' && result.fromTo) {
        cashOutFromTos.push(result.fromTo);
      }
    }

    // The account holder's "From" name is the common prefix across all Cash Out
    // From+To strings (e.g. "GIDEONMAKU" from "GIDEONMAKURAPHAEAL", "GIDEONMAKUSTELLA", …)
    const accountHolderFromName = this.longestCommonPrefix(cashOutFromTos);

    return { transactions, accountHolderFromName };
  }

  private static parseChunk(
    chunk: string
  ): { tx: MobileMoneyTransaction; rawType: string; fromTo: string } | null {
    const m = this.TX_RE.exec(chunk);
    if (!m) return null;

    const [, date, time, rawType, description, transactionId, fromTo, amountStr, feesStr, taxesStr, balanceStr] = m;

    const amount = this.parseAmount(amountStr);
    const fees   = this.parseAmount(feesStr);
    const taxes  = this.parseAmount(taxesStr);
    const balance = this.parseAmount(balanceStr);

    const type = this.mapType(rawType, description);
    const counterParty = this.extractCounterParty(description);

    const tx: MobileMoneyTransaction = {
      // Normalise date from DD-MM-YYYY → DD/MM/YYYY
      date: date.replace(/-/g, '/'),
      time,
      type,
      amount,
      fees,
      taxes,
      balance,
      reference: transactionId,
      transactionId,
      counterParty,
      description: description.trim(),
      provider: 'MTN',
    };

    return { tx, rawType, fromTo: fromTo.trim() };
  }

  /** Map the raw PDF transaction type to our internal type. */
  private static mapType(rawType: string, description: string): MobileMoneyTransaction['type'] {
    switch (rawType) {
      case 'Cash Out':
        return 'Withdraw';
      case 'Cash In':
        return 'Deposit';
      case 'Payment':
        // "Payment for Airtel", "Payment for MTN UGANDA LIMITED" → airtime/data
        if (/airtel|mtn\s*uganda\s*limited/i.test(description)) return 'Buy Airtime';
        return 'Pay Bill';
      case 'Transfer':
        // Direction (Send vs Receive) is resolved in the second pass after we know
        // the account holder's name. Default to Send until then.
        return 'Send';
      default:
        return 'Other';
    }
  }

  /** Extract the other party's name from the description text. */
  private static extractCounterParty(description: string): string | undefined {
    const m = description.match(/(?:to|for|from)\s+(.+)/i);
    return m ? m[1].trim() : undefined;
  }

  /** Parse a UGX amount string like "1,185,483" → 1185483 */
  private static parseAmount(raw: string): number {
    return parseFloat(raw.replace(/,/g, '')) || 0;
  }

  /** Find the longest common prefix across an array of strings. */
  private static longestCommonPrefix(strings: string[]): string {
    if (strings.length === 0) return '';
    let prefix = strings[0];
    for (const s of strings.slice(1)) {
      let i = 0;
      while (i < prefix.length && i < s.length && prefix[i] === s[i]) i++;
      prefix = prefix.slice(0, i);
      if (!prefix) break;
    }
    return prefix;
  }
}
