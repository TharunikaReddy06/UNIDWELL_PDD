import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firestore';
import type { Property } from '../types';
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
  status: 'available' | 'rented' | 'Published' | 'Rented' | 'Draft' | 'Inactive';
  views: number;
  interestedStudents: any[];
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
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
    googleMapUrl: docData?.googleMapUrl || '',
    numberOfRooms: docData?.numberOfRooms || 1,
    numberOfBeds: docData?.numberOfBeds || 1,
    roomSizeSqFt: docData?.roomSizeSqFt || 250,
    images: Array.isArray(docData?.images) && docData.images.length > 0 ? docData.images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    amenities: Array.isArray(docData?.amenities) ? docData.amenities : [],
    panorama360Url: docData?.virtualTour || docData?.panorama360Url || '',
    available: isAvailable,
    status: isRented ? 'Rented' : 'Published',
    rating: docData?.rating || 4.8,
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
      images: property.images || [],
      virtualTour: property.panorama360Url || '',
      status: property.available ? 'available' : 'rented',
      views: property.viewsCount || 0,
      interestedStudents: property.interestedStudents || [],
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
    if (updatedFields.images !== undefined) payload.images = updatedFields.images;
    if (updatedFields.panorama360Url !== undefined) payload.virtualTour = updatedFields.panorama360Url;
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
