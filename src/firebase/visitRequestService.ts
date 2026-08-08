import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import type { VisitRequest } from '../types';
import { withRetry } from '../utils/retryUtils';
import { addNotificationToFirestore } from './notificationService';

/**
 * Save a new Visit Request into Firestore `visitRequests` collection.
 */
export async function addVisitRequestToFirestore(request: Omit<VisitRequest, 'id'> & { id?: string }): Promise<string> {
  try {
    const docRef = doc(collection(db, 'visitRequests'));
    const requestId = docRef.id;

    const propTitle = request.propertyTitle || request.propertyName || 'Property';
    const reqDate = request.requestedDate || request.visitDate || '';
    const reqTime = request.requestedTime || request.visitTime || '';

    const newDoc = {
      requestId,
      id: requestId,
      propertyId: request.propertyId || '',
      ownerId: request.ownerId || '',
      studentId: request.studentId || '',
      studentName: request.studentName || 'Student',
      studentEmail: request.studentEmail || '',
      studentPhone: request.studentPhone || '',
      studentAvatar: request.studentAvatar || '',
      studentCollege: request.studentCollege || '',
      propertyTitle: propTitle,
      propertyName: propTitle,
      propertyAddress: request.propertyAddress || '',
      requestedDate: reqDate,
      visitDate: reqDate,
      requestedTime: reqTime,
      visitTime: reqTime,
      status: request.status || 'PENDING',
      createdAt: serverTimestamp(),
    };

    await withRetry(() => setDoc(docRef, newDoc));

    // Send real-time notification to property owner
    await addNotificationToFirestore({
      receiverUid: request.ownerId,
      senderUid: request.studentId,
      receiverRole: 'OWNER',
      senderRole: 'STUDENT',
      type: 'VISIT_REQUEST',
      title: 'New Property Visit Request',
      message: `${request.studentName} requested to visit "${propTitle}" on ${reqDate} at ${reqTime}`,
      relatedPropertyId: request.propertyId,
      relatedVisitId: requestId,
    });

    return requestId;
  } catch (err) {
    console.error('Error adding Visit Request to Firestore:', err);
    throw err;
  }
}

/**
 * Update Visit Request status (Accept / Reject / Reschedule) in Firestore.
 */
export async function updateVisitRequestStatusInFirestore(
  requestId: string, 
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Rescheduled' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED',
  newDate?: string,
  newTime?: string,
  studentId?: string,
  propertyName?: string,
  ownerId?: string,
  propertyId?: string
): Promise<void> {
  if (!requestId) return;

  try {
    const docRef = doc(db, 'visitRequests', requestId);
    const updates: Record<string, any> = { status };
    if (newDate) {
      updates.requestedDate = newDate;
      updates.visitDate = newDate;
    }
    if (newTime) {
      updates.requestedTime = newTime;
      updates.visitTime = newTime;
    }

    await withRetry(() => updateDoc(docRef, updates));

    // If studentId provided, send notification to student about the update
    if (studentId) {
      const propNameStr = propertyName || 'Property';
      let notifType: 'VISIT_ACCEPTED' | 'VISIT_REJECTED' | 'OWNER_REPLIED' = 'OWNER_REPLIED';
      let notifTitle = 'Visit Request Update';
      let notifMsg = `Owner updated your visit request status to ${status}`;

      if (status === 'Accepted' || status === 'ACCEPTED') {
        notifType = 'VISIT_ACCEPTED';
        notifTitle = 'Visit Request Accepted! 🎉';
        notifMsg = `Owner accepted your visit request for "${propNameStr}".`;
      } else if (status === 'Rejected' || status === 'REJECTED') {
        notifType = 'VISIT_REJECTED';
        notifTitle = 'Visit Request Declined';
        notifMsg = `Owner was unable to accept your visit request for "${propNameStr}".`;
      } else if (status === 'Rescheduled' || status === 'RESCHEDULED') {
        notifTitle = 'Visit Request Rescheduled';
        notifMsg = `Owner rescheduled your visit for "${propNameStr}" to ${newDate || ''} at ${newTime || ''}.`;
      }

      await addNotificationToFirestore({
        receiverUid: studentId,
        senderUid: ownerId || '',
        receiverRole: 'STUDENT',
        senderRole: 'OWNER',
        type: notifType,
        title: notifTitle,
        message: notifMsg,
        relatedPropertyId: propertyId,
        relatedVisitId: requestId,
      });
    }
  } catch (err) {
    console.error('Error updating Visit Request status in Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for Visit Requests in Firestore `visitRequests` filtered by user role.
 */
export function subscribeToUserVisitRequests(
  userId: string,
  userRole: 'STUDENT' | 'OWNER',
  onUpdate: (requests: VisitRequest[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const fieldToQuery = userRole === 'OWNER' ? 'ownerId' : 'studentId';
  const q = query(
    collection(db, 'visitRequests'), 
    where(fieldToQuery, '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const requests: VisitRequest[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const propTitle = data.propertyTitle || data.propertyName || 'Property';
      const reqDate = data.requestedDate || data.visitDate || '';
      const reqTime = data.requestedTime || data.visitTime || '';
      const rawStatus = data.status || 'Pending';

      return {
        id: doc.id,
        requestId: doc.id,
        propertyId: data.propertyId || '',
        ownerId: data.ownerId || '',
        studentId: data.studentId || '',
        studentName: data.studentName || 'Student',
        studentEmail: data.studentEmail || '',
        studentPhone: data.studentPhone || '',
        studentAvatar: data.studentAvatar || '',
        studentCollege: data.studentCollege || '',
        propertyTitle: propTitle,
        propertyName: propTitle,
        requestedDate: reqDate,
        visitDate: reqDate,
        requestedTime: reqTime,
        visitTime: reqTime,
        status: rawStatus,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    onUpdate(requests);
  }, (error) => {
    console.error('Error fetching Visit Requests from Firestore:', error);
  });
}
