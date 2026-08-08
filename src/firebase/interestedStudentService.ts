import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import type { InterestedStudentRecord, User } from '../types';
import { withRetry } from '../utils/retryUtils';
import { addNotificationToFirestore } from './notificationService';

/**
 * Add or save a student interest record in Firestore `interestedStudents/{propertyId}_{studentUid}`.
 * Prevents duplicate creation.
 */
export async function addInterestedStudentToFirestore(
  propertyId: string, 
  propertyTitle: string,
  ownerId: string, 
  student: User,
  propertyLocation?: string,
  propertyImage?: string
): Promise<void> {
  if (!propertyId || !ownerId || !student?.id) return;

  try {
    const interestDocId = `${propertyId}_${student.id}`;
    const docRef = doc(db, 'interestedStudents', interestDocId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      // Document already exists, do not create duplicate
      return;
    }

    const payload = {
      interestId: interestDocId,
      id: interestDocId,
      propertyId,
      propertyTitle: propertyTitle || 'Property',
      propertyLocation: propertyLocation || '',
      propertyImage: propertyImage || '',
      ownerUid: ownerId,
      ownerId,
      studentUid: student.id,
      studentId: student.id,
      studentName: student.name || 'Student',
      studentEmail: student.email || '',
      studentPhone: student.phone || '',
      collegeName: student.college || 'SIMATS Engineering',
      studentCollege: student.college || 'SIMATS Engineering',
      profileImage: student.avatar || '',
      studentAvatar: student.avatar || '',
      status: 'Interested',
      createdAt: serverTimestamp(),
    };

    await withRetry(() => setDoc(docRef, payload));

    // Real-time notification to property owner
    await addNotificationToFirestore({
      receiverUid: ownerId,
      senderUid: student.id,
      type: 'INTERESTED_STUDENT',
      title: 'Student Interested',
      message: `${student.name || 'A student'} is interested in your property "${propertyTitle || 'Listing'}".`,
      relatedPropertyId: propertyId,
    });
  } catch (err) {
    console.error('Error adding interested student to Firestore:', err);
    throw err;
  }
}

/**
 * Toggle interest in Firestore: If interest exists, delete it; if not, create it.
 * Returns boolean indicating whether student is now interested.
 */
export async function toggleInterestedStudentInFirestore(
  propertyId: string,
  propertyTitle: string,
  ownerId: string,
  student: User,
  propertyLocation?: string,
  propertyImage?: string
): Promise<{ isInterested: boolean }> {
  if (!propertyId || !ownerId || !student?.id) return { isInterested: false };

  try {
    const interestDocId = `${propertyId}_${student.id}`;
    const docRef = doc(db, 'interestedStudents', interestDocId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      // Remove interest
      await withRetry(() => deleteDoc(docRef));
      return { isInterested: false };
    } else {
      // Add interest
      await addInterestedStudentToFirestore(propertyId, propertyTitle, ownerId, student, propertyLocation, propertyImage);
      return { isInterested: true };
    }
  } catch (err) {
    console.error('Error toggling interested student in Firestore:', err);
    throw err;
  }
}

/**
 * Remove an interest record from Firestore `interestedStudents/{interestId}` or `{propertyId}_{studentUid}`.
 */
export async function removeInterestedStudentFromFirestore(interestId: string): Promise<void> {
  if (!interestId) return;
  try {
    const docRef = doc(db, 'interestedStudents', interestId);
    await withRetry(() => deleteDoc(docRef));
  } catch (err) {
    console.error('Error removing interested student from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for Interested Students where `ownerUid == ownerId` or `ownerId == ownerId`, sorted newest first.
 */
export function subscribeToOwnerInterestedStudents(
  ownerId: string,
  onUpdate: (students: InterestedStudentRecord[]) => void
): () => void {
  if (!ownerId) {
    onUpdate([]);
    return () => {};
  }

  const qUid = query(
    collection(db, 'interestedStudents'),
    where('ownerUid', '==', ownerId)
  );

  const processDocs = (snapshotDocs: any[]) => {
    const recordsMap = new Map<string, InterestedStudentRecord>();

    snapshotDocs.forEach((d) => {
      const data = d.data();
      const rawCreatedAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      const createdDateStr = rawCreatedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const record: InterestedStudentRecord = {
        id: d.id,
        interestId: d.id,
        propertyId: data.propertyId || '',
        propertyTitle: data.propertyTitle || 'Property',
        propertyLocation: data.propertyLocation || '',
        propertyImage: data.propertyImage || '',
        ownerUid: data.ownerUid || data.ownerId || ownerId,
        ownerId: data.ownerId || data.ownerUid || ownerId,
        studentUid: data.studentUid || data.studentId || '',
        studentId: data.studentId || data.studentUid || '',
        studentName: data.studentName || 'Student',
        studentEmail: data.studentEmail || '',
        studentPhone: data.studentPhone || '',
        collegeName: data.collegeName || data.studentCollege || 'SIMATS Engineering',
        studentCollege: data.studentCollege || data.collegeName || 'SIMATS Engineering',
        profileImage: data.profileImage || data.studentAvatar || '',
        studentAvatar: data.studentAvatar || data.profileImage || '',
        status: data.status || 'Interested',
        createdAt: rawCreatedAt.toISOString(),
      };

      recordsMap.set(d.id, record);
    });

    const list = Array.from(recordsMap.values());
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  };

  return onSnapshot(qUid, (snapshot) => {
    if (snapshot.empty) {
      // Fallback query for legacy ownerId field
      const qLegacy = query(collection(db, 'interestedStudents'), where('ownerId', '==', ownerId));
      return onSnapshot(qLegacy, (legacySnap) => {
        processDocs(legacySnap.docs);
      });
    } else {
      processDocs(snapshot.docs);
    }
  }, (err) => {
    console.error('Error listening to interested students in Firestore:', err);
  });
}
