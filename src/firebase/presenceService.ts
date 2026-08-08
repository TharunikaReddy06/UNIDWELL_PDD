import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firestore';

/**
 * Updates the user's online presence status in Firestore under `users/{uid}`.
 */
export async function setUserOnlineStatusInFirestore(uid: string, isOnline: boolean): Promise<void> {
  if (!uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      online: isOnline,
      lastSeen: serverTimestamp(),
    });
  } catch (err) {
    // Silently ignore if user doc does not exist yet or permission denied
    console.warn(`Presence update skipped for ${uid}:`, err);
  }
}

/**
 * Initializes window event listeners (`beforeunload`, `pagehide`, `visibilitychange`) to set user offline when closing tab.
 */
export function setupPresenceListeners(uid: string): () => void {
  if (!uid) return () => {};

  // Set online immediately
  setUserOnlineStatusInFirestore(uid, true);

  const setOffline = () => {
    setUserOnlineStatusInFirestore(uid, false);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      setUserOnlineStatusInFirestore(uid, false);
    } else if (document.visibilityState === 'visible') {
      setUserOnlineStatusInFirestore(uid, true);
    }
  };

  window.addEventListener('beforeunload', setOffline);
  window.addEventListener('pagehide', setOffline);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    setOffline();
    window.removeEventListener('beforeunload', setOffline);
    window.removeEventListener('pagehide', setOffline);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
