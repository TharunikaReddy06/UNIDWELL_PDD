import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import { app } from './firebase';

/**
 * Firebase Storage Instance
 * Exported for managing file uploads, downloads, and storage buckets.
 */
export const storage: FirebaseStorage = getStorage(app);
