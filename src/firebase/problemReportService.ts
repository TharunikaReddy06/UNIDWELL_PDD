import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import { isValidEmail, createErrorResponse, createSuccessResponse, type APIResult } from '../utils/validationUtils';
import { withRetry } from '../utils/retryUtils';

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || "";
const BREVO_SENDER = import.meta.env.VITE_BREVO_SENDER || "support@unidwell.com";
const BREVO_SENDER_NAME = import.meta.env.VITE_BREVO_SENDER_NAME || "Unidwell";
const SUPPORT_NOTIFY_EMAIL = "support@unidwell.com";

export interface ProblemReportData {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  description: string;
}

/**
 * Generate unique Ticket ID (e.g., UNI-20260806-4921)
 */
function generateTicketId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `UNI-${year}${month}${day}-${random}`;
}

/**
 * Sends notification email to tharunikareddychennuru@gmail.com via Brevo
 */
async function sendSupportNotificationEmail(data: ProblemReportData & { ticketId: string; createdAtStr: string }): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER,
        },
        to: [
          {
            email: SUPPORT_NOTIFY_EMAIL,
            name: 'Unidwell Support Admin',
          },
        ],
        subject: `New Unidwell Problem Report - ${data.ticketId}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; margin-top: 0;">New Problem Report Received</h2>
            
            <p><strong>Ticket ID:</strong> <span style="color: #4f46e5; font-weight: bold;">${data.ticketId}</span></p>
            <p><strong>Name:</strong> ${data.fullName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Description:</strong></p>
            <div style="background-color: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #f3f4f6; font-size: 14px; white-space: pre-wrap;">
              ${data.description}
            </div>
            <p style="margin-top: 16px; font-size: 12px; color: #6b7280;"><strong>Submitted At:</strong> ${data.createdAtStr}</p>
          </div>
        `,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    return response.ok;
  } catch (err) {
    clearTimeout(timer);
    console.warn('Error sending Brevo support email notification:', err);
    return false;
  }
}

/**
 * Submit Problem Report
 */
export async function submitProblemReport(data: ProblemReportData): Promise<APIResult<{ ticketId: string }>> {
  if (!isValidEmail(data.email)) {
    return createErrorResponse('Invalid email address format.', 400);
  }
  if (!data.subject?.trim() || !data.description?.trim()) {
    return createErrorResponse('Subject and description are required.', 400);
  }

  try {
    const ticketId = generateTicketId();
    const createdAtStr = new Date().toLocaleString('en-GB');

    const ticketDocRef = doc(collection(db, 'supportTickets'));

    // Save to Firestore supportTickets collection with retry
    await withRetry(() => setDoc(ticketDocRef, {
      ticketId,
      uid: data.uid || '',
      fullName: data.fullName || 'User',
      email: data.email.trim(),
      phone: data.phone || '',
      subject: data.subject.trim(),
      category: data.category || 'General',
      description: data.description.trim(),
      status: 'OPEN',
      createdAt: serverTimestamp(),
    }));

    // Non-blocking background email notification
    sendSupportNotificationEmail({ ...data, ticketId, createdAtStr }).catch(e => console.warn(e));

    return createSuccessResponse({ ticketId }, 201);
  } catch (err: any) {
    console.error('Error submitting problem report:', err);
    return createErrorResponse(err.message || 'Failed to submit problem report.', 500);
  }
}
