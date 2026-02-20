import { MobileMoneyTransaction, ParserResult } from './types';

/**
 * Airtel Money Uganda statement parser.
 *
 * After PDF text extraction the text is collapsed — dates, times and
 * transaction IDs are concatenated with no spaces:
 *
 *   {12-digit TxID}{DD-MM-YY}{HH:MM}{AM|PM} {description} Transaction Successful {amount} {Credit|Debit} {fee}{balance}
 *
 * Examples (spaces shown only where they actually appear in the extracted text):
 *   13713103560420-12-2502:11PM Paid to 1097545 Bundles Mobile APP Bundles Mobile APP Transaction Successful 500.00 Debit 0.0065,359.50
 *   137133041958 20-12-2502:42PM Sent Money to 752948722 , LUBEGA MARKWASSWA Transaction Successful 30,880.00 Debit 500.0033,979.50
 *
 * Note: fee and balance are also concatenated when fee ends in .00 (e.g. "0.0065,359.50").
 *
 * Statement header:
 *   Mobile Number:   709599591
 *   Statement Period:   20-Dec-25 to 20-Feb-26
 *   Opening Balance:   Ugx 65,859.50
 *   Closing Balance:   Ugx 16,935.50
 */
export class AirtelParser {
  // Split on: {12-digit TxID}{optional space}{DD-MM-YY}{HH:MM}{AM|PM}
  private static readonly TX_SPLIT_RE =
    /(?=\d{12}\s*\d{2}-\d{2}-\d{2}\d{2}:\d{2}[AP]M)/;

  // Parse one chunk. Groups:
  //  1 txId  2 date(DD-MM-YY)  3 time(HH:MM)  4 period(AM|PM)
  //  5 description  6 amount  7 direction(Credit|Debit)  8 fee  9 balance
  // Fee and balance may be concatenated (no space), so fee uses non-greedy match.
  private static readonly TX_RE =
    /^(\d{12})\s*(\d{2}-\d{2}-\d{2})(\d{2}:\d{2})([AP]M)\s+([\s\S]*?)\s*Transaction Successful\s+([\d,]+\.\d{2})\s+(Credit|Debit)\s+([\d,]+?\.\d{2})\s*([\d,]+\.\d{2})/;

  private static readonly MOBILE_RE  = /Mobile Number[:\s]+(\d+)/i;
  private static readonly PERIOD_RE  =
    /Statement Period[:\s]+(\d{2}-[A-Za-z]+-\d{2})\s+to\s+(\d{2}-[A-Za-z]+-\d{2})/i;
  private static readonly OPENING_RE = /Opening Balance[:\s]+Ugx\s*([\d,]+\.\d{2})/i;
  private static readonly CLOSING_RE = /Closing Balance[:\s]+Ugx\s*([\d,]+\.\d{2})/i;

  static parse(text: string): ParserResult {
    try {
      const accountNumber = text.match(this.MOBILE_RE)?.[1] ?? 'Unknown';

      const periodMatch = text.match(this.PERIOD_RE);
      const period = periodMatch
        ? { from: this.convertPeriodDate(periodMatch[1]), to: this.convertPeriodDate(periodMatch[2]) }
        : { from: 'Unknown', to: 'Unknown' };

      const openingBalance = this.parseAmount(text.match(this.OPENING_RE)?.[1] ?? '0');
      const closingBalance = this.parseAmount(text.match(this.CLOSING_RE)?.[1] ?? '0');

      const transactions = text
        .split(this.TX_SPLIT_RE)
        .map((c) => c.trim())
        .filter((c) => /^\d{12}/.test(c))
        .map((c) => this.parseChunk(c))
        .filter((t): t is MobileMoneyTransaction => t !== null);

      return {
        success: true,
        data: {
          provider: 'Airtel',
          accountNumber,
          period,
          openingBalance,
          closingBalance,
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

  // ─── private helpers ───────────────────────────────────────────────────────

  private static parseChunk(chunk: string): MobileMoneyTransaction | null {
    const m = this.TX_RE.exec(chunk);
    if (!m) return null;

    const [, txId, rawDate, rawTime, rawPeriod, rawDesc, amountStr, direction, feeStr, balanceStr] = m;

    // Collapse any remaining whitespace / newlines in the description
    const description = rawDesc.replace(/\s+/g, ' ').trim();

    const type = this.mapType(description, direction);
    const counterParty = this.extractCounterParty(description, type);

    return {
      date: this.convertTxDate(rawDate),
      time: this.convertTime(rawTime, rawPeriod),
      type,
      description,
      amount: this.parseAmount(amountStr),
      fees: this.parseAmount(feeStr),
      taxes: 0,
      balance: this.parseAmount(balanceStr),
      counterParty,
      reference: txId,
      transactionId: txId,
      provider: 'Airtel',
    };
  }

  private static mapType(description: string, direction: string): MobileMoneyTransaction['type'] {
    if (/Sent Money to/i.test(description)) return 'Send';
    if (/Received (from|From|Money from)/i.test(description)) return 'Receive';
    if (/Paid to .+?(Bundles|Prepaid Mobile App|Data bundle)/i.test(description)) return 'Buy Airtime';
    if (/Paid to/i.test(description)) return 'Pay Bill';
    // Fallback: use Credit/Debit direction
    return direction === 'Credit' ? 'Receive' : 'Send';
  }

  private static extractCounterParty(
    description: string,
    type: MobileMoneyTransaction['type']
  ): string | undefined {
    if (type === 'Send') {
      // "Sent Money to 752948722 , LUBEGA MARKWASSWA" → "LUBEGA MARKWASSWA"
      // "Sent Money to 703485388 NANTEGE MADINA ENTERPRISES NANTEGE MADINA ENTERPRISES" → "NANTEGE MADINA ENTERPRISES"
      // "Sent Money to 701588516SHANITAH NASSANGA" → "SHANITAH NASSANGA" (no space between number and name)
      const m = description.match(/Sent Money to \d+\s*,?\s*(.+)/i);
      return m ? this.dedup(m[1].trim()) : undefined;
    }

    if (type === 'Receive') {
      // With comma: "Received from 702833100 , GORRETH NANGOYE" → "GORRETH NANGOYE"
      //             "Received From 627992 , JESCA NAKANDA" → "JESCA NAKANDA"
      const commaMatch = description.match(/Received (?:Money )?(?:from|From) \d+\s*,\s*(.+)/i);
      if (commaMatch) return this.dedup(commaMatch[1].trim());

      // No comma, entity name directly follows ID (name duplicated in PDF):
      // "Received From 100101373 HOUSING FINANCE BANK LIMITED HOUSING FINANCE BANK LIMITED"
      if (/^Received From /i.test(description)) {
        const entityMatch = description.match(/^Received From \d+\s*(.+)/i);
        if (entityMatch) return this.dedup(entityMatch[1].trim());
      }

      // "Received Money from 100105152. Sender TID 7566213888" → return phone number
      const agentMatch = description.match(/Received Money from (\d+)/i);
      if (agentMatch) return agentMatch[1];

      return undefined;
    }

    if (type === 'Pay Bill' || type === 'Buy Airtime') {
      // "Paid to 4391279 UEDCL UEDCL" → "UEDCL"
      // "Paid to 1097545 Bundles Mobile APP Bundles Mobile APP" → "Bundles Mobile APP"
      const m = description.match(/Paid to \d+\s*(.+)/i);
      return m ? this.dedup(m[1].trim()) : undefined;
    }

    return undefined;
  }

  /**
   * Remove a name that the PDF repeats twice.
   * Handles both clean-space copies and concatenated copies (no space at join):
   *   "UEDCL UEDCL" → "UEDCL"
   *   "HOUSING FINANCE BANK LIMITEDHOUSING FINANCE BANK LIMITED" → "HOUSING FINANCE BANK LIMITED"
   *   "MC PREPAIDMC PREPAID" → "MC PREPAID"
   */
  private static dedup(name: string): string {
    const s = name.trim();
    const n = s.length;
    // Character-level: try every split from ~1/3 to 1/2 of the string length
    for (let i = Math.ceil(n / 3); i <= Math.floor((n + 1) / 2); i++) {
      const candidate = s.substring(0, i);
      const rest = s.substring(i).replace(/^\s+/, '');
      if (rest === candidate) return candidate;
    }
    // Word-level fallback (evenly split word list)
    const words = s.split(/\s+/);
    const wn = words.length;
    for (let split = 1; split <= Math.floor(wn / 2); split++) {
      if (wn !== split * 2) continue;
      const first = words.slice(0, split).join(' ');
      const second = words.slice(split).join(' ');
      if (first === second) return first;
    }
    return s;
  }

  /** "20-12-25" (DD-MM-YY) → "20/12/2025" */
  private static convertTxDate(raw: string): string {
    const [dd, mm, yy] = raw.split('-');
    return `${dd}/${mm}/20${yy}`;
  }

  /**
   * "20-Dec-25" (DD-Mon-YY from the Statement Period header) → "20/12/2025"
   */
  private static convertPeriodDate(raw: string): string {
    const MONTHS: Record<string, string> = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    };
    const m = raw.match(/^(\d{2})-([A-Za-z]{3})-(\d{2})$/);
    if (!m) return raw;
    return `${m[1]}/${MONTHS[m[2]] ?? '01'}/20${m[3]}`;
  }

  /** "02" + "11" + "PM" → "14:11:00" */
  private static convertTime(hhmm: string, period: string): string {
    const [hh, mm] = hhmm.split(':');
    let hours = parseInt(hh, 10);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mm}:00`;
  }

  /** "30,880.00" → 30880 */
  private static parseAmount(raw: string): number {
    return parseFloat(raw.replace(/,/g, '')) || 0;
  }
}
