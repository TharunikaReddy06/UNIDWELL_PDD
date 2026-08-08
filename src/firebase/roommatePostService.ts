import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import type { RoommatePost } from '../types';
import { withRetry } from '../utils/retryUtils';

/**
 * Real-time listener for `roommatePosts` collection in Firestore.
 */
export function subscribeToRoommatePosts(onUpdate: (posts: RoommatePost[]) => void): () => void {
  const q = query(collection(db, 'roommatePosts'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        authorId: data?.authorId || '',
        authorName: data?.authorName || 'Student',
        authorCollege: data?.authorCollege || '',
        authorAvatar: data?.authorAvatar || '',
        authorGender: data?.authorGender || 'ANY',
        type: data?.type || 'LOOKING_FOR_ROOMMATE',
        budget: data?.budget || 0,
        preferredLocation: data?.preferredLocation || '',
        moveInDate: data?.moveInDate || '',
        aboutMe: data?.aboutMe || '',
        description: data?.description || '',
        lifestyleTags: data?.lifestyleTags || [],
        createdAt: data?.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
      } as RoommatePost;
    });

    onUpdate(posts);
  }, (error) => {
    console.error('Error listening to roommatePosts from Firestore:', error);
  });
}

/**
 * Add new roommate post to Firestore `roommatePosts/{postId}`.
 */
export async function addRoommatePostToFirestore(post: RoommatePost): Promise<void> {
  try {
    const docRef = doc(collection(db, 'roommatePosts'));
    await withRetry(() => setDoc(docRef, {
      ...post,
      id: docRef.id,
      createdAt: serverTimestamp(),
    }));
  } catch (err) {
    console.error('Error adding roommate post to Firestore:', err);
    throw err;
  }
}

/**
 * Update roommate post in Firestore `roommatePosts/{postId}`.
 */
export async function updateRoommatePostInFirestore(id: string, updated: Partial<RoommatePost>): Promise<void> {
  if (!id) return;
  try {
    const ref = doc(db, 'roommatePosts', id);
    await withRetry(() => updateDoc(ref, updated));
  } catch (err) {
    console.error('Error updating roommate post in Firestore:', err);
    throw err;
  }
}

/**
 * Delete roommate post from Firestore `roommatePosts/{postId}`.
 */
export async function deleteRoommatePostFromFirestore(id: string): Promise<void> {
  if (!id) return;
  try {
    const ref = doc(db, 'roommatePosts', id);
    await withRetry(() => deleteDoc(ref));
  } catch (err) {
    console.error('Error deleting roommate post from Firestore:', err);
    throw err;
  }
}
