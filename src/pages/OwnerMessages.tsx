import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Building2, MessageSquare, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { useStore } from '../store/useStore';

export default function OwnerMessages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, conversations, markAllNotificationsRead } = useStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    markAllNotificationsRead();
  }, [markAllNotificationsRead]);

  // If navigated with activeChatId/chatId state, open full chat immediately
  useEffect(() => {
    const targetId = location.state?.activeChatId || location.state?.chatId;
    if (targetId) {
      navigate(`/chat/${targetId}`, { replace: true, state: location.state });
    }
  }, [location.state, navigate]);

  // Filter conversations for logged-in owner
  const ownerConversations = conversations.filter((c) =>
    c.ownerId === user?.id || (c.ownerId === 'owner-default' && user?.role === 'OWNER') || !c.ownerId
  );

  const filtered = ownerConversations.filter((c) =>
    (c.studentName && c.studentName.toLowerCase().includes(search.toLowerCase())) ||
    (c.propertyName && c.propertyName.toLowerCase().includes(search.toLowerCase())) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] dark:bg-[#0B1320] text-gray-900 dark:text-white min-h-screen pb-20 transition-colors duration-150">
      <div className="px-6 pt-6 pb-4 shadow-xs sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Student Enquiries &amp; Messages</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Live inquiries and conversations from interested students ({ownerConversations.length})</p>
        <Input 
          icon={<Search className="w-5 h-5 text-gray-400" />}
          placeholder="Search student enquiries or properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-50 dark:bg-slate-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-slate-850"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-6 text-gray-400 dark:text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-secondary-500" />
            <p className="font-bold text-sm text-gray-700 dark:text-gray-300">No student enquiries found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
              Student inquiries will appear here when students express interest or send messages regarding your published properties.
            </p>
          </div>
        ) : (
          filtered.map((chat) => {
            const displayName = chat.studentName || 'Student';
            const displayTitle = chat.propertyName || 'Accommodation';
            return (
              <div 
                key={chat.id} 
                onClick={() => navigate(`/chat/${chat.id}`, { state: { studentName: displayName, propertyTitle: displayTitle } })}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/80 cursor-pointer border-b border-gray-100 dark:border-slate-800/60 transition-colors"
              >
                <div className="relative">
                  <div className="w-13 h-13 rounded-full bg-secondary-100 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300 flex items-center justify-center font-black text-lg shadow-xs flex-shrink-0">
                    {displayName[0] || 'S'}
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-secondary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate flex items-center gap-1">
                      <span className="truncate">{displayName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    </h3>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">{chat.lastTimestamp}</span>
                  </div>
                  <p className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 truncate mb-0.5">{displayTitle}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
