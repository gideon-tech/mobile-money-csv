import { MobileMoneyParser } from '@/lib/parsers';

// Test MTN statement text
const sampleMTNText = `
MTN Mobile Money Statement
Account Number: 256701234567
Statement Period: 01/02/2024 to 28/02/2024
Opening Balance: UGX 150,000

Date       Time     Description                    Amount    Balance    Reference
01/02/2024 09:15:30  Send Money to 256702345678    50,000    100,000    MM2402010001
02/02/2024 14:22:15  You have received UGX 75,000 from 256703456789  75,000  175,000  MM2402020002
03/02/2024 11:45:00  Cash Out at Agent             20,000    155,000    MM2402030003
04/02/2024 16:30:45  Buy Airtime                   5,000     150,000    MM2402040004

Closing Balance: UGX 150,000
`;

// Test Airtel statement text  
const sampleAirtelText = `
Airtel Money Statement
Mobile Number: 256705678901
Period: 01-02-2024 to 28-02-2024
Opening Balance: UGX 100,000

Date       Time     Description                    Amount    Balance    Reference
01-02-2024 10:15:30  Transfer to 256706789012      30,000    70,000     AR2402010001
02-02-2024 15:22:15  Received from 256707890123    40,000    110,000    AR2402020002
03-02-2024 12:45:00  Cash withdrawal               15,000    95,000     AR2402030003
04-02-2024 17:30:45  Merchant payment to Shop ABC  10,000    85,000     AR2402040004

Closing Balance: UGX 85,000
`;

export async function testParsers() {
  console.log('🧪 Testing MTN Parser...');
  const mtnResult = await MobileMoneyParser.parseStatement(sampleMTNText);
  console.log('MTN Result:', mtnResult);
  
  if (mtnResult.success && mtnResult.data) {
    const mtnCSV = MobileMoneyParser.generateCSV(mtnResult.data);
    console.log('MTN CSV:', mtnCSV);
  }

  console.log('\n🧪 Testing Airtel Parser...');
  const airtelResult = await MobileMoneyParser.parseStatement(sampleAirtelText);
  console.log('Airtel Result:', airtelResult);
  
  if (airtelResult.success && airtelResult.data) {
    const airtelCSV = MobileMoneyParser.generateCSV(airtelResult.data);
    console.log('Airtel CSV:', airtelCSV);
  }
}