/**
 * Email Service Adapter
 * Wraps OTP and email dispatches with robust validation and error handling.
 */

import { sendEmailOTP, verifyOTP as verifyOTPService } from "./otpService";
import { isValidEmail } from "../utils/validationUtils";

export async function sendOTP(email: string) {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address format.");
  }
  const result = await sendEmailOTP(email);
  if (!result.success) {
    throw new Error(result.error || "Failed to send OTP.");
  }
  return true;
}

export async function verifyOTP(email: string, enteredOTP: string) {
  if (!isValidEmail(email) || !enteredOTP) {
    return false;
  }
  const result = await verifyOTPService(email, enteredOTP);
  return result === true;
}
