import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './storage';

/**
 * Compresses an image File to a persistent Base64 Data URL using HTML5 Canvas.
 * This guarantees the image can be stored and retrieved universally across any browser/device.
 */
export async function fileToPersistentDataUrl(
  file: File,
  maxWidth = 1000,
  maxHeight = 750,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (!rawResult) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawResult);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          resolve(rawResult);
        }
      };
      img.onerror = () => {
        resolve(rawResult);
      };
      img.src = rawResult;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses a 360 Panorama image File to a high-resolution persistent Base64 Data URL.
 */
export async function fileTo360PanoramaDataUrl(
  file: File,
  maxWidth = 1600,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  return fileToPersistentDataUrl(file, maxWidth, maxHeight, quality);
}

/**
 * Upload Property Image to Firebase Storage bucket.
 * Target path: properties/{propertyId}/images/{timestamp}_{index}_{filename}
 * Returns the public Firebase Storage Download URL, or the persistent Data URL from the actual selected file.
 */
export async function uploadPropertyImage(
  propertyId: string,
  file: File,
  index = 0,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  if (!file) throw new Error('File is required for image upload.');
  if (!propertyId) throw new Error('Property ID is required for image upload.');

  const cleanName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : `image_${index}.jpg`;
  const timestamp = Date.now();
  const storagePath = `properties/${propertyId}/images/${timestamp}_${index}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const uploadPromise = uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timed out')), 4000)
    );

    const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    if (onProgress) onProgress(100);
    return downloadUrl;
  } catch (err: any) {
    console.warn('Firebase Storage upload unavailable, saving persistent file Data URL from selected file:', err);
    // Convert the ACTUAL selected file to a persistent compressed Data URL so the owner's exact photo is preserved
    return fileToPersistentDataUrl(file);
  }
}

/**
 * Upload 360 Panorama Media to Firebase Storage bucket.
 * Target path: properties/{propertyId}/360/{timestamp}_{filename}
 * Returns the public Firebase Storage Download URL, or the persistent Data URL from the actual selected file.
 */
export async function uploadProperty360Tour(
  propertyId: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  if (!file) throw new Error('File is required for 360 tour upload.');
  if (!propertyId) throw new Error('Property ID is required for 360 tour upload.');

  const cleanName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'panorama.jpg';
  const timestamp = Date.now();
  const storagePath = `properties/${propertyId}/360/${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const uploadPromise = uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage 360 upload timed out')), 5000)
    );

    const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    if (onProgress) onProgress(100);
    return downloadUrl;
  } catch (err: any) {
    console.warn('Firebase Storage 360 upload unavailable, saving persistent 360 Data URL from selected file:', err);
    // Convert the ACTUAL selected 360 file to a high-res persistent Data URL so the owner's exact 360 tour is preserved
    return fileTo360PanoramaDataUrl(file);
  }
}

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
