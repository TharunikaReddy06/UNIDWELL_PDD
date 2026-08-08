import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { app } from './firebase';

/**
 * Cloud Firestore Instance
 * Exported for performing database queries, document operations, and data synchronization.
 */
export const db: Firestore = getFirestore(app);
