import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth } from './auth';
import { db } from './firestore';
import { useStore, type RegisteredUser } from '../store/useStore';
import { isValidEmail, isValidPassword, createErrorResponse, createSuccessResponse, type APIResult } from '../utils/validationUtils';
import { firestoreCache } from './firestoreCache';
import { withRetry } from '../utils/retryUtils';

export interface OwnerSignupData {
  fullName: string;
  email: string;
  mobileNumber: string;
  aadhaarNumber?: string;
  aadhaarHolderName?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  verificationStatus?: string;
  profilePhoto?: string;
}

export interface StudentSignupData {
  fullName: string;
  email: string;
  mobileNumber?: string;
  collegeName?: string;
  registrationNumber?: string;
  course?: string;
  department?: string;
  academicYear?: string;
}

/**
 * Maps a Firestore owner/student document to the UI RegisteredUser format.
 */
export function mapFirestoreUserToAppUser(data: any, uid: string): RegisteredUser {
  const isOwner = data?.role === 'owner' || data?.role === 'OWNER';
  const isVerified = 
    data?.verificationStatus === 'VERIFIED' || 
    data?.verificationStatus === 'Verified' ||
    data?.verified === true || 
    data?.emailVerified === true;
  
  return {
    id: uid,
    name: data?.fullName || data?.name || (isOwner ? 'Property Owner' : 'Student'),
    email: data?.email || '',
    phone: data?.mobileNumber || data?.phone || '',
    role: isOwner ? 'OWNER' : 'STUDENT',
    verified: isVerified,
    verificationStatus: 'VERIFIED',
    avatar: data?.profilePhoto || data?.avatar || '',
    college: data?.collegeName || data?.college || '',
    
    // Student ID verification details
    studentRegNo: data?.registrationNumber || data?.studentIdNumber || data?.studentRegNo || '',
    studentIdCardImage: '',
    department: data?.department || '',
    course: data?.course || '',
    academicYear: data?.academicYear || '',

    // Owner Aadhaar verification details
    aadhaarNumber: data?.aadhaarNumber || '',
    aadhaarName: data?.aadhaarHolderName || data?.aadhaarName || '',
    dob: data?.dateOfBirth || data?.dob || '',
    gender: data?.gender || '',

    // Activity Status
    accountStatus: data?.accountStatus === 'active' || data?.accountStatus === 'Active' ? 'Active' : 'Inactive',
    lastLoginDate: data?.lastLoginDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    lastLoginTime: data?.lastLoginTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    lastLoginTimestamp: data?.lastLoginTimestamp || Date.now(),
  };
}

/**
 * Owner Signup: Create Firebase Auth account & store document in `owners/{uid}`
 */
export async function signUpOwner(
  email: string,
  pass: string,
  details: OwnerSignupData
): Promise<RegisteredUser> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address format.');
  }
  if (!isValidPassword(pass)) {
    throw new Error('Password must be at least 6 characters long.');
  }
  if (!details.fullName?.trim()) {
    throw new Error('Full name is required.');
  }

  try {
    let firebaseUser = auth.currentUser;
    let uid = firebaseUser?.uid;

    if (!firebaseUser || firebaseUser.email?.toLowerCase() !== email.toLowerCase()) {
      const userCredential = await withRetry(() => createUserWithEmailAndPassword(auth, email, pass));
      firebaseUser = userCredential.user;
      uid = firebaseUser.uid;
    }

    const ownerDocData = {
      uid: uid!,
      role: 'owner',
      fullName: details.fullName.trim(),
      email: email.toLowerCase().trim(),
      mobileNumber: details.mobileNumber?.trim() || '',
      aadhaarNumber: details.aadhaarNumber?.trim() || '',
      aadhaarHolderName: details.aadhaarHolderName?.trim() || details.fullName.trim(),
      gender: details.gender || 'Not Specified',
      dateOfBirth: details.dateOfBirth || '',
      verificationStatus: 'VERIFIED',
      verified: true,
      emailVerified: true,
      accountStatus: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      verifiedAt: serverTimestamp(),
    };

    await withRetry(() => setDoc(doc(db, 'owners', uid!), ownerDocData, { merge: true }));
    
    const appUser = mapFirestoreUserToAppUser(ownerDocData, uid!);
    firestoreCache.set(`user_${uid}`, appUser);
    return appUser;
  } catch (err: any) {
    console.error('Owner Signup Error:', err);
    throw new Error(err.message || 'Failed to complete Owner Signup.');
  }
}

/**
 * Student Signup: Create Firebase Auth account & store document in `students/{uid}`
 */
export async function signUpStudent(
  email: string,
  pass: string,
  details: StudentSignupData
): Promise<RegisteredUser> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address format.');
  }
  if (!isValidPassword(pass)) {
    throw new Error('Password must be at least 6 characters long.');
  }
  if (!details.fullName?.trim()) {
    throw new Error('Full name is required.');
  }

  try {
    let firebaseUser = auth.currentUser;
    let uid = firebaseUser?.uid;

    if (!firebaseUser || firebaseUser.email?.toLowerCase() !== email.toLowerCase()) {
      const userCredential = await withRetry(() => createUserWithEmailAndPassword(auth, email, pass));
      firebaseUser = userCredential.user;
      uid = firebaseUser.uid;
    }

    const studentDocData = {
      uid: uid!,
      fullName: details.fullName.trim(),
      email: email.toLowerCase().trim(),
      mobileNumber: details.mobileNumber?.trim() || '',
      collegeName: details.collegeName?.trim() || '',
      registrationNumber: details.registrationNumber?.trim() || '',
      course: details.course?.trim() || '',
      department: details.department?.trim() || '',
      academicYear: details.academicYear?.trim() || '',
      verificationStatus: 'VERIFIED',
      accountStatus: 'active',
      emailVerified: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await withRetry(() => setDoc(doc(db, 'students', uid!), studentDocData, { merge: true }));

    const appUser = mapFirestoreUserToAppUser(studentDocData, uid!);
    firestoreCache.set(`user_${uid}`, appUser);
    return appUser;
  } catch (err: any) {
    console.error('Student Signup Error:', err);
    throw new Error(err.message || 'Failed to complete Student Signup.');
  }
}

/**
 * Send Password Reset Email using Firebase Auth
 */
export async function sendFirebasePasswordReset(email: string): Promise<APIResult> {
  if (!isValidEmail(email)) {
    return createErrorResponse('Please provide a valid email address.', 400);
  }

  try {
    await withRetry(() => sendPasswordResetEmail(auth, email.trim()));
    return createSuccessResponse(null, 200);
  } catch (err: any) {
    console.error('Error sending password reset email:', err);
    let msg = 'Failed to send password reset email.';
    let status = 500;
    if (err.code === 'auth/user-not-found') {
      msg = 'No account found with this email address.';
      status = 404;
    } else if (err.code === 'auth/invalid-email') {
      msg = 'Invalid email address format.';
      status = 400;
    }
    return createErrorResponse(msg, status);
  }
}

/**
 * Login User: Sign in via Firebase Auth, read Firestore profile, enforce Firestore verificationStatus,
 * update `lastLogin = serverTimestamp()`, and return profile.
 */
export async function loginWithFirebase(
  email: string,
  pass: string,
  requiredRole: 'STUDENT' | 'OWNER'
): Promise<{ success: boolean; user?: RegisteredUser; error?: string; isUnverified?: boolean; status?: number }> {
  if (!isValidEmail(email)) {
    return { success: false, error: 'Invalid email address format.', status: 400 };
  }
  if (!isValidPassword(pass)) {
    return { success: false, error: 'Password must be at least 6 characters long.', status: 400 };
  }

  try {
    const userCredential = await withRetry(() => signInWithEmailAndPassword(auth, email.trim(), pass));
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;

    if (requiredRole === 'OWNER') {
      const ownerDocRef = doc(db, 'owners', uid);
      const ownerDoc = await getDoc(ownerDocRef);

      if (ownerDoc.exists()) {
        const data = ownerDoc.data();

        const isVerified = 
          data.verificationStatus === 'VERIFIED' || 
          data.verificationStatus === 'Verified' ||
          data.verified === true || 
          data.emailVerified === true;

        if (!isVerified) {
          return {
            success: false,
            status: 401,
            error: 'Please complete Email OTP verification.',
            isUnverified: true
          };
        }
        
        // Non-blocking lastLogin timestamp update
        updateDoc(ownerDocRef, {
          lastLogin: serverTimestamp(),
          accountStatus: 'active',
          updatedAt: serverTimestamp()
        }).catch(e => console.warn('Could not update owner lastLogin:', e));

        const appUser = mapFirestoreUserToAppUser({ ...data, accountStatus: 'active' }, uid);
        firestoreCache.set(`user_${uid}`, appUser);
        return { success: true, status: 200, user: appUser };
      }

      const studentDoc = await getDoc(doc(db, 'students', uid));
      if (studentDoc.exists()) {
        return { success: false, status: 400, error: 'This email is registered as a Student account. Please use Student Login.' };
      }

      return { success: false, status: 404, error: 'Owner account not found.' };
    } else {
      // Student Login Flow
      const studentDocRef = doc(db, 'students', uid);
      const studentDoc = await getDoc(studentDocRef);

      if (!studentDoc.exists()) {
        return { success: false, status: 401, error: 'Invalid email or password.' };
      }

      const data = studentDoc.data();
      const accountStatus = (data.accountStatus || '').toLowerCase();
      const verificationStatus = (data.verificationStatus || '').toUpperCase();

      if (accountStatus !== 'active' || verificationStatus !== 'VERIFIED') {
        return {
          success: false,
          status: 401,
          error: 'Invalid email or password.',
        };
      }

      // Non-blocking lastLogin timestamp update
      updateDoc(studentDocRef, {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(e => console.warn('Could not update student lastLogin:', e));

      const appUser = mapFirestoreUserToAppUser(data, uid);
      firestoreCache.set(`user_${uid}`, appUser);
      return { success: true, status: 200, user: appUser };
    }
  } catch (err: any) {
    console.error('Firebase Auth Login Error:', err);
    return { success: false, status: 401, error: 'Invalid email or password.' };
  }
}

/**
 * Fetch profile from Firestore by UID in parallel with caching.
 */
export async function fetchUserProfileFromFirestore(uid: string): Promise<RegisteredUser | null> {
  if (!uid) return null;

  const cached = firestoreCache.get<RegisteredUser>(`user_${uid}`);
  if (cached) return cached;

  try {
    const ownerRef = doc(db, 'owners', uid);
    const studentRef = doc(db, 'students', uid);

    // Parallel fetch for speed & 0 duplicate queries
    const [ownerSnap, studentSnap] = await Promise.all([
      getDoc(ownerRef),
      getDoc(studentRef)
    ]);

    if (ownerSnap.exists()) {
      const user = mapFirestoreUserToAppUser(ownerSnap.data(), uid);
      firestoreCache.set(`user_${uid}`, user);
      return user;
    }

    if (studentSnap.exists()) {
      const user = mapFirestoreUserToAppUser(studentSnap.data(), uid);
      firestoreCache.set(`user_${uid}`, user);
      return user;
    }
  } catch (e) {
    console.error('Error fetching user profile from Firestore:', e);
  }
  return null;
}

/**
 * Update User Profile in Firestore (`owners/{uid}` or `students/{uid}`).
 */
export async function updateUserProfileInFirestore(
  uid: string,
  role: 'STUDENT' | 'OWNER',
  updatedFields: Partial<RegisteredUser>
): Promise<void> {
  if (!uid) return;

  try {
    const collectionName = role === 'OWNER' ? 'owners' : 'students';
    const docRef = doc(db, collectionName, uid);

    const payload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (updatedFields.name !== undefined) {
      payload.fullName = updatedFields.name;
    }
    if (updatedFields.phone !== undefined) {
      payload.mobileNumber = updatedFields.phone;
    }

    await withRetry(() => setDoc(docRef, payload, { merge: true }));
    firestoreCache.invalidate(`user_${uid}`);
  } catch (e) {
    console.error('Error updating user profile in Firestore:', e);
    throw e;
  }
}

/**
 * Logout from Firebase Auth. Set owner accountStatus = "inactive" in Firestore.
 */
export async function logoutFromFirebase(): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      firestoreCache.invalidate(`user_${currentUser.uid}`);
      const ownerDocRef = doc(db, 'owners', currentUser.uid);
      await updateDoc(ownerDocRef, {
        accountStatus: 'inactive',
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      // Non-critical cleanup error
    }
  }
  firestoreCache.clear();
  await signOut(auth);
}

/**
 * Subscribe to Firebase Auth state changes using Firestore verification status.
 */
export function subscribeToAuthChanges(onUserChanged: (user: RegisteredUser | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    // If a logout operation is in progress, ignore incoming user restorations
    if (useStore.getState().isLoggingOut) {
      onUserChanged(null);
      return;
    }

    if (firebaseUser) {
      const userProfile = await fetchUserProfileFromFirestore(firebaseUser.uid);
      if (useStore.getState().isLoggingOut) {
        onUserChanged(null);
        return;
      }
      if (userProfile && (userProfile.verified || userProfile.verificationStatus === 'VERIFIED')) {
        onUserChanged(userProfile);
      } else {
        onUserChanged(null);
      }
    } else {
      const mockStr = localStorage.getItem('unidwell_mock_user');
      if (mockStr) {
        try {
          const parsed = JSON.parse(mockStr);
          if (parsed && parsed.id) {
            onUserChanged(parsed);
            return;
          }
        } catch (e) {}
      }
      onUserChanged(null);
    }
  });
}
