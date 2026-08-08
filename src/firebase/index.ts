/**
 * Firebase Infrastructure Module
 * Single export point for Firebase app, authentication, database, storage, auth, property, chat, savedRooms, roommatePost, notification, and problemReport services.
 */
export { app } from './firebase';
export { auth } from './auth';
export { db } from './firestore';
export { storage } from './storage';
export * from './authService';
export * from './propertyService';
export * from './chatService';
export * from './storageService';
export { sendEmailOTP, verifyOTP, saveOTP, generateOTP } from './otpService';
export { sendOTP } from './emailService';
export * from './savedRoomsService';
export * from './roommatePostService';
export * from './notificationService';
export * from './visitRequestService';
export * from './propertyViewService';
export * from './interestedStudentService';
export * from './problemReportService';
