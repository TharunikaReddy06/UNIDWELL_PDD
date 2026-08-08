export interface User {
  id: string;
  name: string;
  role: 'STUDENT' | 'OWNER';
  avatar?: string;
  email: string;
  password?: string;
  phone?: string;
  verified: boolean;
  college?: string;
  
  // Student ID verification details
  studentRegNo?: string;
  department?: string;
  course?: string;
  academicYear?: string;
  studentIdCardImage?: string;

  // Owner Aadhaar verification details
  aadhaarNumber?: string;
  aadhaarName?: string;
  dob?: string;
  gender?: string;
  aadhaarImage?: string;

  // Owner Activity Status & Login Timestamps
  accountStatus?: 'Active' | 'Inactive' | 'Suspended';
  lastLoginDate?: string;
  lastLoginTime?: string;
  lastLoginTimestamp?: number;
}

export interface StudentProfile extends User {
  role: 'STUDENT';
  budget: number;
  lifestyleTags: string[];
  bio: string;
  university?: string;
}

export interface ExtraChargeItem {
  name: string;
  amount: number;
}

export interface PropertyPricing {
  monthlyRent: number;
  securityDeposit: number;
  maintenanceFee: number;
  electricityCharges: number | string;
  waterCharges: number | string;
  parkingCharges: number | string;
  extraCharges: number | string;
  extraChargesBreakdown?: ExtraChargeItem[];
  estimatedTotal: number;
}

export interface InterestedStudent {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  college?: string;
  date: string;
  lastMessage?: string;
  status: 'Expressed Interest' | 'Message Sent';
}

export interface PropertyViewLog {
  id: string;
  studentId: string;
  studentName: string;
  studentCollege: string;
  studentAvatar?: string;
  propertyId: string;
  propertyName: string;
  dateViewed: string; // e.g. "30 Jul 2026"
  timeViewed: string; // e.g. "11:05 AM"
}

export interface PropertyViewRecord {
  id: string;
  viewId?: string;
  propertyId: string;
  ownerUid?: string;
  ownerId: string;
  studentUid?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  collegeName?: string;
  studentCollege?: string;
  profileImage?: string;
  studentAvatar?: string;
  viewedAt: string;
  lastViewedAt?: string;
  viewedDate?: string;
  viewedTime?: string;
  status?: string;
}

export interface InterestedStudentRecord {
  id: string;
  interestId?: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  propertyImage?: string;
  ownerUid?: string;
  ownerId: string;
  studentUid?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  collegeName?: string;
  studentCollege?: string;
  profileImage?: string;
  studentAvatar?: string;
  status?: string;
  createdAt: string;
}

export interface VisitRequest {
  id: string;
  requestId?: string;
  propertyId: string;
  propertyTitle?: string;
  propertyName?: string;
  propertyAddress?: string;
  ownerId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  studentAvatar?: string;
  studentCollege?: string;
  requestedDate?: string;
  visitDate?: string;
  requestedTime?: string;
  visitTime?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Rescheduled' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED';
  createdAt: string;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  type: 'PRIVATE' | 'SHARED' | 'APARTMENT' | 'Single Room' | 'Shared Room' | 'PG';
  available: boolean;
  rating: number;

  // Real Property Details
  collegeNearby?: string;
  fullAddress?: string;
  googleMapUrl?: string;
  numberOfRooms?: number;
  numberOfBeds?: number;
  roomSizeSqFt?: number;
  panorama360Url?: string;
  status?: 'Draft' | 'Published' | 'Rented' | 'Inactive';
  pricing?: PropertyPricing;
  houseRules?: string[];

  // Real Analytics (No Fake Data)
  viewsCount: number;
  viewedStudentIds?: string[];
  viewLogs?: PropertyViewLog[];
  interestedStudents?: InterestedStudent[];
  createdAt?: string;
}

export interface RoommatePost {
  id: string;
  authorId: string;
  authorName: string;
  authorCollege?: string;
  authorAvatar?: string;
  type: 'LOOKING_FOR_ROOM' | 'LOOKING_FOR_ROOMMATE';
  collegeName: string;
  preferredLocation: string;
  budget: number;
  genderPreference: 'Male' | 'Female' | 'Any';
  roomType: 'Single Room' | 'Shared Room' | 'Apartment' | 'PG' | 'Any';
  moveInDate: string;
  aboutMe: string;
  description?: string;
  lifestyleTags: string[];
  aiMatchScore?: number;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId?: string;
  senderName: string;
  senderRole: 'STUDENT' | 'OWNER';
  text: string;
  message?: string;
  timestamp: string;
  isRead?: boolean;
  seen?: boolean;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyName: string;
  studentId: string;
  studentName: string;
  studentCollege?: string;
  studentAvatar?: string;
  ownerId: string;
  ownerName?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export type NotificationType = 
  | 'INTERESTED_STUDENT'
  | 'PROPERTY_VIEWS'
  | 'VISIT_REQUEST'
  | 'VISIT_CANCELLED'
  | 'PROPERTY_REVIEW'
  | 'VISIT_ACCEPTED'
  | 'VISIT_REJECTED'
  | 'PROPERTY_UPDATED'
  | 'PROPERTY_UNAVAILABLE'
  | 'BOOKING_CONFIRMED'
  | 'SUPPORT_REPLY'
  | 'NEW_MESSAGE'
  // Legacy aliases
  | 'NEW_VIEW'
  | 'NEW_INTERESTED'
  | 'OWNER_REPLIED';

export interface AppNotification {
  id: string;
  notificationId: string;
  receiverUid: string;
  senderUid: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedPropertyId?: string;
  relatedVisitId?: string;
  // Backward compatibility aliases
  userId?: string;
  receiverRole?: 'STUDENT' | 'OWNER';
  senderRole?: 'STUDENT' | 'OWNER';
  read?: boolean;
  timestamp?: string;
  link?: string;
  relatedDocumentId?: string;
}
