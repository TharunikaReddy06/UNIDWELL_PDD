import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './storage';

/**
 * Upload Student College ID Image or PDF to Firebase Storage bucket.
 * Target path: studentIds/{uid}/{timestamp}.{ext}
 * Returns the public Firebase Storage Download URL.
 */
export async function uploadStudentCollegeId(
  uid: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  if (!uid || !file) {
    throw new Error('User ID and File are required for storage upload.');
  }

  const extension = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const storagePath = `studentIds/${uid}/${timestamp}.${extension}`;
  const storageRef = ref(storage, storagePath);

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error('Firebase Storage Upload Error:', error);
          reject(new Error(error.message || 'Firebase Storage upload failed. Please check network/storage permissions.'));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err: any) {
            reject(new Error(err.message || 'Failed to retrieve storage download URL.'));
          }
        }
      );
    });
  } catch (err: any) {
    console.error('Error uploading file to Firebase Storage:', err);
    throw err;
  }
}
