import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import type { AppNotification } from '../types';
import { withRetry } from '../utils/retryUtils';

/**
 * Real-time listener for user notifications in Firestore `notifications` collection, sorted by createdAt desc.
 */
export function subscribeToUserNotifications(userId: string, onUpdate: (notifs: AppNotification[]) => void): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const qReceiver = query(
    collection(db, 'notifications'), 
    where('receiverUid', '==', userId)
  );

  return onSnapshot(qReceiver, (snapshot) => {
    const allNotifs = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const isReadVal = !!(data?.isRead ?? data?.read);
      
      let createdAtIso = new Date().toISOString();
      if (data?.createdAt?.toDate) {
        createdAtIso = data.createdAt.toDate().toISOString();
      } else if (typeof data?.createdAt === 'string') {
        createdAtIso = data.createdAt;
      } else if (data?.timestamp) {
        createdAtIso = data.timestamp;
      }

      return {
        id: docSnap.id,
        notificationId: data?.notificationId || docSnap.id,
        receiverUid: data?.receiverUid || data?.userId || userId,
        senderUid: data?.senderUid || '',
        title: data?.title || 'Notification',
        message: data?.message || '',
        type: data?.type || 'SUPPORT_REPLY',
        isRead: isReadVal,
        createdAt: createdAtIso,
        relatedPropertyId: data?.relatedPropertyId,
        relatedVisitId: data?.relatedVisitId,
        // Backward compatibility
        userId: data?.userId || data?.receiverUid || userId,
        read: isReadVal,
        timestamp: createdAtIso,
        link: data?.link,
      } as AppNotification;
    });

    // Defensive: never show notifications that were sent BY the current user
    const notifs = allNotifs.filter((n) => n.senderUid !== userId);

    // Sort descending by createdAt (newest first)
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(notifs);
  }, (error) => {
    console.warn('Notification listener fallback query:', error);
    const legacyQ = query(collection(db, 'notifications'), where('userId', '==', userId));
    return onSnapshot(legacyQ, (legacySnap) => {
      const legacyNotifs = legacySnap.docs.map((d) => {
        const data = d.data();
        const isReadVal = !!(data?.isRead ?? data?.read);
        return {
          id: d.id,
          notificationId: d.id,
          receiverUid: userId,
          senderUid: '',
          title: data?.title || '',
          message: data?.message || '',
          type: data?.type || 'SUPPORT_REPLY',
          isRead: isReadVal,
          createdAt: new Date().toISOString(),
          userId,
          read: isReadVal,
        } as AppNotification;
      });
      legacyNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(legacyNotifs);
    });
  });
}

/**
 * Creates and saves a notification document into Firestore `notifications/{notificationId}`.
 */
export async function addNotificationToFirestore(notifData: {
  receiverUid: string;
  senderUid: string;
  title: string;
  message: string;
  type: AppNotification['type'];
  relatedPropertyId?: string;
  relatedVisitId?: string;
}): Promise<void> {
  if (!notifData.receiverUid) return;

  try {
    const docRef = doc(collection(db, 'notifications'));
    const notificationId = docRef.id;

    await withRetry(() => setDoc(docRef, {
      notificationId,
      receiverUid: notifData.receiverUid,
      senderUid: notifData.senderUid,
      title: notifData.title,
      message: notifData.message,
      type: notifData.type,
      relatedPropertyId: notifData.relatedPropertyId || null,
      relatedVisitId: notifData.relatedVisitId || null,
      isRead: false,
      read: false,
      userId: notifData.receiverUid,
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Error adding notification to Firestore:', err);
  }
}

/**
 * Grouped Property View Notification: Aggregates view counts into a single notification document `view_notif_${propertyId}`.
 */
export async function createOrUpdateGroupedViewNotificationInFirestore(
  propertyId: string,
  ownerId: string,
  propertyTitle: string,
  viewCount: number
): Promise<void> {
  if (!propertyId || !ownerId) return;

  try {
    const notifId = `view_notif_${propertyId}`;
    const docRef = doc(db, 'notifications', notifId);

    await withRetry(() => setDoc(docRef, {
      notificationId: notifId,
      receiverUid: ownerId,
      senderUid: 'system',
      title: 'Your property was viewed 👀',
      message: `Your property "${propertyTitle}" has received ${viewCount} view${viewCount === 1 ? '' : 's'}.`,
      type: 'PROPERTY_VIEWS',
      relatedPropertyId: propertyId,
      isRead: false,
      read: false,
      userId: ownerId,
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString(),
    }, { merge: true }));
  } catch (err) {
    console.error('Error updating grouped view notification:', err);
  }
}

/**
 * Deletes a single notification document from Firestore `notifications/{notificationId}`.
 */
export async function deleteNotificationFromFirestore(notificationId: string): Promise<void> {
  if (!notificationId) return;
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await withRetry(() => deleteDoc(docRef));
  } catch (err) {
    console.error('Error deleting notification from Firestore:', err);
    throw err;
  }
}

/**
 * Deletes ALL notifications for a given user from Firestore `notifications`.
 */
export async function clearAllUserNotificationsInFirestore(userId: string): Promise<void> {
  if (!userId) return;

  try {
    const qReceiver = query(collection(db, 'notifications'), where('receiverUid', '==', userId));
    const qLegacy = query(collection(db, 'notifications'), where('userId', '==', userId));

    const [snap1, snap2] = await Promise.all([getDocs(qReceiver), getDocs(qLegacy)]);
    const docsToDelete = new Map();

    snap1.docs.forEach((d) => docsToDelete.set(d.id, d.ref));
    snap2.docs.forEach((d) => docsToDelete.set(d.id, d.ref));

    if (docsToDelete.size === 0) return;

    const batch = writeBatch(db);
    docsToDelete.forEach((ref) => batch.delete(ref));
    await batch.commit();
  } catch (err) {
    console.error('Error clearing all user notifications from Firestore:', err);
    throw err;
  }
}

/**
 * Marks all unread notifications for a user as read in Firestore (`isRead = true`).
 */
export async function markAllUserNotificationsReadInFirestore(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const qReceiver = query(
      collection(db, 'notifications'),
      where('receiverUid', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(qReceiver);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { isRead: true, read: true });
    });

    await batch.commit();
  } catch (err) {
    console.error('Error batch marking notifications read:', err);
  }
}

/**
 * Marks notifications matching specific types (e.g. `['INTERESTED_STUDENT', 'NEW_INTERESTED']`) as read for a user in Firestore (`isRead = true, read = true`).
 */
export async function markNotificationsReadByTypeInFirestore(userId: string, targetTypes: string[]): Promise<void> {
  if (!userId || !targetTypes.length) return;

  try {
    const qReceiver = query(
      collection(db, 'notifications'),
      where('receiverUid', '==', userId),
      where('isRead', '==', false)
    );

    const qLegacy = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const [snap1, snap2] = await Promise.all([getDocs(qReceiver), getDocs(qLegacy)]);
    const docsToUpdate = new Map();

    const checkMatch = (data: any) => {
      const type = data?.type || '';
      const title = (data?.title || '').toLowerCase();
      const message = (data?.message || '').toLowerCase();
      return (
        targetTypes.includes(type) ||
        (targetTypes.includes('INTERESTED_STUDENT') &&
          (type.toLowerCase().includes('interested') || title.includes('interested') || message.includes('interested')))
      );
    };

    snap1.docs.forEach((d) => {
      if (checkMatch(d.data())) docsToUpdate.set(d.id, d.ref);
    });

    snap2.docs.forEach((d) => {
      if (checkMatch(d.data())) docsToUpdate.set(d.id, d.ref);
    });

    if (docsToUpdate.size === 0) return;

    const batch = writeBatch(db);
    docsToUpdate.forEach((ref) => {
      batch.update(ref, { isRead: true, read: true });
    });

    await batch.commit();
  } catch (err) {
    console.error('Error marking notifications read by type in Firestore:', err);
  }
}
