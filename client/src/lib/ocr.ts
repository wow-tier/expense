import Tesseract from 'tesseract.js';

export interface OCRResult {
  vendor: string;
  date: string;
  time: string;
  total: string;
  items: Array<{
    name: string;
    quantity: string;
    price: string;
  }>;
}

export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => console.log(m)
    });
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

export function parseReceiptText(text: string): OCRResult {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Extract vendor (usually first meaningful line)
  const vendor = findVendor(lines);
  
  // Extract date and time
  const { date, time } = findDateTime(lines);
  
  // Extract total amount
  const total = findTotal(lines);
  
  // Extract items
  const items = findItems(lines);
  
  return {
    vendor: vendor || 'Unknown Vendor',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '12:00',
    total: total || '0.00',
    items: items.length > 0 ? items : [{ name: 'Item 1', quantity: '1', price: total || '0.00' }]
  };
}

function findVendor(lines: string[]): string {
  // Look for vendor name in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && !line.match(/^\d/) && !line.includes('$')) {
      return line;
    }
  }
  return 'Unknown Vendor';
}

function findDateTime(lines: string[]): { date: string; time: string } {
  const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
  const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
  
  let date = '';
  let time = '';
  
  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (dateMatch && !date) {
      const [, month, day, year] = dateMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;
      date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    const timeMatch = line.match(timePattern);
    if (timeMatch && !time) {
      let [, hours, minutes, ampm] = timeMatch;
      if (ampm && ampm.toUpperCase() === 'PM' && parseInt(hours) !== 12) {
        hours = (parseInt(hours) + 12).toString();
      } else if (ampm && ampm.toUpperCase() === 'AM' && parseInt(hours) === 12) {
        hours = '00';
      }
      time = `${hours.padStart(2, '0')}:${minutes}`;
    }
  }
  
  return {
    date: date || new Date().toISOString().split('T')[0],
    time: time || '12:00'
  };
}

function findTotal(lines: string[]): string {
  const totalPattern = /(?:total|amount|sum)[:\s]*\$?(\d+\.?\d*)/i;
  const pricePattern = /\$(\d+\.?\d*)/;
  
  // Look for explicit total first
  for (const line of lines) {
    const totalMatch = line.match(totalPattern);
    if (totalMatch) {
      return parseFloat(totalMatch[1]).toFixed(2);
    }
  }
  
  // If no explicit total, find the largest amount
  let maxAmount = 0;
  for (const line of lines) {
    const priceMatch = line.match(pricePattern);
    if (priceMatch) {
      const amount = parseFloat(priceMatch[1]);
      if (amount > maxAmount) {
        maxAmount = amount;
      }
    }
  }
  
  return maxAmount > 0 ? maxAmount.toFixed(2) : '0.00';
}

function findItems(lines: string[]): Array<{ name: string; quantity: string; price: string }> {
  const items: Array<{ name: string; quantity: string; price: string }> = [];
  const itemPattern = /(.+?)\s+(\d+\.?\d*)\s*\$(\d+\.?\d*)/;
  const pricePattern = /\$(\d+\.?\d*)/;
  
  for (const line of lines) {
    const itemMatch = line.match(itemPattern);
    if (itemMatch) {
      const [, name, qty, price] = itemMatch;
      items.push({
        name: name.trim(),
        quantity: qty,
        price: parseFloat(price).toFixed(2)
      });
    } else {
      // Look for lines with prices that might be items
      const priceMatch = line.match(pricePattern);
      if (priceMatch && line.length > 10 && !line.toLowerCase().includes('total')) {
        const price = parseFloat(priceMatch[1]).toFixed(2);
        const name = line.replace(pricePattern, '').trim();
        if (name.length > 2) {
          items.push({
            name,
            quantity: '1',
            price
          });
        }
      }
    }
  }
  
  return items.slice(0, 10); // Limit to 10 items
}
