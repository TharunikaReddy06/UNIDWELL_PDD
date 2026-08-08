import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, ShieldCheck, Building2, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { subscribeToChatMessages, markMessagesAsSeenInFirestore } from '../firebase/chatService';
import type { ChatMessage } from '../types';

export default function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, conversations, sendMessage, properties, markChatMessagesRead, deleteConversation } = useStore();
  const [text, setText] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const conversation = conversations.find((c) => c.id === id) || conversations[0];

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

  const linkedProperty = properties.find((p) => p.id === conversation?.propertyId);
  const propertyStatus = linkedProperty?.status || 'Published';
  const isAvailable = propertyStatus === 'Published' || (linkedProperty?.available ?? true);

  const recipientName = user?.role === 'OWNER'
    ? conversation?.studentName || 'Student'
    : conversation?.ownerName || 'Property Owner';

  const rawPhone = user?.role === 'OWNER'
    ? (conversation as any)?.studentPhone
    : (linkedProperty?.ownerPhone || (conversation as any)?.ownerPhone);

  const cleanPhone = (rawPhone || '7842384450').replace(/\D/g, '');
  const telLink = `tel:${cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`}`;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !conversation) return;

    sendMessage(
      conversation.id,
      user?.id || (user?.role === 'OWNER' ? 'owner-default' : 'student-1'),
      user?.name || (user?.role === 'OWNER' ? 'Property Owner' : 'Student'),
      user?.role || 'STUDENT',
      text.trim()
    );

    setText('');
  };

  return (
    <div className="chat-page-container fixed inset-0 w-full h-screen max-h-screen overflow-hidden flex flex-col bg-[var(--bg-primary)] dark:bg-[#0F172A] text-gray-900 dark:text-white z-50 touch-none select-none">
      {/* ── 1. ChatHeader: Stay at the top ── */}
      <header className="flex-shrink-0 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs flex items-center justify-between border-b border-gray-100 dark:border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-extrabold text-base flex-shrink-0 shadow-2xs">
            {recipientName[0]}
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-1 text-sm sm:text-base truncate">
              <span className="truncate">{recipientName}</span>
              <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
            </h2>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold truncate">
              {conversation?.propertyName}
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
            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"
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
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmDelete(false);
                  if (conversation?.id) {
                    await deleteConversation(conversation.id);
                    navigate(-1);
                  }
                }}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. PropertyHeader: Stay below the chat header ── */}
      <div className="flex-shrink-0 bg-primary-50 dark:bg-primary-950/40 px-4 py-2 text-xs font-semibold text-primary-900 dark:text-primary-200 border-b border-primary-100 dark:border-primary-900/50 flex items-center justify-between z-10">
        <span className="flex items-center gap-1.5 truncate">
          <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <span className="truncate">{conversation?.propertyName}</span>
        </span>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase flex-shrink-0 ${
          isAvailable ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
        }`}>
          Status: {propertyStatus}
        </span>
      </div>

      {/* ── 3. MessagesArea: NO SCROLL (overflow: hidden, fits inside visible area) ── */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end p-4 space-y-2.5 bg-[var(--bg-primary)] dark:bg-[#0F172A]">
        {realtimeMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-xs text-gray-400 dark:text-gray-500">
            <Building2 className="w-10 h-10 mb-2 text-primary-400/50" />
            <p className="font-semibold text-gray-600 dark:text-gray-300">No messages yet</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Send a message below to start the conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col justify-end space-y-2.5 overflow-hidden">
            {realtimeMessages.slice(-8).map((msg) => {
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
          </div>
        )}
      </main>

      {/* ── 4. MessageInput: ALWAYS VISIBLE AT BOTTOM (never below viewport) ── */}
      <footer className="flex-shrink-0 bg-white dark:bg-slate-900 p-3 sm:p-4 border-t border-gray-200 dark:border-slate-800 relative bottom-auto z-20">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-850 text-gray-900 dark:text-white transition-all font-semibold"
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-slate-700 transition-colors flex items-center justify-center shrink-0 shadow-md focus:outline-none"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}

