import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Property, RoommatePost, Conversation, ChatMessage, InterestedStudent, PropertyViewLog, AppNotification, VisitRequest, PropertyViewRecord, InterestedStudentRecord } from '../types';
import { 
  updateUserProfileInFirestore, 
  logoutFromFirebase, 
  addPropertyToFirestore, 
  updatePropertyInFirestore, 
  deletePropertyFromFirestore,
  getOrCreateChatInFirestore,
  sendMessageToFirestore,
  markMessagesAsSeenInFirestore,
  toggleSavedRoomInFirestore,
  addRoommatePostToFirestore,
  updateRoommatePostInFirestore,
  deleteRoommatePostFromFirestore,
  addNotificationToFirestore,
  addVisitRequestToFirestore,
  updateVisitRequestStatusInFirestore,
  recordPropertyViewInFirestore,
  addInterestedStudentToFirestore,
  toggleInterestedStudentInFirestore,
  removeInterestedStudentFromFirestore
} from '../firebase/index';
import { applyThemeToDocument, getSavedTheme, type ThemeMode, type AccentColor } from '../utils/theme';

export interface RegisteredUser extends User {
  password?: string;
  college?: string;
  studentRegNo?: string;
  department?: string;
  course?: string;
  academicYear?: string;
  studentIdCardImage?: string;
  verificationStatus?: string;
  aadhaarNumber?: string;
  aadhaarName?: string;
  dob?: string;
  gender?: string;
  aadhaarImage?: string;
  accountStatus?: 'Active' | 'Inactive' | 'Suspended';
  lastLoginDate?: string;
  lastLoginTime?: string;
  lastLoginTimestamp?: number;
}

interface AppState {
  user: RegisteredUser | null;
  registeredUsers: RegisteredUser[];
  savedProperties: string[];
  properties: Property[];
  roommatePosts: RoommatePost[];
  conversations: Conversation[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  visitRequests: VisitRequest[];
  propertyViews: PropertyViewRecord[];
  interestedStudentsList: InterestedStudentRecord[];
  unreadMessageCount: number;
  toastMessage: string | null;
  toastPopup: { id: string; title: string; message: string; timestamp: string } | null;
  shakeBell: boolean;
  
  // Auth state & flags
  authInitialized: boolean;
  authLoading: boolean;
  isLoggingOut: boolean;
  setAuthInitialized: (initialized: boolean) => void;
  setAuthLoading: (loading: boolean) => void;
  clearAuthState: () => void;

  // Theme Options
  themeMode: ThemeMode;
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;

  // Actions
  setProperties: (properties: Property[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSavedProperties: (savedProperties: string[]) => void;
  setRoommatePosts: (posts: RoommatePost[]) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  setVisitRequests: (visitRequests: VisitRequest[]) => void;
  setPropertyViews: (propertyViews: PropertyViewRecord[]) => void;
  setInterestedStudentsList: (list: InterestedStudentRecord[]) => void;
  setUnreadMessageCount: (count: number) => void;
  setToastPopup: (toast: { id: string; title: string; message: string; timestamp: string } | null) => void;
  setShakeBell: (shake: boolean) => void;
  markAllNotificationsRead: () => Promise<void>;
  markChatMessagesRead: (chatId: string) => Promise<void>;
  markNotificationsReadByType: (types: string[]) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  login: (user: RegisteredUser) => void;


  registerUser: (user: RegisteredUser) => void;
  updateUserProfile: (updated: Partial<RegisteredUser>) => void;
  changePassword: (newPassword: string) => void;
  logout: () => Promise<void>;
  toggleSavedProperty: (id: string) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;

  // Visit Requests
  addVisitRequest: (req: VisitRequest) => void;
  updateVisitRequestStatus: (
    id: string, 
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Rescheduled' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED',
    newDate?: string,
    newTime?: string
  ) => void;

  // Roommate Post Actions
  addRoommatePost: (post: RoommatePost) => void;
  updateRoommatePost: (id: string, updated: Partial<RoommatePost>) => void;
  deleteRoommatePost: (id: string) => void;
  
  // Property CRUD
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updated: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  
  // Property View Tracking
  recordPropertyViewLog: (propertyId: string, studentUser: RegisteredUser) => void;
  
  // Interested Students & Real-Time Messaging
  addInterestedStudent: (propertyId: string, studentUser: RegisteredUser, initialStatus?: 'Expressed Interest' | 'Message Sent') => void;
  toggleInterestedStudent: (property: Property, studentUser: RegisteredUser) => Promise<boolean>;
  removeInterestedStudent: (interestId: string) => void;
  startConversation: (propertyId: string, propertyName: string, ownerId: string, ownerName: string, studentUser: RegisteredUser) => string;
  sendMessage: (chatId: string, senderId: string, senderName: string, senderRole: 'STUDENT' | 'OWNER', text: string) => void;
  
  // Notifications
  addNotification: (notif: Omit<AppNotification, 'id' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  
  // Authentication
  authenticateUser: (email: string, password: string, requiredRole: 'STUDENT' | 'OWNER') => { success: boolean; error?: string };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      authInitialized: false,
      authLoading: true,
      isLoggingOut: false,
      setAuthInitialized: (initialized) => set({ authInitialized: initialized }),
      setAuthLoading: (loading) => set({ authLoading: loading }),
      clearAuthState: () =>
        set({
          user: null,
          savedProperties: [],
          notifications: [],
          visitRequests: [],
          propertyViews: [],
          interestedStudentsList: [],
          unreadMessageCount: 0,
        }),
      registeredUsers: [],
      savedProperties: [],
      properties: [],
      roommatePosts: [],
      conversations: [],
      messages: [],
      notifications: [],
      visitRequests: [],
      toastMessage: null,
      
      // Theme defaults
      themeMode: getSavedTheme().mode || 'light',
      accentColor: getSavedTheme().accent || 'teal',

      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
        applyThemeToDocument(mode, get().accentColor);
      },

      setAccentColor: (color: AccentColor) => {
        set({ accentColor: color });
        applyThemeToDocument(get().themeMode, color);
      },

      login: (loginUser) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const timestamp = Date.now();

        const updatedUser: RegisteredUser = {
          ...loginUser,
          accountStatus: 'Active',
          lastLoginDate: dateStr,
          lastLoginTime: timeStr,
          lastLoginTimestamp: timestamp,
        };

        set((state) => {
          const userExistsInRegistered = state.registeredUsers.some(
            (u) => u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase()
          );

          const updatedList = userExistsInRegistered
            ? state.registeredUsers.map((u) =>
                u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase()
                  ? updatedUser
                  : u
              )
            : [...state.registeredUsers, updatedUser];

          return {
            user: updatedUser,
            registeredUsers: updatedList,
          };
        });
      },

      showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => {
          if (get().toastMessage === msg) {
            set({ toastMessage: null });
          }
        }, 2000);
      },

      clearToast: () => set({ toastMessage: null }),

      registerUser: (newUser) =>
        set((state) => {
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          const timestamp = Date.now();

          const activeUser: RegisteredUser = {
            ...newUser,
            accountStatus: 'Active',
            lastLoginDate: dateStr,
            lastLoginTime: timeStr,
            lastLoginTimestamp: timestamp,
          };

          const filtered = state.registeredUsers.filter(u => u.email.toLowerCase() !== newUser.email.toLowerCase() && u.id !== newUser.id);
          return {
            registeredUsers: [activeUser, ...filtered],
            user: activeUser,
          };
        }),

      // Permanent Profile Persistence by User ID and Email
      updateUserProfile: (updatedFields) => {
        const currentUser = get().user;
        if (currentUser) {
          updateUserProfileInFirestore(currentUser.id, currentUser.role, updatedFields).catch((err) => {
            console.error('Failed to update profile in Firestore:', err);
          });
        }

        set((state) => {
          if (!state.user) return state;

          const updatedUser: RegisteredUser = {
            ...state.user,
            ...updatedFields,
          };

          const userExistsInRegistered = state.registeredUsers.some(
            (u) => u.id === state.user?.id || u.email.toLowerCase() === state.user?.email.toLowerCase()
          );

          const updatedList = userExistsInRegistered
            ? state.registeredUsers.map((u) =>
                u.id === state.user?.id || u.email.toLowerCase() === state.user?.email.toLowerCase()
                  ? updatedUser
                  : u
              )
            : [updatedUser, ...state.registeredUsers];

          // Synchronize properties ownerName/ownerPhone
          const updatedProperties = state.properties.map((p) => {
            if (p.ownerId === state.user?.id || (state.user?.role === 'OWNER' && p.ownerName === state.user?.name)) {
              return {
                ...p,
                ownerName: updatedFields.name || p.ownerName,
                ownerPhone: updatedFields.phone || p.ownerPhone,
              };
            }
            return p;
          });

          // Synchronize conversations ownerName
          const updatedConversations = state.conversations.map((c) => {
            if (c.ownerId === state.user?.id) {
              return {
                ...c,
                ownerName: updatedFields.name || c.ownerName,
              };
            }
            return c;
          });

          return {
            user: updatedUser,
            registeredUsers: updatedList,
            properties: updatedProperties,
            conversations: updatedConversations,
          };
        });
      },

      changePassword: (newPassword) =>
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, password: newPassword };
          const updatedList = state.registeredUsers.map((u) =>
            u.id === state.user?.id || u.email.toLowerCase() === state.user?.email.toLowerCase() ? updatedUser : u
          );
          return {
            user: updatedUser,
            registeredUsers: updatedList,
          };
        }),
      
      logout: async () => {
        try {
          set({ isLoggingOut: true, authLoading: true });
          await logoutFromFirebase();
        } catch (err) {
          console.error('Error logging out from Firebase:', err);
        } finally {
          // Clear application auth state
          get().clearAuthState();

          // Clear persisted session data from localStorage/sessionStorage
          try {
            const persisted = localStorage.getItem('unidwell-storage');
            if (persisted) {
              const parsed = JSON.parse(persisted);
              if (parsed.state) {
                parsed.state.user = null;
                parsed.state.savedProperties = [];
                parsed.state.notifications = [];
                parsed.state.visitRequests = [];
                parsed.state.propertyViews = [];
                parsed.state.interestedStudentsList = [];
                parsed.state.unreadMessageCount = 0;
                localStorage.setItem('unidwell-storage', JSON.stringify(parsed));
              }
            }
            sessionStorage.clear();
          } catch (e) {
            console.warn('Storage cleanup error during logout:', e);
          }

          set({ isLoggingOut: false, authLoading: false, authInitialized: true });

          // Navigate immediately to /welcome replacing history entry so browser Back does not return to dashboard
          if (window.location.hash && window.location.hash.startsWith('#/')) {
            window.location.replace('#/welcome');
          } else {
            window.location.replace('/welcome');
          }
        }
      },
      
      toastPopup: null,
      shakeBell: false,

      setToastPopup: (toast) => set({ toastPopup: toast }),
      setShakeBell: (shake) => set({ shakeBell: shake }),
      
      setSavedProperties: (newSaved) => set({ savedProperties: newSaved }),
      setRoommatePosts: (newPosts) => set({ roommatePosts: newPosts }),
      setNotifications: (newNotifs) => {
        const currentNotifs = get().notifications || [];
        const currentIds = new Set(currentNotifs.map(n => n.id || n.notificationId));

        // Detect newly added unread notifications
        const freshUnread = (newNotifs || []).filter(n => 
          !currentIds.has(n.id || n.notificationId) && !(n.isRead ?? n.read)
        );

        if (freshUnread.length > 0 && currentNotifs.length > 0) {
          const latest = freshUnread[0];
          set({
            notifications: newNotifs,
            shakeBell: true,
            toastPopup: {
              id: latest.id || latest.notificationId,
              title: latest.title,
              message: latest.message,
              timestamp: latest.createdAt || latest.timestamp || 'Just now',
            }
          });

          // Auto dismiss bell shake after 1s
          setTimeout(() => {
            set({ shakeBell: false });
          }, 1000);

          // Auto dismiss toast popup after 5s
          setTimeout(() => {
            set({ toastPopup: null });
          }, 5000);
        } else {
          set({ notifications: newNotifs });
        }
      },
      setVisitRequests: (newRequests) => set({ visitRequests: newRequests }),
      setPropertyViews: (newViews) => set({ propertyViews: newViews }),
      setInterestedStudentsList: (newList) => set({ interestedStudentsList: newList }),
      setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),

      markAllNotificationsRead: async () => {
        const currentUser = get().user;
        if (!currentUser?.id) return;

        set((state) => ({
          notifications: (state.notifications || []).map((n) => ({ ...n, isRead: true, read: true })),
        }));

        const { markAllUserNotificationsReadInFirestore } = await import('../firebase/notificationService');
        await markAllUserNotificationsReadInFirestore(currentUser.id);
      },

      markChatMessagesRead: async (chatId: string) => {
        const currentUser = get().user;
        if (!currentUser?.id || !chatId) return;

        const { markMessagesAsSeenInFirestore } = await import('../firebase/chatService');
        await markMessagesAsSeenInFirestore(chatId, currentUser.id);

        set({ unreadMessageCount: 0 });
      },

      markNotificationsReadByType: async (types: string[]) => {
        const currentUser = get().user;
        if (!currentUser?.id || !types.length) return;

        set((state) => ({
          notifications: (state.notifications || []).map((n) => {
            const isMatch = types.includes(n.type) || 
              (types.includes('INTERESTED_STUDENT') && (
                n.type?.toLowerCase().includes('interested') ||
                n.title?.toLowerCase().includes('interested') ||
                n.message?.toLowerCase().includes('interested')
              ));
            return isMatch ? { ...n, isRead: true, read: true } : n;
          }),
        }));

        const { markNotificationsReadByTypeInFirestore } = await import('../firebase/notificationService');
        await markNotificationsReadByTypeInFirestore(currentUser.id, types);
      },

      deleteNotification: async (notificationId: string) => {
        if (!notificationId) return;

        set((state) => ({
          notifications: (state.notifications || []).filter((n) => n.id !== notificationId && n.notificationId !== notificationId),
        }));

        const { deleteNotificationFromFirestore } = await import('../firebase/notificationService');
        await deleteNotificationFromFirestore(notificationId);
      },

      clearAllNotifications: async () => {
        const currentUser = get().user;
        if (!currentUser?.id) return;

        set({ notifications: [] });

        const { clearAllUserNotificationsInFirestore } = await import('../firebase/notificationService');
        await clearAllUserNotificationsInFirestore(currentUser.id);
      },

      deleteConversation: async (chatId: string) => {
        if (!chatId) return;

        set((state) => ({
          conversations: (state.conversations || []).filter((c) => c.id !== chatId),
          messages: (state.messages || []).filter((m) => m.chatId !== chatId),
        }));

        const { deleteChatInFirestore } = await import('../firebase/chatService');
        await deleteChatInFirestore(chatId);
      },

      toggleSavedProperty: (id) => {
        const currentUser = get().user;
        const currentSaved = get().savedProperties;
        const isSaved = currentSaved.includes(id);

        if (currentUser) {
          toggleSavedRoomInFirestore(currentUser.id, id, isSaved).catch((err) => {
            console.error('Error toggling saved room in Firestore:', err);
          });
        }

        set((state) => ({
          savedProperties: isSaved
            ? state.savedProperties.filter((p) => p !== id)
            : [...state.savedProperties, id],
        }));
      },

      addRoommatePost: (post) => {
        addRoommatePostToFirestore(post).catch((err) => {
          console.error('Error adding roommate post to Firestore:', err);
        });

        set((state) => ({
          roommatePosts: [post, ...state.roommatePosts],
        }));
      },

      updateRoommatePost: (id, updated) => {
        updateRoommatePostInFirestore(id, updated).catch((err) => {
          console.error('Error updating roommate post in Firestore:', err);
        });

        set((state) => ({
          roommatePosts: state.roommatePosts.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        }));
      },

      deleteRoommatePost: (id) => {
        deleteRoommatePostFromFirestore(id).catch((err) => {
          console.error('Error deleting roommate post from Firestore:', err);
        });

        set((state) => ({
          roommatePosts: state.roommatePosts.filter((p) => p.id !== id),
        }));
      },


      // Visit Requests
      addVisitRequest: (req) => {
        addVisitRequestToFirestore(req).catch((err) => {
          console.error('Error adding Visit Request to Firestore:', err);
        });
        set((state) => ({ visitRequests: [req, ...state.visitRequests] }));
      },

      updateVisitRequestStatus: (id, status, newDate, newTime) => {
        const currentList = get().visitRequests;
        const targetReq = currentList.find((r) => r.id === id || r.requestId === id);

        updateVisitRequestStatusInFirestore(
          id, 
          status, 
          newDate, 
          newTime, 
          targetReq?.studentId, 
          targetReq?.propertyTitle || targetReq?.propertyName
        ).catch((err) => {
          console.error('Error updating Visit Request status in Firestore:', err);
        });

        set((state) => {
          const updatedRequests = state.visitRequests.map((r) => {
            if (r.id === id || r.requestId === id) {
              return { 
                ...r, 
                status,
                requestedDate: newDate || r.requestedDate || r.visitDate,
                visitDate: newDate || r.visitDate || r.requestedDate,
                requestedTime: newTime || r.requestedTime || r.visitTime,
                visitTime: newTime || r.visitTime || r.requestedTime,
              };
            }
            return r;
          });
          return { visitRequests: updatedRequests };
        });
      },

      setProperties: (newProperties) => set({ properties: newProperties }),

      // Real Property CRUD
      addProperty: (newProp) => {
        const propertyWithDefaults: Property = {
          ...newProp,
          id: newProp.id || `prop-${Date.now()}`,
          viewsCount: newProp.viewsCount || 0,
          viewedStudentIds: newProp.viewedStudentIds || [],
          viewLogs: newProp.viewLogs || [],
          interestedStudents: newProp.interestedStudents || [],
          status: newProp.status || 'Published',
          available: newProp.available !== undefined ? newProp.available : true,
          createdAt: newProp.createdAt || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        addPropertyToFirestore(propertyWithDefaults).catch((err) => {
          console.error('Error adding property to Firestore:', err);
        });

        set((state) => {
          const filtered = state.properties.filter(p => p.id !== propertyWithDefaults.id);
          return {
            properties: [propertyWithDefaults, ...filtered],
          };
        });
      },

      updateProperty: (id, updated) => {
        updatePropertyInFirestore(id, updated).catch((err) => {
          console.error('Error updating property in Firestore:', err);
        });

        set((state) => ({
          properties: state.properties.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        }));
      },

      deleteProperty: (id) => {
        deletePropertyFromFirestore(id).catch((err) => {
          console.error('Error deleting property from Firestore:', err);
        });

        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
          conversations: state.conversations.filter((c) => c.propertyId !== id),
          visitRequests: state.visitRequests.filter((v) => v.propertyId !== id),
        }));
      },


      // Property View Tracking
      recordPropertyViewLog: (propertyId, studentUser) => {
        if (!studentUser || studentUser.role !== 'STUDENT') return;
        const targetProp = get().properties.find(p => p.id === propertyId);
        if (targetProp && targetProp.ownerId) {
          recordPropertyViewInFirestore(propertyId, targetProp.ownerId, targetProp.title, studentUser).catch((err) => {
            console.error('Error recording property view in Firestore:', err);
          });
        }
      },

      // Interested Students Tracking
      addInterestedStudent: (propertyId, studentUser) => {
        if (!studentUser || studentUser.role !== 'STUDENT') return;
        const targetProp = get().properties.find(p => p.id === propertyId);
        if (targetProp && targetProp.ownerId) {
          addInterestedStudentToFirestore(
            propertyId, 
            targetProp.title, 
            targetProp.ownerId, 
            studentUser,
            targetProp.fullAddress || targetProp.location,
            targetProp.images?.[0]
          ).catch((err) => {
            console.error('Error adding interested student to Firestore:', err);
          });
        }
      },

      toggleInterestedStudent: async (property, studentUser) => {
        if (!studentUser || studentUser.role !== 'STUDENT' || !property?.id || !property?.ownerId) {
          return false;
        }

        try {
          const res = await toggleInterestedStudentInFirestore(
            property.id,
            property.title,
            property.ownerId,
            studentUser,
            property.fullAddress || property.location,
            property.images?.[0]
          );

          if (res.isInterested) {
            get().showToast('Your interest has been shared with the property owner.');
          } else {
            get().showToast('Interest removed.');
          }

          return res.isInterested;
        } catch (err) {
          console.error('Error toggling interest in store:', err);
          return false;
        }
      },

      removeInterestedStudent: (interestId) => {
        if (!interestId) return;
        removeInterestedStudentFromFirestore(interestId).catch((err) => {
          console.error('Error removing interested student from Firestore:', err);
        });

        set((state) => ({
          interestedStudentsList: state.interestedStudentsList.filter(
            (s) => s.id !== interestId && s.interestId !== interestId
          ),
        }));
      },

      setConversations: (newConvs) => set({ conversations: newConvs }),
      setMessages: (newMsgs) => set({ messages: newMsgs }),

      // Start Conversation
      startConversation: (propertyId, propertyName, ownerId, ownerName, studentUser) => {
        const { addInterestedStudent, properties } = get();
        
        addInterestedStudent(propertyId, studentUser, 'Message Sent');

        const linkedProp = properties.find(p => p.id === propertyId);
        const ownerPhone = linkedProp?.ownerPhone || '7842384450';
        const chatId = `chat_${propertyId}_${studentUser.id}`;

        getOrCreateChatInFirestore(
          propertyId,
          propertyName,
          ownerId,
          ownerName || linkedProp?.ownerName || 'Property Owner',
          ownerPhone,
          studentUser.id,
          studentUser.name,
          studentUser.phone || '',
          studentUser.avatar || ''
        ).catch((err) => {
          console.error('Error creating chat in Firestore:', err);
        });

        return chatId;
      },

      // Send Message & Notifications
      sendMessage: (chatId, senderId, senderName, senderRole, text) => {
        const { conversations } = get();
        const targetConv = conversations.find((c) => c.id === chatId);

        const receiverId = targetConv
          ? (senderRole === 'STUDENT' ? targetConv.ownerId : targetConv.studentId)
          : '';

        sendMessageToFirestore(chatId, senderId, receiverId, senderRole, text).catch((err) => {
          console.error('Error sending message to Firestore:', err);
        });

        // Write notification ONLY for the recipient (receiverId), never for the sender.
        // Use addNotificationToFirestore directly so the local Zustand store is NOT mutated
        // for the current (sending) user. The Firebase real-time listener on the RECIPIENT's
        // session will pick up the notification via subscribeToUserNotifications.
        if (targetConv && receiverId && receiverId !== senderId) {
          const isStudent = senderRole === 'STUDENT';
          const notifType: import('../types').NotificationType = isStudent ? 'NEW_MESSAGE' : 'OWNER_REPLIED';
          const notifTitle = isStudent ? `New message from ${senderName}` : `New reply from ${senderName}`;
          const notifMessage = isStudent
            ? `${senderName} sent: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
            : `${senderName} replied to your inquiry for "${targetConv.propertyName}"`;

          addNotificationToFirestore({
            receiverUid: receiverId,
            senderUid: senderId,
            title: notifTitle,
            message: notifMessage,
            type: notifType,
            relatedPropertyId: targetConv.propertyId,
          }).catch((err) => {
            console.error('Error sending message notification to Firestore:', err);
          });
        }
      },

      // Notifications Management
      addNotification: (notifData) => {
        // Normalize receiverUid/senderUid for Firestore (backward compat with callers using userId)
        const receiverUid = (notifData as any).receiverUid || (notifData as any).userId || '';
        const senderUid = (notifData as any).senderUid || 'system';
        addNotificationToFirestore({
          ...notifData,
          receiverUid,
          senderUid,
        }).catch((err) => {
          console.error('Error adding notification to Firestore:', err);
        });

        set((state) => {
          const newNotif: AppNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            ...notifData,
            receiverUid,
            senderUid,
            read: false,
          };
          return { notifications: [newNotif, ...state.notifications] };
        });
      },

      markNotificationRead: (id) => {
        markNotificationReadInFirestore(id).catch((err) => {
          console.error('Error marking notification read in Firestore:', err);
        });

        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },


      // Authentication (Updates Login Date, Time, Timestamp & Sets Account Status to Active)
      authenticateUser: (email, password, requiredRole) => {
        const { registeredUsers } = get();
        const cleanEmail = email.trim().toLowerCase();

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const timestamp = Date.now();

        const existing = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);

        if (!existing) {
          const newUser: RegisteredUser = {
            id: `${requiredRole.toLowerCase()}-${Date.now()}`,
            name: requiredRole === 'STUDENT' ? 'Rahul Kumar' : 'Rajesh Sharma',
            email: cleanEmail,
            password,
            role: requiredRole,
            verified: true,
            phone: '9876543210',
            college: requiredRole === 'STUDENT' ? 'SIMATS School of Engineering' : undefined,
            studentRegNo: requiredRole === 'STUDENT' ? 'REG20248891' : undefined,
            department: requiredRole === 'STUDENT' ? 'Computer Science & Engineering' : undefined,
            course: requiredRole === 'STUDENT' ? 'B.Tech' : undefined,
            academicYear: requiredRole === 'STUDENT' ? '2024-2028' : undefined,
            aadhaarNumber: requiredRole === 'OWNER' ? 'XXXX XXXX 8892' : undefined,
            aadhaarName: requiredRole === 'OWNER' ? 'Rajesh Sharma' : undefined,
            accountStatus: 'Active',
            lastLoginDate: dateStr,
            lastLoginTime: timeStr,
            lastLoginTimestamp: timestamp,
          };

          set((state) => ({
            registeredUsers: [newUser, ...state.registeredUsers],
            user: newUser,
          }));

          return { success: true };
        }

        if (existing.role !== requiredRole) {
          if (existing.role === 'STUDENT' && requiredRole === 'OWNER') {
            return {
              success: false,
              error: 'This email is registered as a Student account. Please log in using Student login.',
            };
          }
          if (existing.role === 'OWNER' && requiredRole === 'STUDENT') {
            return {
              success: false,
              error: 'This email is registered as a Property Owner account. Please log in using Owner login.',
            };
          }
        }

        if (existing.password && existing.password !== password) {
          return {
            success: false,
            error: 'Invalid password. Please check your credentials.',
          };
        }

        // On successful login: preserve all updated saved properties (name, phone, avatar, etc.)
        const updatedAuthUser: RegisteredUser = {
          ...existing,
          accountStatus: 'Active',
          lastLoginDate: dateStr,
          lastLoginTime: timeStr,
          lastLoginTimestamp: timestamp,
        };

        set((state) => ({
          user: updatedAuthUser,
          registeredUsers: state.registeredUsers.map((u) => (u.id === existing.id || u.email.toLowerCase() === cleanEmail ? updatedAuthUser : u)),
        }));

        return { success: true };
      },
    }),
    {
      name: 'unidwell-storage',
      partialize: (state) => ({
        user: state.user,
        registeredUsers: state.registeredUsers || [],
        savedProperties: state.savedProperties || [],
        properties: state.properties || [],
        roommatePosts: state.roommatePosts || [],
        conversations: state.conversations || [],
        messages: state.messages || [],
        notifications: state.notifications || [],
        visitRequests: state.visitRequests || [],
        propertyViews: state.propertyViews || [],
        interestedStudentsList: state.interestedStudentsList || [],
        unreadMessageCount: state.unreadMessageCount || 0,
        themeMode: state.themeMode || 'light',
        accentColor: state.accentColor || 'teal',
      }),
      merge: (persistedState: any, currentState: AppState) => {
        const pState = (persistedState || {}) as Partial<AppState>;
        return {
          ...currentState,
          user: pState.user !== undefined ? pState.user : currentState.user,
          registeredUsers: Array.isArray(pState.registeredUsers) ? pState.registeredUsers : currentState.registeredUsers || [],
          savedProperties: Array.isArray(pState.savedProperties) ? pState.savedProperties : currentState.savedProperties || [],
          properties: Array.isArray(pState.properties) ? pState.properties : currentState.properties || [],
          roommatePosts: Array.isArray(pState.roommatePosts) ? pState.roommatePosts : currentState.roommatePosts || [],
          conversations: Array.isArray(pState.conversations) ? pState.conversations : currentState.conversations || [],
          messages: Array.isArray(pState.messages) ? pState.messages : currentState.messages || [],
          notifications: Array.isArray(pState.notifications) ? pState.notifications : currentState.notifications || [],
          visitRequests: Array.isArray(pState.visitRequests) ? pState.visitRequests : currentState.visitRequests || [],
          propertyViews: Array.isArray(pState.propertyViews) ? pState.propertyViews : currentState.propertyViews || [],
          interestedStudentsList: Array.isArray(pState.interestedStudentsList) ? pState.interestedStudentsList : currentState.interestedStudentsList || [],
          unreadMessageCount: typeof pState.unreadMessageCount === 'number' ? pState.unreadMessageCount : currentState.unreadMessageCount || 0,
          themeMode: pState.themeMode || 'light',
          accentColor: pState.accentColor || 'teal',
        };
      },
    }
  )
);
