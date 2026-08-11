import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Phone, ShieldCheck, Building2, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { subscribeToChatMessages } from '../firebase/chatService';
import type { Conversation, ChatMessage } from '../types';

export default function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, conversations, sendMessage, properties, markChatMessagesRead, deleteConversation } = useStore();
  const [text, setText] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [fetchedConv, setFetchedConv] = useState<Partial<Conversation> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navState = (location.state as any) || {};

  // 1. Find conversation in store
  let storeConv = conversations.find((c) => c.id === id);
  if (!storeConv && id && id.startsWith('chat_')) {
    const parts = id.split('_');
    const pId = parts[1];
    const sId = parts.slice(2).join('_');
    storeConv = conversations.find((c) => (c.propertyId === pId && c.studentId === sId) || c.id === id);
  }

  // 2. Fetch conversation metadata from Firestore if not in store
  useEffect(() => {
    if (!id || storeConv) return;
    let isMounted = true;
    const fetchChatDoc = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/firestore');
        const chatSnap = await getDoc(doc(db, 'chats', id));
        if (chatSnap.exists() && isMounted) {
          const d = chatSnap.data();
          setFetchedConv({
            id: d.chatId || id,
            propertyId: d.propertyId || '',
            propertyName: d.propertyName || 'Accommodation',
            studentId: d.studentId || '',
            studentName: d.studentName || 'Student',
            studentAvatar: d.studentAvatar || '',
            studentPhone: d.studentPhone || '',
            ownerId: d.ownerId || '',
            ownerName: d.ownerName || 'Property Owner',
            lastMessage: d.lastMessage || '',
            lastTimestamp: d.lastMessageTime || '',
          });
        }
      } catch (err) {
        console.error('Error fetching chat doc in ChatScreen:', err);
      }
    };
    fetchChatDoc();
    return () => { isMounted = false; };
  }, [id, storeConv]);

  const conversation = storeConv || fetchedConv;

  // ─── Visual Viewport Resize Listener (WhatsApp-style Keyboard Handling) ───
  useEffect(() => {
    const updateViewport = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    updateViewport();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  // ─── Auto-Scroll to Latest Message ───
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    } else if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToChatMessages(id, (msgs) => {
      setRealtimeMessages(msgs);
      if (user?.id) {
        markChatMessagesRead(id).catch(console.error);
      }
    });

    if (user?.id) {
      markChatMessagesRead(id).catch(console.error);
    }

    return () => unsubscribe();
  }, [id, user?.id, markChatMessagesRead]);

  // Scroll to bottom when new messages arrive or conversation opens
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [realtimeMessages.length, id]);

  // Scroll to bottom when keyboard opens or viewport shrinks
  useEffect(() => {
    if (viewportHeight) {
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewportHeight]);

  const cleanString = (val: any) => {
    if (!val || typeof val !== 'string' || val === 'undefined' || val === 'null' || val === '[object Object]' || val.includes('undefined')) return '';
    return val.trim();
  };

  const propId = conversation?.propertyId || navState.propertyId || (id?.startsWith('chat_') ? id.split('_')[1] : '');
  const linkedProperty = properties.find((p) => p.id === propId);
  const propertyStatus = linkedProperty?.status || 'Published';
  const isAvailable = propertyStatus === 'Published' || (linkedProperty?.available ?? true);

  const rawTitle = cleanString(conversation?.propertyName) ||
    cleanString((conversation as any)?.propertyTitle) ||
    cleanString(navState.propertyTitle) ||
    cleanString(navState.propertyName) ||
    cleanString(linkedProperty?.title);

  const displayTitle = rawTitle || (id?.startsWith('roommate-') ? 'Roommate Inquiry' : 'Accommodation Inquiry');

  const studentNameFromNav = cleanString(navState.studentName);
  const studentNameFromConv = cleanString(conversation?.studentName);
  const recipientName = user?.role === 'OWNER'
    ? (studentNameFromConv || studentNameFromNav || 'Student')
    : (cleanString(conversation?.ownerName) || cleanString(navState.ownerName) || cleanString(linkedProperty?.ownerName) || 'Property Owner');

  const rawPhone = user?.role === 'OWNER'
    ? (conversation?.studentPhone || navState.studentPhone)
    : (linkedProperty?.ownerPhone || conversation?.ownerPhone || navState.ownerPhone);

  const cleanPhone = (rawPhone || '7842384450').replace(/\D/g, '');
  const telLink = `tel:${cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`}`;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const activeChatId = conversation?.id || id;
    if (!text.trim() || !activeChatId) return;

    const msgToSend = text.trim();
    setText('');

    sendMessage(
      activeChatId,
      user?.id || (user?.role === 'OWNER' ? 'owner-default' : 'student-1'),
      user?.name || (user?.role === 'OWNER' ? 'Property Owner' : 'Student'),
      user?.role || 'STUDENT',
      msgToSend
    );

    setTimeout(() => {
      scrollToBottom(true);
    }, 60);
  };

  return (
    <div 
      className="chat-page-container fixed inset-0 w-full h-full flex flex-col bg-[var(--bg-primary)] dark:bg-[#0F172A] text-gray-900 dark:text-white z-[60] select-none"
      style={{
        height: viewportHeight ? `${viewportHeight}px` : '100dvh',
        maxHeight: viewportHeight ? `${viewportHeight}px` : '100dvh',
      }}
    >
      {/* ── 1. Chat Header: Fixed at top ── */}
      <header className="flex-shrink-0 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs flex items-center justify-between border-b border-gray-100 dark:border-slate-800 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-extrabold text-sm sm:text-base flex-shrink-0 shadow-2xs">
            {recipientName[0] || 'U'}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-1 text-sm sm:text-base truncate">
              <span className="truncate">{recipientName}</span>
              <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
            </h2>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold truncate">
              {displayTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 flex-shrink-0">
          <a
            href={telLink}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Call User"
          >
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </a>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors cursor-pointer"
            title="Delete Conversation"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Delete Conversation Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Delete this conversation?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">This will permanently delete all chat messages in this room for both users.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmDelete(false);
                  const activeChatId = conversation?.id || id;
                  if (activeChatId) {
                    await deleteConversation(activeChatId);
                    navigate(-1);
                  }
                }}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Property Sub-header: Stay below the main chat header ── */}
      <div className="flex-shrink-0 bg-primary-50 dark:bg-primary-950/40 px-4 py-2 text-xs font-semibold text-primary-900 dark:text-primary-200 border-b border-primary-100 dark:border-primary-900/50 flex items-center justify-between z-10">
        <span className="flex items-center gap-1.5 truncate">
          <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <span className="truncate">{displayTitle}</span>
        </span>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase flex-shrink-0 ${
          isAvailable ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
        }`}>
          Status: {propertyStatus}
        </span>
      </div>

      {/* ── 3. Messages Area: Smooth vertical scrollable area ── */}
      <main 
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 bg-[var(--bg-primary)] dark:bg-[#0F172A] overscroll-contain"
      >
        {realtimeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-gray-400 dark:text-gray-500">
            <Building2 className="w-10 h-10 mb-2 text-primary-400/50" />
            <p className="font-semibold text-gray-600 dark:text-gray-300">No messages yet</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Send a message below to start the conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-2.5">
            {realtimeMessages.map((msg) => {
              const isMe = msg.senderId === user?.id || (user?.role === 'OWNER' && msg.senderRole === 'OWNER') || (user?.role === 'STUDENT' && msg.senderRole === 'STUDENT');
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe 
                        ? 'bg-primary-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1">
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">{msg.timestamp}</span>
                    {isMe && (
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">
                        {msg.seen ? ' • Seen ✓✓' : ' • Sent ✓'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1 w-full" />
          </div>
        )}
      </main>

      {/* ── 4. Message Input: WhatsApp-style composer immediately above keyboard ── */}
      <footer className="flex-shrink-0 bg-white dark:bg-slate-900 p-2.5 sm:p-3 border-t border-gray-200 dark:border-slate-800 z-30 shadow-lg pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => {
              setTimeout(() => {
                scrollToBottom(true);
              }, 250);
            }}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-850 text-gray-900 dark:text-white transition-all font-semibold"
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white p-2.5 sm:p-3 rounded-full disabled:opacity-40 disabled:bg-gray-300 dark:disabled:bg-slate-700 transition-all flex items-center justify-center shrink-0 shadow-md cursor-pointer focus:outline-none"
            title="Send Message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}

