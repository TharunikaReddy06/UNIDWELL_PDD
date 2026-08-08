import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import { withRetry } from '../utils/retryUtils';

/**
 * Subscribe to saved room property IDs for a specific student in real time.
 */
export function subscribeToSavedRooms(userId: string, onUpdate: (savedPropertyIds: string[]) => void): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, 'savedRooms'), where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const savedIds = snapshot.docs.map((doc) => doc.data().propertyId as string);
    onUpdate(savedIds);
  }, (error) => {
    console.error('Error fetching saved rooms from Firestore:', error);
  });
}

/**
 * Toggle saved room state in Firestore `savedRooms/{docId}` (`userId_propertyId`).
 */
export async function toggleSavedRoomInFirestore(userId: string, propertyId: string, isCurrentlySaved: boolean): Promise<void> {
  if (!userId || !propertyId) return;

  try {
    const docId = `${userId}_${propertyId}`;
    const ref = doc(db, 'savedRooms', docId);

    if (isCurrentlySaved) {
      await withRetry(() => deleteDoc(ref));
    } else {
      await withRetry(() => setDoc(ref, {
        userId,
        propertyId,
        createdAt: serverTimestamp(),
      }));
    }
  } catch (err) {
    console.error('Error toggling saved room in Firestore:', err);
    throw err;
  }
}
