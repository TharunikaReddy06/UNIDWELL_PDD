import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firestore';
import { auth } from './auth';
import { isValidEmail, isValidOTP, createErrorResponse, createSuccessResponse, type APIResult } from '../utils/validationUtils';
import { withRetry } from '../utils/retryUtils';

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || "";
const BREVO_SENDER = import.meta.env.VITE_BREVO_SENDER || "support@unidwell.com";
const BREVO_SENDER_NAME = import.meta.env.VITE_BREVO_SENDER_NAME || "Unidwell";

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Save OTP to Cloud Firestore `emailOtps/{email}` with 5-minute expiration
 */
export async function saveOTP(email: string, otp: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000));

  await withRetry(() => setDoc(doc(db, 'emailOtps', cleanEmail), {
    email: cleanEmail,
    otp,
    verified: false,
    expiresAt,
    createdAt: Timestamp.now()
  }));
}

/**
 * Send OTP email via Brevo API
 */
export async function sendOTP(email: string, otp: string): Promise<APIResult> {
  if (!isValidEmail(email)) {
    return createErrorResponse('Invalid email address format.', 400);
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER
        },
        to: [
          {
            email: email.trim().toLowerCase()
          }
        ],
        subject: 'Unidwell Email Verification',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eee; rounded-radius: 12px;">
            <h2 style="color: #4f46e5; text-align: center;">Unidwell Verification</h2>
            <p>Your 6-digit email verification code is:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111827; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 13px; color: #6b7280; text-align: center;">This OTP is valid for only 5 minutes.</p>
          </div>
        `
      })
    });

    if (response.ok) {
      return createSuccessResponse(null, 200);
    }

    const errData = await response.json().catch(() => ({}));
    console.error('Brevo API Error:', errData);
    return createErrorResponse(errData.message || 'Failed to send verification email via Brevo.', 500);
  } catch (err: any) {
    console.error('Error sending OTP:', err);
    return createErrorResponse(err.message || 'Network error sending verification email.', 500);
  }
}

/**
 * Generate, save, and send Email OTP
 */
export async function sendEmailOTP(email: string): Promise<APIResult> {
  if (!isValidEmail(email)) {
    return createErrorResponse('Invalid email address format.', 400);
  }
  const otp = generateOTP();
  await saveOTP(email, otp);
  return await sendOTP(email, otp);
}

/**
 * Verify entered OTP against Firestore `emailOtps/{email}`
 * Returns: true | false | "expired"
 */
export async function verifyOTP(email: string, enteredOtp: string): Promise<boolean | 'expired'> {
  if (!isValidEmail(email) || !enteredOtp) {
    return false;
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const ref = doc(db, 'emailOtps', cleanEmail);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return false;
    }

    const data = snap.data();

    // Check expiration (5 minutes)
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      return 'expired';
    }

    // Check OTP match
    if (data.otp !== enteredOtp.trim()) {
      return false;
    }

    // Mark as verified in Firestore emailOtps document
    await updateDoc(ref, {
      verified: true,
      verifiedAt: Timestamp.now()
    });

    // Parallel check for logged-in user profile update
    const currentUser = auth.currentUser;
    if (currentUser) {
      const uid = currentUser.uid;
      const ownerRef = doc(db, 'owners', uid);
      const studentRef = doc(db, 'students', uid);

      const [ownerSnap, studentSnap] = await Promise.all([
        getDoc(ownerRef),
        getDoc(studentRef)
      ]);

      const verifyPayload = {
        verificationStatus: "VERIFIED",
        verified: true,
        emailVerified: true,
        verifiedAt: Timestamp.now()
      };

      if (ownerSnap.exists()) {
        setDoc(ownerRef, verifyPayload, { merge: true }).catch(e => console.warn(e));
      }
      if (studentSnap.exists()) {
        setDoc(studentRef, verifyPayload, { merge: true }).catch(e => console.warn(e));
      }
    }

    return true;
  } catch (err: any) {
    console.error('Error verifying OTP:', err);
    return false;
  }
}
