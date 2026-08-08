import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { MessageSquare, Send, Phone, ArrowLeft, Search, Calendar, Check, X, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { subscribeToChatMessages, markMessagesAsSeenInFirestore } from '../firebase/chatService';
import type { Conversation, ChatMessage } from '../types';

export default function OwnerMessages() {
  const { user, conversations, messages, sendMessage, visitRequests, updateVisitRequestStatus, markAllNotificationsRead, markChatMessagesRead, deleteConversation } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const [showConfirmDeleteChat, setShowConfirmDeleteChat] = useState(false);

  useEffect(() => {
    markAllNotificationsRead();
  }, [markAllNotificationsRead]);

  // Filter conversations for logged-in owner
  const ownerConversations = conversations.filter((c) => c.ownerId === user?.id || (c.ownerId === 'owner-default' && user?.role === 'OWNER'));

  // Subscribe to realtime messages for active chat
  useEffect(() => {
    if (!activeChat?.id) {
      setRealtimeMessages([]);
      return;
    }

    const unsubscribe = subscribeToChatMessages(activeChat.id, (msgs) => {
      setRealtimeMessages(msgs);
      if (user?.id) {
        markChatMessagesRead(activeChat.id).catch(console.error);
      }
    });

    if (user?.id) {
      markChatMessagesRead(activeChat.id).catch(console.error);
    }

    return () => unsubscribe();
  }, [activeChat?.id, user?.id, markChatMessagesRead]);

  // Search conversations by Student Name, College, Property
  const filteredConversations = ownerConversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.studentName.toLowerCase().includes(q) ||
      (c.studentCollege && c.studentCollege.toLowerCase().includes(q)) ||
      c.propertyName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  // Filter visit requests for logged-in owner
  const ownerVisitRequests = visitRequests.filter((r) => r.ownerId === user?.id);
  const pendingVisits = ownerVisitRequests.filter((r) => r.status === 'Pending' || r.status === 'PENDING');

  const [rescheduleReqId, setRescheduleReqId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');

  const handleRescheduleSubmit = (e: React.FormEvent, reqId: string) => {
    e.preventDefault();
    if (!rescheduleDate) return;
    updateVisitRequestStatus(reqId, 'Rescheduled', rescheduleDate, rescheduleTime);
    setRescheduleReqId(null);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !replyText.trim() || !user) return;

    sendMessage(
      activeChat.id,
      user.id,
      user.name,
      'OWNER',
      replyText.trim()
    );

    setReplyText('');
  };

  const rawStudentPhone = (activeChat as any)?.studentPhone || '7842384450';
  const cleanStudentPhone = rawStudentPhone.replace(/\D/g, '');
  const studentTelLink = `tel:${cleanStudentPhone.startsWith('91') ? `+${cleanStudentPhone}` : `+91${cleanStudentPhone}`}`;

  return (
    <div className="chat-page-container fixed inset-0 sm:relative w-full h-screen max-h-screen overflow-hidden flex flex-col md:flex-row bg-[var(--bg-primary)] dark:bg-[#0F172A] text-gray-900 dark:text-white z-40 touch-none select-none">
      {/* ── Fixed Sidebar: 100vh stationary, no scrolling ── */}
      <aside className="w-full md:w-80 lg:w-96 h-full flex-shrink-0 overflow-hidden flex flex-col border-r border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 p-4 space-y-3">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Student Enquiries</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Live chats & enquiries ({ownerConversations.length})</p>
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-secondary-400 shadow-2xs"
          />
        </div>

        {/* Conversation List (non-scrolling visible list) */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-gray-400 dark:text-gray-500">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-bold">No student enquiries</p>
            </div>
          ) : (
            filteredConversations.slice(0, 6).map((conv) => {
              const isSelected = activeChat?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border flex items-center gap-3 flex-shrink-0 select-none ${
                    isSelected
                      ? 'bg-secondary-600 text-white border-secondary-600 shadow-md'
                      : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs uppercase flex-shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-secondary-100 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300'
                  }`}>
                    {conv.studentName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-extrabold text-xs truncate">{conv.studentName}</h4>
                      <span className={`text-[9px] ${isSelected ? 'text-secondary-100' : 'text-gray-400 dark:text-gray-500'}`}>{conv.lastTimestamp}</span>
                    </div>
                    <p className={`text-[10px] truncate font-semibold ${isSelected ? 'text-white' : 'text-secondary-600 dark:text-secondary-400'}`}>{conv.propertyName}</p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>{conv.lastMessage}</p>
                  </div>

                  {conv.unreadCount > 0 && !isSelected && (
                    <span className="bg-secondary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main Chat: 100vh fixed, overflow: hidden, flex-col ── */}
      <main className="flex-1 h-full min-h-0 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
        {activeChat ? (
          <>
            {/* ChatHeader */}
            <header className="flex-shrink-0 px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/80 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setActiveChat(null)} className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="w-9 h-9 rounded-full bg-secondary-100 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300 flex items-center justify-center font-bold text-sm uppercase shadow-2xs">
                  {activeChat.studentName[0]}
                </div>

                <div className="min-w-0">
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 truncate">
                    <span className="truncate">{activeChat.studentName}</span>
                    <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </h4>
                  <p className="text-[11px] text-secondary-600 dark:text-secondary-400 font-semibold truncate">{activeChat.propertyName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={studentTelLink}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">Call Student</span>
                </a>
                <button
                  onClick={() => setShowConfirmDeleteChat(true)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 rounded-xl transition-colors"
                  title="Delete Conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* PropertyHeader */}
            <div className="flex-shrink-0 bg-primary-50/60 dark:bg-primary-950/40 px-4 py-1.5 text-xs font-semibold text-primary-900 dark:text-primary-200 border-b border-primary-100 dark:border-primary-900/50 flex items-center justify-between">
              <span className="truncate">Property: <strong className="text-gray-900 dark:text-white">{activeChat.propertyName}</strong></span>
              <span className="text-[10px] bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                Active Enquiry
              </span>
            </div>

            {/* MessagesArea: NO SCROLL (overflow: hidden, fits inside visible area) */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end p-4 space-y-2.5 bg-[var(--bg-primary)] dark:bg-[#0F172A]">
              {realtimeMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-xs text-gray-400 dark:text-gray-500">
                  <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                  <p className="font-semibold text-gray-600 dark:text-gray-300">No messages yet in this enquiry</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Send a reply below to start chatting with the student.</p>
                </div>
              ) : (
                <div className="flex flex-col justify-end space-y-2 overflow-hidden">
                  {realtimeMessages.slice(-8).map((msg) => {
                    const isMe = msg.senderRole === 'OWNER';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3.5 py-2 rounded-2xl max-w-[85%] sm:max-w-[75%] text-xs leading-relaxed shadow-2xs ${
                          isMe ? 'bg-secondary-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-slate-700'
                        }`}>
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 px-1">
                          <span>{msg.timestamp}</span>
                          {isMe && <span className="text-secondary-600 dark:text-secondary-400 font-bold">{msg.seen ? ' • Seen ✓✓' : ' • Sent ✓'}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MessageInput: ALWAYS VISIBLE AT BOTTOM (position: relative, bottom: auto) */}
            <footer className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative bottom-auto z-20">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type reply to student..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-secondary-400"
                />
                <Button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="bg-secondary-600 text-white border-none px-4 py-2.5 rounded-xl flex items-center justify-center font-bold disabled:opacity-50 flex-shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-gray-500 space-y-2">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <p className="text-xs font-semibold">Select a student enquiry on the left to view conversation & call student</p>
          </div>
        )}
      </main>

      {/* Delete Conversation Confirmation Modal */}
      {showConfirmDeleteChat && (
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
                onClick={() => setShowConfirmDeleteChat(false)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmDeleteChat(false);
                  if (activeChat?.id) {
                    const idToDelete = activeChat.id;
                    setActiveChat(null);
                    await deleteConversation(idToDelete);
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
    </div>
  );
}
