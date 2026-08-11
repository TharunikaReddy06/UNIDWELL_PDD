import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import type { Property, PropertyReview } from '../types';
import { isValidAmount } from '../utils/validationUtils';
import { withRetry } from '../utils/retryUtils';
import { firestoreCache } from './firestoreCache';

export interface PropertyFirestoreData {
  propertyId: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  collegeNearby: string;
  address: string;
  rent: number;
  advance: number;
  maintenanceFee: number;
  extraCharges: string | number;
  amenities: string[];
  images: string[];
  virtualTour: string;
  googleMapUrl?: string;
  googleMapsUrl?: string;
  status: 'available' | 'rented' | 'Published' | 'Rented' | 'Draft' | 'Inactive';
  views: number;
  interestedStudents: any[];
  rating?: number | null;
  reviewsCount?: number;
  reviews?: PropertyReview[];
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

export const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
export const DEFAULT_PANORAMA_TOUR = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80';

const KNOWN_SAMPLE_IMAGES = [
  'photo-1522771739844-6a9f6d5f14af',
  'photo-1598928506311-c55ded91a20c',
];

/**
 * Safely extracts and resolves all valid image URLs from any possible property document schema.
 * Checks primary image array fields first to preserve exact uploaded order without appending unrelated fields.
 * Cleans out any legacy sample images if real uploaded photos exist.
 */
export function extractPropertyImages(docData: any): string[] {
  if (!docData || typeof docData !== 'object') {
    return [DEFAULT_PROPERTY_IMAGE];
  }

  // Priority ordered candidate fields (check array fields first, then single image fields)
  const candidateKeys = [
    'images',
    'imageUrls',
    'propertyImages',
    'photos',
    'media',
    'gallery',
    'pictures',
    'image',
    'mainImage',
    'propertyImage',
    'imageUrl',
    'photoUrl',
    'picture',
    'coverImage',
    'thumbnail',
  ];

  const parseValueToUrls = (val: any): string[] => {
    if (!val) return [];
    const list: string[] = [];

    const addUrl = (item: any) => {
      if (!item) return;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        // Skip empty or temporary browser-only blob URLs
        if (!trimmed || trimmed.startsWith('blob:')) return;

        // Handle JSON array string
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              parsed.forEach(addUrl);
              return;
            }
          } catch { /* proceed as normal string */ }
        }

        // Handle comma-separated list of URLs (only for multiple http/https URLs, never split a single base64 data URL)
        if (trimmed.startsWith('http') && trimmed.includes(',')) {
          trimmed.split(',').forEach((sub) => {
            const subTrimmed = sub.trim();
            if (subTrimmed && !subTrimmed.startsWith('blob:') && !list.includes(subTrimmed)) {
              list.push(subTrimmed);
            }
          });
          return;
        }

        if (!list.includes(trimmed)) {
          list.push(trimmed);
        }
      } else if (typeof item === 'object' && item !== null) {
        // Extract from image object schemas (e.g. { url, downloadUrl, src, uri, link, secure_url, path })
        const objUrl = item.url || item.downloadUrl || item.src || item.uri || item.link || item.secure_url || item.path;
        if (typeof objUrl === 'string') {
          addUrl(objUrl);
        }
      }
    };

    if (Array.isArray(val)) {
      val.forEach(addUrl);
    } else {
      addUrl(val);
    }

    return list;
  };

  // 1. Check array fields in priority order
  for (const key of candidateKeys) {
    if (docData[key] !== undefined && docData[key] !== null) {
      const parsed = parseValueToUrls(docData[key]);
      if (parsed.length > 0) {
        // If there are real uploaded images alongside legacy sample images, prioritize real uploaded images
        const realUploaded = parsed.filter(
          (url) => !KNOWN_SAMPLE_IMAGES.some((sampleKey) => url.includes(sampleKey))
        );
        if (realUploaded.length > 0) {
          return realUploaded;
        }
        return parsed;
      }
    }
  }

  return [DEFAULT_PROPERTY_IMAGE];
}

/**
 * Safely extracts and resolves 360 virtual tour media URL across all schema variations.
 */
export function extract360TourUrl(docData: any): string {
  if (!docData || typeof docData !== 'object') return '';

  const candidateFields = [
    docData.panorama360Url,
    docData.virtualTour,
    docData.virtualTourUrl,
    docData.tour360,
    docData.tour360Url,
    docData.tourUrl,
    docData.panoramaUrl,
    docData.panorama,
    docData.panoramicImage,
    docData.panoramaImage,
    docData.view360,
    docData.tour,
    docData.tour360Degrees,
    docData.virtual_tour,
  ];

  for (const field of candidateFields) {
    if (!field) continue;
    if (typeof field === 'string') {
      const trimmed = field.trim();
      if (trimmed && !trimmed.startsWith('blob:')) {
        // If it's a known default sample 360 tour on an owner-created property that had no custom 360 upload, skip it
        if (trimmed === DEFAULT_PANORAMA_TOUR && docData.ownerId && docData.ownerId !== 'admin-demo') {
          continue;
        }
        return trimmed;
      }
    } else if (typeof field === 'object' && field !== null) {
      const objUrl = field.url || field.downloadUrl || field.src || field.uri || field.link;
      if (typeof objUrl === 'string' && objUrl.trim() && !objUrl.trim().startsWith('blob:')) {
        const trimmed = objUrl.trim();
        if (trimmed === DEFAULT_PANORAMA_TOUR && docData.ownerId && docData.ownerId !== 'admin-demo') {
          continue;
        }
        return trimmed;
      }
    }
  }

  return '';
}

/**
 * Maps a Firestore property document to the UI Property format.
 */
export function mapFirestoreDocToProperty(docData: any, docId: string): Property {
  const isRented = docData?.status === 'rented' || docData?.status === 'Rented' || docData?.available === false;
  const isAvailable = !isRented && (docData?.status === 'available' || docData?.status === 'Published' || docData?.available === true || !docData?.status);
  const rentVal = typeof docData?.rent === 'number' ? docData.rent : (typeof docData?.price === 'number' ? docData.price : 0);
  const advVal = typeof docData?.advance === 'number' ? docData.advance : (docData?.pricing?.securityDeposit || rentVal * 2);
  const maintVal = typeof docData?.maintenanceFee === 'number' ? docData.maintenanceFee : (docData?.pricing?.maintenanceFee || 0);

  // Robust image and 360 tour extraction
  const resolvedImages = extractPropertyImages(docData);
  const resolved360Url = extract360TourUrl(docData);

  // Reviews and rating calculation from real student reviews
  const rawReviews: any[] = Array.isArray(docData?.reviews) ? docData.reviews : [];
  const reviews: PropertyReview[] = rawReviews
    .filter((r) => r && typeof r === 'object')
    .map((r) => ({
      id: r.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      propertyId: r.propertyId || docData?.propertyId || docId,
      studentId: r.studentId || '',
      studentName: r.studentName || 'Verified Student',
      studentAvatar: r.studentAvatar,
      rating: typeof r.rating === 'number' ? Math.min(5, Math.max(1, r.rating)) : 5,
      comment: r.comment || '',
      createdAt: r.createdAt || new Date().toISOString(),
    }));

  let calculatedRating: number | undefined = undefined;
  let reviewsCount = reviews.length;

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    calculatedRating = Math.round((totalRating / reviews.length) * 10) / 10;
  } else if (typeof docData?.rating === 'number' && docData.rating > 0 && typeof docData?.reviewsCount === 'number' && docData.reviewsCount > 0) {
    calculatedRating = Math.round(docData.rating * 10) / 10;
    reviewsCount = docData.reviewsCount;
  }

  return {
    id: docData?.propertyId || docId,
    ownerId: docData?.ownerId || '',
    ownerName: docData?.ownerName || 'Property Owner',
    ownerPhone: docData?.ownerPhone || '',
    title: docData?.title || 'Property',
    description: docData?.description || '',
    price: rentVal,
    location: docData?.address || docData?.location || docData?.collegeNearby || '',
    type: docData?.roomType || docData?.propertyType || docData?.type || 'PRIVATE',
    collegeNearby: docData?.collegeNearby || '',
    fullAddress: docData?.address || docData?.fullAddress || '',
    googleMapUrl: docData?.googleMapUrl || docData?.googleMapsUrl || docData?.mapUrl || docData?.locationUrl || '',
    googleMapsUrl: docData?.googleMapUrl || docData?.googleMapsUrl || docData?.mapUrl || docData?.locationUrl || '',
    numberOfRooms: docData?.numberOfRooms || 1,
    numberOfBeds: docData?.numberOfBeds || 1,
    roomSizeSqFt: docData?.roomSizeSqFt || 250,
    images: resolvedImages,
    amenities: Array.isArray(docData?.amenities) ? docData.amenities : [],
    panorama360Url: resolved360Url,
    available: isAvailable,
    status: isRented ? 'Rented' : 'Published',
    rating: calculatedRating,
    reviewsCount: reviewsCount,
    reviews: reviews,
    viewsCount: typeof docData?.views === 'number' ? docData.views : (docData?.viewsCount || 0),
    viewedStudentIds: docData?.viewedStudentIds || [],
    viewLogs: docData?.viewLogs || [],
    interestedStudents: docData?.interestedStudents || [],
    createdAt: docData?.createdAt || new Date().toISOString(),
    pricing: docData?.pricing || {
      monthlyRent: rentVal,
      securityDeposit: advVal,
      maintenanceFee: maintVal,
      electricityCharges: 0,
      waterCharges: 0,
      parkingCharges: 0,
      extraCharges: docData?.extraCharges || '0',
      estimatedTotal: rentVal + maintVal,
    }
  };
}

/**
 * Add a new property document to Firestore `properties/{id}`
 */
export async function addPropertyToFirestore(property: Property): Promise<void> {
  if (!property.title?.trim()) {
    throw new Error('Property title is required.');
  }
  if (!isValidAmount(property.price)) {
    throw new Error('Property rent price must be a valid positive number.');
  }

  try {
    const propId = property.id || `prop-${Date.now()}`;
    const docRef = doc(db, 'properties', propId);

    const safeImages = Array.isArray(property.images) && property.images.length > 0
      ? property.images.filter((img) => typeof img === 'string' && img.trim().length > 0 && !img.startsWith('blob:'))
      : [DEFAULT_PROPERTY_IMAGE];
    const finalImages = safeImages.length > 0 ? safeImages : [DEFAULT_PROPERTY_IMAGE];
    const final360 = (typeof property.panorama360Url === 'string' && !property.panorama360Url.startsWith('blob:'))
      ? property.panorama360Url.trim()
      : '';
    const mapLocationUrl = (property.googleMapUrl || property.googleMapsUrl || '').trim();

    const payload: PropertyFirestoreData = {
      propertyId: propId,
      ownerId: property.ownerId || '',
      ownerName: property.ownerName || 'Property Owner',
      ownerPhone: property.ownerPhone || '',
      title: property.title.trim(),
      description: property.description?.trim() || '',
      propertyType: property.type || 'Apartment',
      roomType: property.type || 'Single Room',
      collegeNearby: property.collegeNearby || '',
      address: property.fullAddress || property.location || '',
      rent: property.price || 0,
      advance: property.pricing?.securityDeposit || (property.price ? property.price * 2 : 0),
      maintenanceFee: property.pricing?.maintenanceFee || 0,
      extraCharges: property.pricing?.extraCharges || '0',
      amenities: property.amenities || [],
      images: finalImages,
      imageUrls: finalImages,
      propertyImages: finalImages,
      image: finalImages[0] || DEFAULT_PROPERTY_IMAGE,
      mainImage: finalImages[0] || DEFAULT_PROPERTY_IMAGE,
      virtualTour: final360,
      panorama360Url: final360,
      tour360: final360,
      tour360Url: final360,
      googleMapUrl: mapLocationUrl,
      googleMapsUrl: mapLocationUrl,
      status: property.available ? 'available' : 'rented',
      views: property.viewsCount || 0,
      interestedStudents: property.interestedStudents || [],
      rating: property.rating !== undefined ? property.rating : null,
      reviewsCount: property.reviewsCount || (property.reviews ? property.reviews.length : 0),
      reviews: property.reviews || [],
      available: property.available,
      pricing: property.pricing,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await withRetry(() => setDoc(docRef, payload, { merge: true }));
    firestoreCache.invalidate('properties_all');
  } catch (err: any) {
    console.error('Error adding property to Firestore:', err);
    throw new Error(err.message || 'Failed to publish property.');
  }
}

/**
 * Add or update a real student review on a property in Firestore
 */
export async function addPropertyReviewInFirestore(
  propertyId: string, 
  newReview: PropertyReview
): Promise<{ averageRating: number; reviewsCount: number }> {
  if (!propertyId || !newReview) throw new Error('Property ID and review data are required.');

  try {
    const docRef = doc(db, 'properties', propertyId);
    const snap = await getDoc(docRef);
    const currentData = snap.exists() ? snap.data() : {};
    const existingReviews: PropertyReview[] = Array.isArray(currentData?.reviews) ? currentData.reviews : [];

    // Filter out existing review by same student if updating
    const otherReviews = existingReviews.filter((r) => r.studentId !== newReview.studentId);
    const updatedReviews = [newReview, ...otherReviews];
    const total = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((total / updatedReviews.length) * 10) / 10;

    await withRetry(() => updateDoc(docRef, {
      reviews: updatedReviews,
      reviewsCount: updatedReviews.length,
      rating: averageRating,
      updatedAt: serverTimestamp(),
    }));

    firestoreCache.invalidate('properties_all');
    return { averageRating, reviewsCount: updatedReviews.length };
  } catch (err: any) {
    console.error('Error adding review in Firestore:', err);
    throw err;
  }
}

/**
 * Update property document in Firestore `properties/{id}`
 */
export async function updatePropertyInFirestore(propertyId: string, updatedFields: Partial<Property>): Promise<void> {
  if (!propertyId) return;

  try {
    const docRef = doc(db, 'properties', propertyId);
    const payload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (updatedFields.title !== undefined) payload.title = updatedFields.title;
    if (updatedFields.description !== undefined) payload.description = updatedFields.description;
    if (updatedFields.price !== undefined) payload.rent = updatedFields.price;
    if (updatedFields.type !== undefined) {
      payload.propertyType = updatedFields.type;
      payload.roomType = updatedFields.type;
    }
    if (updatedFields.collegeNearby !== undefined) payload.collegeNearby = updatedFields.collegeNearby;
    if (updatedFields.fullAddress !== undefined || updatedFields.location !== undefined) {
      payload.address = updatedFields.fullAddress || updatedFields.location;
    }
    if (updatedFields.amenities !== undefined) payload.amenities = updatedFields.amenities;
    if (updatedFields.images !== undefined) {
      const safeImgs = Array.isArray(updatedFields.images)
        ? updatedFields.images.filter((img) => typeof img === 'string' && img.trim().length > 0 && !img.startsWith('blob:'))
        : [DEFAULT_PROPERTY_IMAGE];
      const validList = safeImgs.length > 0 ? safeImgs : [DEFAULT_PROPERTY_IMAGE];
      payload.images = validList;
      payload.imageUrls = validList;
      payload.propertyImages = validList;
      payload.image = validList[0] || DEFAULT_PROPERTY_IMAGE;
      payload.mainImage = validList[0] || DEFAULT_PROPERTY_IMAGE;
    }
    if (updatedFields.panorama360Url !== undefined) {
      const safe360 = (typeof updatedFields.panorama360Url === 'string' && !updatedFields.panorama360Url.startsWith('blob:'))
        ? updatedFields.panorama360Url.trim()
        : '';
      payload.virtualTour = safe360;
      payload.panorama360Url = safe360;
      payload.tour360 = safe360;
      payload.tour360Url = safe360;
    }
    if (updatedFields.viewsCount !== undefined) payload.views = updatedFields.viewsCount;
    if (updatedFields.interestedStudents !== undefined) payload.interestedStudents = updatedFields.interestedStudents;

    if (updatedFields.status !== undefined) {
      if (updatedFields.status === 'Rented' || updatedFields.status === 'rented') {
        payload.status = 'rented';
        payload.available = false;
      } else {
        payload.status = 'available';
        payload.available = true;
      }
    }

    if (updatedFields.available !== undefined) {
      payload.available = updatedFields.available;
      payload.status = updatedFields.available ? 'available' : 'rented';
    }

    if (updatedFields.pricing !== undefined) {
      payload.pricing = updatedFields.pricing;
      if (updatedFields.pricing.monthlyRent !== undefined) payload.rent = updatedFields.pricing.monthlyRent;
      if (updatedFields.pricing.securityDeposit !== undefined) payload.advance = updatedFields.pricing.securityDeposit;
      if (updatedFields.pricing.maintenanceFee !== undefined) payload.maintenanceFee = updatedFields.pricing.maintenanceFee;
    }

    await withRetry(() => setDoc(docRef, payload, { merge: true }));
    firestoreCache.invalidate('properties_all');
  } catch (err: any) {
    console.error('Error updating property in Firestore:', err);
    throw err;
  }
}

/**
 * Delete property document from Firestore `properties/{id}`
 */
export async function deletePropertyFromFirestore(propertyId: string): Promise<void> {
  if (!propertyId) return;
  try {
    await withRetry(() => deleteDoc(doc(db, 'properties', propertyId)));
    firestoreCache.invalidate('properties_all');
  } catch (err: any) {
    console.error('Error deleting property from Firestore:', err);
    throw err;
  }
}

/**
 * Mark property status as `available` or `rented` in Firestore
 */
export async function markPropertyStatusInFirestore(propertyId: string, status: 'available' | 'rented'): Promise<void> {
  if (!propertyId) return;
  try {
    const docRef = doc(db, 'properties', propertyId);
    const isAvailable = status === 'available';
    
    await withRetry(() => updateDoc(docRef, {
      status: status,
      available: isAvailable,
      updatedAt: serverTimestamp(),
    }));
    firestoreCache.invalidate('properties_all');
  } catch (err: any) {
    console.error('Error marking property status:', err);
    throw err;
  }
}

/**
 * Real-Time subscription listener for `properties` collection
 */
export function subscribeToProperties(onPropertiesChanged: (properties: Property[]) => void): () => void {
  const propertiesRef = collection(db, 'properties');
  
  return onSnapshot(propertiesRef, (snapshot) => {
    const list: Property[] = snapshot.docs.map((docSnap) => {
      return mapFirestoreDocToProperty(docSnap.data(), docSnap.id);
    });
    firestoreCache.set('properties_all', list);
    onPropertiesChanged(list);
  }, (err) => {
    console.error('Firestore properties listener error:', err);
  });
}
