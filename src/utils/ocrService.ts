import { createWorker } from 'tesseract.js';

export interface ExtractedIdData {
  studentName: string;
  collegeName: string;
  registrationNumber: string;
  course: string;
  department: string;
  academicYear: string;
  studentIdNumber: string;
  confidence: number;
  rawText: string;
}

/**
 * Preprocesses an image to improve OCR recognition accuracy:
 * 1. Converts to grayscale.
 * 2. Adjusts contrast.
 * 3. Sharpens the image using a 3x3 convolution kernel.
 */
export async function preprocessImageForOcr(
  imageSource: File | string
): Promise<HTMLCanvasElement | HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const url = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    img.src = url;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img);
          return;
        }

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Step 1: Grayscale & Step 2: Contrast Enhancement
        const contrast = 60; // scale: 0..100
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        const grayPixels = new Float32Array(width * height);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let gray = 0.299 * r + 0.587 * g + 0.114 * b;
          gray = factor * (gray - 128) + 128;
          if (gray < 0) gray = 0;
          if (gray > 255) gray = 255;

          const idx = i / 4;
          grayPixels[idx] = gray;
        }

        // Step 3: Sharpening Convolution Filter
        const outputData = ctx.createImageData(width, height);
        const out = outputData.data;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            let val = 0;

            if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
              const center = grayPixels[idx];
              const top = grayPixels[(y - 1) * width + x];
              const bottom = grayPixels[(y + 1) * width + x];
              const left = grayPixels[y * width + (x - 1)];
              const right = grayPixels[y * width + (x + 1)];

              val = 5 * center - top - bottom - left - right;
            } else {
              val = grayPixels[idx];
            }

            if (val < 0) val = 0;
            if (val > 255) val = 255;

            const px = idx * 4;
            out[px] = val;     // R
            out[px + 1] = val; // G
            out[px + 2] = val; // B
            out[px + 3] = 255; // Alpha
          }
        }

        ctx.putImageData(outputData, 0, 0);

        if (typeof imageSource !== 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }

        resolve(canvas);
      } catch (err) {
        console.error('Image preprocessing error, falling back to original:', err);
        resolve(img);
      }
    };

    img.onerror = (err) => {
      console.error('Failed to load image for preprocessing:', err);
      resolve(img);
    };
  });
}

/**
 * Perform real OCR strictly on the uploaded College ID image using Tesseract.js.
 * Uses canvas preprocessing (grayscale, contrast, sharpening) to maximize recognition accuracy.
 */
export async function processIdCardOcr(
  imageSource: File | string,
  userGivenName?: string
): Promise<{ success: boolean; data?: ExtractedIdData; error?: string }> {
  const UNABLE_READ_ERROR = "Unable to read the College ID clearly. Please upload a clearer image.";

  try {
    // 1. Preprocess image for OCR
    const enhancedSource = await preprocessImageForOcr(imageSource);

    // 2. Perform OCR using Tesseract worker
    const worker = await createWorker('eng');
    let ret = await worker.recognize(enhancedSource);
    
    // Fallback: If enhanced image produced empty result, try raw original image
    if (!ret.data.text || !ret.data.text.trim()) {
      ret = await worker.recognize(imageSource);
    }

    await worker.terminate();

    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 0;

    // Check minimum readable text length and confidence
    if (!rawText.trim() || rawText.trim().length < 8 || confidence < 15) {
      return {
        success: false,
        error: UNABLE_READ_ERROR,
      };
    }

    const parsed = parseIdCardText(rawText, userGivenName);

    // Verify if at least some meaningful text or fields were detected
    const hasAnyField = 
      Boolean(parsed.studentName) ||
      Boolean(parsed.registrationNumber) ||
      Boolean(parsed.collegeName) ||
      Boolean(parsed.course) ||
      Boolean(parsed.department) ||
      Boolean(parsed.academicYear) ||
      rawText.length >= 15;

    if (!hasAnyField) {
      return {
        success: false,
        error: UNABLE_READ_ERROR,
      };
    }

    return {
      success: true,
      data: {
        ...parsed,
        confidence,
        rawText,
      },
    };
  } catch (err) {
    console.error('Tesseract OCR error:', err);
    return {
      success: false,
      error: UNABLE_READ_ERROR,
    };
  }
}

/**
 * Intelligently parse ID card details from raw OCR text without hardcoded dummy data.
 * Extracts: Student Name, College Name, Registration Number / Roll Number, Course, Department, Academic Year, Student ID Number.
 */
export function parseIdCardText(
  rawText: string,
  userGivenName?: string
): Omit<ExtractedIdData, 'confidence' | 'rawText'> {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let studentName = '';
  let collegeName = '';
  let registrationNumber = '';
  let department = '';
  let course = '';
  let academicYear = '';
  let studentIdNumber = '';

  // 1. REGISTRATION / ROLL / STUDENT ID NUMBER DETECTION
  const regNoRegex = /(?:register|registration|reg|roll|student\s*id|id|adm|admission|enrollment|enroll|usn|ht|pin)[\s._#-]*[no.]*[:\s-]*([A-Za-z0-9\/-]{4,25})/i;
  for (const line of lines) {
    const match = line.match(regNoRegex);
    if (match && match[1] && !registrationNumber) {
      const val = match[1].trim();
      if (val.length >= 3 && !/^(name|dept|card|date|valid|male|female|student|course)$/i.test(val)) {
        registrationNumber = val;
        studentIdNumber = val;
        break;
      }
    }
  }

  // Fallback for Reg No: standalone code (e.g. 2111003010123, 22CSE104, RA2111003010123, 19104012, SIM202301)
  if (!registrationNumber) {
    const standaloneCodeRegex = /\b([A-Z0-9]{2,6}[-/\s]?[0-9]{3,12}[A-Z0-9]*)\b/i;
    for (const line of lines) {
      if (/college|university|institute|school|department|valid|dob|blood/i.test(line)) continue;
      const match = line.match(standaloneCodeRegex);
      if (match && match[1] && match[1].length >= 5 && /\d/.test(match[1])) {
        registrationNumber = match[1].trim();
        studentIdNumber = match[1].trim();
        break;
      }
    }
  }

  // 2. COLLEGE / UNIVERSITY NAME DETECTION
  const collegeKeywordsRegex = /(college|university|institute|academy|school|polytechnic|simats|vit|srm|iit|nit|jntu|anna|osmania|kl\s*university|amrita)/i;
  for (const line of lines) {
    if (collegeKeywordsRegex.test(line)) {
      const cleaned = line.replace(/^[^a-zA-Z]+/, '').trim();
      if (cleaned.length >= 4) {
        collegeName = cleaned;
        break;
      }
    }
  }

  // Header line fallback for College
  if (!collegeName && lines.length > 0) {
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      if (!/identity|card|student|name|roll|reg/i.test(lines[i]) && lines[i].length > 5) {
        collegeName = lines[i];
        break;
      }
    }
  }

  // 3. STUDENT NAME DETECTION
  const nameLabelRegex = /(?:name\s*of\s*student|student\s*name|holder\s*name|name)\s*[:\s-]+\s*([A-Za-z\s.]+)/i;
  for (const line of lines) {
    const match = line.match(nameLabelRegex);
    if (match && match[1]) {
      const val = match[1].trim();
      if (val.length >= 2 && !/^(of|the|is|student|card|id|college|dept)$/i.test(val)) {
        studentName = val;
        break;
      }
    }
  }

  // Fallback for Name: match with provided userGivenName if present on ID card
  if (userGivenName && (!studentName || studentName.length < 2)) {
    const nameParts = userGivenName.trim().split(/\s+/);
    const isMatch = nameParts.some((part) => part.length > 2 && new RegExp(part, 'i').test(rawText));
    if (isMatch) {
      studentName = userGivenName;
    }
  }

  // Fallback: Scan top lines for proper capitalized names
  if (!studentName) {
    for (let i = 0; i < Math.min(lines.length, 8); i++) {
      const line = lines[i];
      if (/college|university|institute|student|identity|card|reg|roll|dept|branch|valid|date|expiry/i.test(line)) continue;
      if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line) || /^[A-Z\s.]{3,30}$/.test(line)) {
        studentName = line.trim();
        break;
      }
    }
  }

  // 4. DEPARTMENT / COURSE / BRANCH DETECTION
  const deptRegex = /(?:department|dept|branch|course|stream|program|degree)\s*[:\s-]+\s*([A-Za-z0-9\s&.-]+)/i;
  for (const line of lines) {
    const match = line.match(deptRegex);
    if (match && match[1]) {
      department = match[1].trim();
      break;
    }
  }

  const courseRegex = /\b(computer science|cse|information technology|it|mechanical|civil|electrical|ece|eee|b\.tech|m\.tech|b\.e|b\.sc|m\.sc|mba|mca|ai\s*&\s*ds|aids|biotech|pharmacy|bba|bca|b\.arch)\b/i;
  if (!department) {
    for (const line of lines) {
      const match = line.match(courseRegex);
      if (match && match[0]) {
        department = line.trim();
        course = match[0].trim();
        break;
      }
    }
  } else {
    const match = department.match(courseRegex);
    course = match ? match[0].trim() : department;
  }

  // 5. ACADEMIC YEAR / YEAR OF STUDY / BATCH
  const yearRegex = /(?:academic\s*year|year|yr|batch|class|session)\s*[:\s-]+\s*([A-Za-z0-9\s-]+)/i;
  for (const line of lines) {
    const match = line.match(yearRegex);
    if (match && match[1]) {
      academicYear = match[1].trim();
      break;
    }
  }
  if (!academicYear) {
    const batchRangeRegex = /\b(20\d{2}\s*[-–/]\s*20?\d{2})\b/;
    for (const line of lines) {
      const match = line.match(batchRangeRegex);
      if (match && match[1]) {
        academicYear = match[1].trim();
        break;
      }
    }
  }
  if (!academicYear) {
    const yearPattern = /\b(1st|2nd|3rd|4th|i|ii|iii|iv)\s*(year|yr)\b/i;
    for (const line of lines) {
      const match = line.match(yearPattern);
      if (match && match[0]) {
        academicYear = match[0].trim();
        break;
      }
    }
  }

  return {
    studentName,
    collegeName,
    registrationNumber,
    course,
    department,
    academicYear,
    studentIdNumber: studentIdNumber || registrationNumber,
  };
}

