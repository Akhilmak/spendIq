// import SmsAndroid from 'react-native-get-sms-android';
import { PermissionsAndroid, Platform } from 'react-native';

export interface ParsedTransaction {
  amount: number;
  merchant: string;
  date: string;
  type: 'Expense' | 'Income';
  originalSmsId: string;
}

export const requestSmsPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: "SMS Finance Tracking Permission",
        message: "We need access to your SMS to automatically track financial transactions.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const fetchFinancialSms = (minDate: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    // Temporary bypass for testing
    console.log("SMS Native Module is bypassed. Returning empty payload.");
    resolve([]);
    /*
    const filter = {
      box: 'inbox',
      minDate: minDate, 
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: any) => {
        console.log('Failed with this error: ' + fail);
        reject(fail);
      },
      (count: number, smsList: string) => {
        const arr = JSON.parse(smsList);
        resolve(arr);
      }
    );
    */
  });
};

export const parseSmsToTransaction = (body: string, id: string, dateInMs: number): ParsedTransaction | null => {
  // Common bank SMS markers
  const lowerBody = body.toLowerCase();
  
  if (!lowerBody.includes('debited') && !lowerBody.includes('credited') && !lowerBody.includes('spent')) {
    return null;
  }

  // Regex to find amounts like Rs. 500.00, INR 34.5, $100
  const amountRegex = /(?:rs\.?|inr|\$|usd|₹)\s*([\w,]+\.?\d*)/i;
  const match = body.match(amountRegex);
  
  if (!match) return null;
  
  const amountStr = match[1].replace(/,/g, '');
  const amount = parseFloat(amountStr);
  
  if (isNaN(amount)) return null;

  const type: 'Expense' | 'Income' = (lowerBody.includes('credited') && !lowerBody.includes('debited')) ? 'Income' : 'Expense';

  // Naive merchant extraction: "at Amazon" or "to Starbucks"
  let merchant = "Unknown Merchant";
  const atMatch = body.match(/at\s+([A-Za-z0-9\s]+?)(?:on|\.|$)/i);
  if (atMatch && atMatch[1]) {
    merchant = atMatch[1].trim();
  } else {
    const toMatch = body.match(/to\s+([A-Za-z0-9\s]+?)(?:on|\.|$)/i);
    if (toMatch && toMatch[1]) {
      merchant = toMatch[1].trim();
    }
  }

  // Fallback: If merchant is too generic, clamp it
  if (merchant.length > 20) {
    merchant = merchant.substring(0, 20);
  }

  return {
    amount,
    type,
    merchant,
    date: new Date(dateInMs).toISOString(),
    originalSmsId: id
  };
};
