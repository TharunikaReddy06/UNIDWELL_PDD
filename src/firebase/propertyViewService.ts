import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc,
  onSnapshot, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import type { PropertyViewRecord, User } from '../types';
import { withRetry } from '../utils/retryUtils';

/**
 * Record or update a student's view of a property in Firestore `propertyViews/{propertyId}_{studentUid}`.
 * Prevents duplicates while updating `lastViewedAt` timestamp.
 */
export async function recordPropertyViewInFirestore(
  propertyId: string, 
  ownerId: string, 
  propertyTitle: string,
  student: User
): Promise<void> {
  if (!propertyId || !ownerId || !student?.id) return;

  try {
    const viewDocId = `${propertyId}_${student.id}`;
    const docRef = doc(db, 'propertyViews', viewDocId);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Document exists: update lastViewedAt timestamp only to prevent duplicates
      await withRetry(() => updateDoc(docRef, {
        lastViewedAt: serverTimestamp(),
        viewedDate: dateStr,
        viewedTime: timeStr,
        studentName: student.name || 'Student',
        studentEmail: student.email || '',
        studentPhone: student.phone || '',
        collegeName: student.college || '',
        studentCollege: student.college || '',
        profileImage: student.avatar || '',
        studentAvatar: student.avatar || '',
      }));
    } else {
      // New unique view: create document
      const payload = {
        viewId: viewDocId,
        id: viewDocId,
        propertyId,
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
        status: 'Viewed',
        viewedAt: serverTimestamp(),
        lastViewedAt: serverTimestamp(),
        viewedDate: dateStr,
        viewedTime: timeStr,
      };

      await withRetry(() => setDoc(docRef, payload));
    }

    // Count unique views for this property to send a grouped view notification to owner
    const qCount = query(collection(db, 'propertyViews'), where('propertyId', '==', propertyId));
    const countSnap = await getDocs(qCount);
    const totalViews = countSnap.docs.length;

    // Real-time grouped notification to owner
    const { createOrUpdateGroupedViewNotificationInFirestore } = await import('./notificationService');
    await createOrUpdateGroupedViewNotificationInFirestore(propertyId, ownerId, propertyTitle, totalViews);
  } catch (err) {
    console.error('Error recording property view in Firestore:', err);
  }
}

/**
 * Real-time listener for Property Views where `ownerUid == ownerId` or `ownerId == ownerId`, sorted newest first by `lastViewedAt`.
 */
export function subscribeToOwnerPropertyViews(
  ownerId: string,
  onUpdate: (views: PropertyViewRecord[]) => void
): () => void {
  if (!ownerId) {
    onUpdate([]);
    return () => {};
  }

  const qUid = query(
    collection(db, 'propertyViews'),
    where('ownerUid', '==', ownerId)
  );

  const processDocs = (snapshotDocs: any[]) => {
    const viewsMap = new Map<string, PropertyViewRecord>();

    snapshotDocs.forEach((d) => {
      const data = d.data();
      const rawViewedAt = data.lastViewedAt?.toDate ? data.lastViewedAt.toDate() : (data.viewedAt?.toDate ? data.viewedAt.toDate() : new Date());
      const dateStr = rawViewedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = rawViewedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      const record: PropertyViewRecord = {
        id: d.id,
        viewId: d.id,
        propertyId: data.propertyId || '',
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
        status: data.status || 'Viewed',
        viewedAt: rawViewedAt.toISOString(),
        lastViewedAt: rawViewedAt.toISOString(),
        viewedDate: dateStr,
        viewedTime: timeStr,
      };

      viewsMap.set(d.id, record);
    });

    const list = Array.from(viewsMap.values());
    // Sort newest viewed first
    list.sort((a, b) => new Date(b.lastViewedAt || b.viewedAt).getTime() - new Date(a.lastViewedAt || a.viewedAt).getTime());
    onUpdate(list);
  };

  return onSnapshot(qUid, (snapshot) => {
    if (snapshot.empty) {
      // Fallback query for legacy ownerId field
      const qLegacy = query(collection(db, 'propertyViews'), where('ownerId', '==', ownerId));
      return onSnapshot(qLegacy, (legacySnap) => {
        processDocs(legacySnap.docs);
      });
    } else {
      processDocs(snapshot.docs);
    }
  }, (err) => {
    console.error('Error listening to property views in Firestore:', err);
  });
}
