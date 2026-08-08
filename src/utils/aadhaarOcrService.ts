import { createWorker } from 'tesseract.js';

export interface ExtractedAadhaarData {
  name: string;
  aadhaarNumber: string; // Masked format: XXXX XXXX 1234
  rawAadhaarNumber: string;
  dob: string;
  gender: string;
  confidence: number;
}

/**
 * Perform real OCR on uploaded Aadhaar card using Tesseract.js.
 */
export async function processAadhaarOcr(
  imageSource: File | string,
  userGivenName?: string
): Promise<{ success: boolean; data?: ExtractedAadhaarData; error?: string }> {
  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imageSource);
    await worker.terminate();

    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 0;

    if (!rawText.trim()) {
      return {
        success: false,
        error: "We couldn't read your Aadhaar card clearly. Please upload a clearer image.",
      };
    }

    const parsed = parseAadhaarText(rawText, userGivenName);

    return {
      success: true,
      data: {
        ...parsed,
        confidence,
      },
    };
  } catch (err) {
    console.error('Aadhaar OCR error:', err);
    return {
      success: false,
      error: "We couldn't read your Aadhaar card clearly. Please upload a clearer image.",
    };
  }
}

export function parseAadhaarText(
  rawText: string,
  userGivenName?: string
): Omit<ExtractedAadhaarData, 'confidence'> {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let name = '';
  let rawAadhaarNumber = '';
  let maskedAadhaarNumber = 'Not Available';
  let dob = 'Not Available';
  let gender = 'Not Available';

  // 1. AADHAAR NUMBER EXTRACTION (12 digits, often 4-4-4 format)
  const aadhaarRegex = /\b(\d{4}\s?\d{4}\s?\d{4})\b/;
  for (const line of lines) {
    const match = line.match(aadhaarRegex);
    if (match && match[1]) {
      const cleanDigits = match[1].replace(/\s+/g, '');
      if (cleanDigits.length === 12) {
        rawAadhaarNumber = cleanDigits;
        const last4 = cleanDigits.slice(8);
        maskedAadhaarNumber = `XXXX XXXX ${last4}`;
        break;
      }
    }
  }

  // 2. DATE OF BIRTH / YEAR OF BIRTH
  const dobRegex = /(?:dob|date\s*of\s*birth|yob|year\s*of\s*birth)\s*[:\s-]*([0-9]{2}[\/-][0-9]{2}[\/-][0-9]{4}|[0-9]{4})/i;
  for (const line of lines) {
    const match = line.match(dobRegex);
    if (match && match[1]) {
      dob = match[1].trim();
      break;
    }
  }

  if (dob === 'Not Available') {
    const standaloneDob = /\b([0-9]{2}[\/-][0-9]{2}[\/-][0-9]{4})\b/;
    for (const line of lines) {
      const match = line.match(standaloneDob);
      if (match && match[1]) {
        dob = match[1].trim();
        break;
      }
    }
  }

  // 3. GENDER EXTRACTION & STRICT NORMALIZATION (Check FEMALE first!)
  const upperRaw = rawText.toUpperCase();
  if (/\bFEMALE\b/.test(upperRaw) || /\bWOMAN\b/.test(upperRaw) || /\bF\b/.test(upperRaw)) {
    gender = 'Female';
  } else if (/\bMALE\b/.test(upperRaw) || /\bMAN\b/.test(upperRaw) || /\bM\b/.test(upperRaw)) {
    gender = 'Male';
  } else if (/\bTRANSGENDER\b/.test(upperRaw)) {
    gender = 'Transgender';
  }

  // 4. NAME EXTRACTION
  const nameLabelRegex = /(?:name)\s*[:\s-]+\s*([A-Za-z\s.]+)/i;
  for (const line of lines) {
    const match = line.match(nameLabelRegex);
    if (match && match[1]) {
      const val = match[1].trim();
      if (val.length >= 2 && !/^(government|india|unique|authority|aadhaar)$/i.test(val)) {
        name = val;
        break;
      }
    }
  }

  if (userGivenName) {
    if (!name || name.length < 3) {
      const nameParts = userGivenName.trim().split(/\s+/);
      const isMatch = nameParts.some((part) => part.length > 2 && new RegExp(part, 'i').test(rawText));
      if (isMatch) {
        name = userGivenName;
      }
    }
  }

  if (!name) {
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      const line = lines[i];
      if (/government|india|authority|unique|aadhaar|dob|date|male|female|father|address/i.test(line)) continue;
      if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line) || /^[A-Z\s.]{3,30}$/.test(line)) {
        name = line.trim();
        break;
      }
    }
  }

  return {
    name: name || userGivenName || 'Not Available',
    aadhaarNumber: maskedAadhaarNumber,
    rawAadhaarNumber: rawAadhaarNumber || 'Not Available',
    dob,
    gender,
  };
}
