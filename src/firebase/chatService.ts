import { 
  collection, 
  collectionGroup,
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firestore';
import type { Conversation, ChatMessage } from '../types';
import { withRetry } from '../utils/retryUtils';

export interface ChatDocument {
  chatId: string;
  propertyId: string;
  propertyName: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  createdAt: any;
  updatedAt?: any;
}

export interface MessageDocument {
  messageId: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  senderRole: 'STUDENT' | 'OWNER';
  message: string;
  text: string;
  type: 'text';
  isRead: boolean;
  seen: boolean;
  createdAt: any;
}

/**
 * Get existing chat or create new chat in Firestore `chats/{chatId}`
 */
export async function getOrCreateChatInFirestore(
  propertyId: string,
  propertyName: string,
  ownerId: string,
  ownerName: string,
  ownerPhone: string,
  studentId: string,
  studentName: string,
  studentPhone: string,
  studentAvatar: string
): Promise<string> {
  const chatId = `chat_${propertyId}_${studentId}`;
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      return chatId;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const newChat: ChatDocument = {
      chatId,
      propertyId: propertyId || '',
      propertyName: propertyName || 'Property',
      ownerId: ownerId || '',
      ownerName: ownerName || 'Property Owner',
      ownerPhone: ownerPhone || '',
      studentId: studentId || '',
      studentName: studentName || 'Student',
      studentPhone: studentPhone || '',
      studentAvatar: studentAvatar || '',
      lastMessage: 'Conversation started',
      lastMessageTime: nowStr,
      createdAt: serverTimestamp(),
    };

    await withRetry(() => setDoc(chatRef, newChat));
    return chatId;
  } catch (err) {
    console.error('Error getting or creating chat in Firestore:', err);
    return chatId;
  }
}

/**
 * Send a message in `chats/{chatId}/messages` and update `chats/{chatId}` lastMessage using writeBatch
 */
export async function sendMessageToFirestore(
  chatId: string,
  senderId: string,
  receiverId: string,
  senderRole: 'STUDENT' | 'OWNER',
  text: string
): Promise<void> {
  if (!chatId || !text.trim()) return;

  try {
    const messageId = `msg_${Date.now()}`;
    const messagesRef = doc(db, 'chats', chatId, 'messages', messageId);
    const chatRef = doc(db, 'chats', chatId);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const msgDoc: MessageDocument = {
      messageId,
      chatId,
      senderId,
      receiverId,
      senderRole,
      message: text.trim(),
      text: text.trim(),
      type: 'text',
      isRead: false,
      seen: false,
      createdAt: serverTimestamp(),
    };

    // Use single atomic WriteBatch to eliminate round-trip latency
    const batch = writeBatch(db);
    batch.set(messagesRef, msgDoc);
    batch.set(chatRef, {
      lastMessage: text.trim(),
      lastMessageTime: nowStr,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await withRetry(() => batch.commit());
  } catch (err) {
    console.error('Error sending message to Firestore:', err);
    throw err;
  }
}

/**
 * Permanently deletes a chat room and all its subcollection messages from Firestore.
 */
export async function deleteChatInFirestore(chatId: string): Promise<void> {
  if (!chatId) return;

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesSnap = await getDocs(messagesRef);

    const batch = writeBatch(db);
    messagesSnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const chatRef = doc(db, 'chats', chatId);
    batch.delete(chatRef);

    await withRetry(() => batch.commit());
  } catch (err) {
    console.error('Error deleting chat room in Firestore:', err);
    throw err;
  }
}

/**
 * Mark all unread messages sent to `receiverId` in `chats/{chatId}/messages` as read (`isRead = true`, `seen = true`)
 */
export async function markMessagesAsSeenInFirestore(chatId: string, receiverId: string): Promise<void> {
  if (!chatId || !receiverId) return;

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q1 = query(messagesRef, where('receiverId', '==', receiverId));
    const snapshot = await getDocs(q1);

    if (snapshot.empty) return;

    const unreadDocs = snapshot.docs.filter((d) => {
      const data = d.data();
      return data.isRead === false || data.seen === false;
    });

    if (unreadDocs.length === 0) return;

    const batch = writeBatch(db);
    unreadDocs.forEach((d) => {
      batch.update(d.ref, { isRead: true, seen: true });
    });

    await batch.commit();
  } catch (err) {
    console.error('Error marking messages as seen:', err);
  }
}

export const markMessagesAsReadInFirestore = markMessagesAsSeenInFirestore;

/**
 * Real-time listener for ALL unread messages where receiverId == currentUserId across all chats.
 * COUNT(messages where receiverId == currentUser AND isRead == false)
 */
export function subscribeToUnreadMessageCount(
  userId: string,
  onCountUpdated: (count: number) => void
): () => void {
  if (!userId) {
    onCountUpdated(0);
    return () => {};
  }

  try {
    const q = query(
      collectionGroup(db, 'messages'),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    return onSnapshot(q, (snapshot) => {
      onCountUpdated(snapshot.docs.length);
    }, (err) => {
      console.warn('Firestore collectionGroup unread messages listener fallback:', err);
      // Fallback listener querying user chats
      const chatsRef = collection(db, 'chats');
      const qUserChats = query(chatsRef, where('ownerId', '==', userId));
      return onSnapshot(qUserChats, async (chatsSnapshot) => {
        let count = 0;
        for (const chatDoc of chatsSnapshot.docs) {
          const msgsRef = collection(db, 'chats', chatDoc.id, 'messages');
          const msgsSnap = await getDocs(query(msgsRef, where('receiverId', '==', userId), where('isRead', '==', false)));
          count += msgsSnap.docs.length;
        }
        onCountUpdated(count);
      });
    });
  } catch (err) {
    console.error('Error subscribing to unread message count:', err);
    onCountUpdated(0);
    return () => {};
  }
}

/**
 * Subscribe to chats list for a given user (student or owner)
 */
export function subscribeToUserChats(
  userId: string,
  userRole: 'STUDENT' | 'OWNER',
  onChatsUpdated: (conversations: Conversation[]) => void
): () => void {
  if (!userId) {
    onChatsUpdated([]);
    return () => {};
  }

  const chatsRef = collection(db, 'chats');
  const fieldToFilter = userRole === 'OWNER' ? 'ownerId' : 'studentId';
  const q = query(chatsRef, where(fieldToFilter, '==', userId));

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs.map((d) => {
      const data = d.data() as ChatDocument;
      return {
        id: data.chatId || d.id,
        propertyId: data.propertyId || '',
        propertyName: data.propertyName || 'Property',
        studentId: data.studentId || '',
        studentName: data.studentName || 'Student',
        studentAvatar: data.studentAvatar || '',
        ownerId: data.ownerId || '',
        ownerName: data.ownerName || 'Property Owner',
        lastMessage: data.lastMessage || '',
        lastTimestamp: data.lastMessageTime || '',
        unreadCount: 0,
      };
    });

    onChatsUpdated(conversations);
  }, (err) => {
    console.error('Firestore chats listener error:', err);
  });
}

/**
 * Subscribe to messages in a specific chat `chats/{chatId}/messages`
 */
export function subscribeToChatMessages(
  chatId: string,
  onMessagesUpdated: (messages: ChatMessage[]) => void
): () => void {
  if (!chatId) {
    onMessagesUpdated([]);
    return () => {};
  }

  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const list: ChatMessage[] = snapshot.docs.map((d) => {
      const data = d.data();
      const createdTime = data.createdAt?.toDate 
        ? data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      const isReadVal = data.isRead ?? data.seen ?? false;

      return {
        id: data.messageId || d.id,
        chatId: data.chatId || chatId,
        senderId: data.senderId || '',
        receiverId: data.receiverId || '',
        senderName: data.senderRole === 'OWNER' ? 'Owner' : 'Student',
        senderRole: data.senderRole || 'STUDENT',
        message: data.message || data.text || '',
        text: data.message || data.text || '',
        timestamp: createdTime,
        isRead: isReadVal,
        seen: isReadVal,
      } as ChatMessage;
    });

    onMessagesUpdated(list);
  }, (err) => {
    console.error('Firestore messages listener error:', err);
  });
}

