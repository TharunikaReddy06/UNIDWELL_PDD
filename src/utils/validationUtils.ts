/**
 * Standardized Input Validation & HTTP API Result Helpers
 * Enforces valid formats and consistent HTTP status reporting across Unidwell services.
 */

export interface APIResult<T = any> {
  success: boolean;
  status: number; // 200, 201, 400, 401, 404, 500
  data?: T;
  error?: string;
  isUnverified?: boolean;
}

export function createSuccessResponse<T>(data?: T, status = 200): APIResult<T> {
  return {
    success: true,
    status,
    data,
  };
}

export function createErrorResponse(error: string, status = 400, extra?: Partial<APIResult>): APIResult {
  return {
    success: false,
    status,
    error,
    ...extra,
  };
}

/**
 * Validates Email Format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates Password Minimum Requirements (Min 6 chars)
 */
export function isValidPassword(pass: string): boolean {
  return typeof pass === 'string' && pass.length >= 6;
}

/**
 * Validates 6-Digit Numeric OTP Code
 */
export function isValidOTP(otp: string): boolean {
  if (!otp) return false;
  return /^\d{6}$/.test(otp.trim());
}

/**
 * Validates Indian Phone / Mobile Number (10 digits)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return true; // Optional field in some forms
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 12;
}

/**
 * Validates Non-negative Numeric Amount (Rent, Price, Deposit)
 */
export function isValidAmount(val: any): boolean {
  if (val === null || val === undefined) return false;
  const num = Number(val);
  return !isNaN(num) && num >= 0;
}
