import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { app } from './firebase';

/**
 * Firebase Authentication Instance
 * Exported for managing user authentication, sign-in, sign-up, and session state.
 */
export const auth: Auth = getAuth(app);
