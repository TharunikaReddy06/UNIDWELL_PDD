import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, User } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { useStore } from '../store/useStore';

export default function ChatList() {
  const navigate = useNavigate();
  const { user, conversations } = useStore();

  const [search, setSearch] = useState('');

  // Filter conversations for logged in user (student or owner)
  const myConversations = conversations.filter((c) => {
    if (user?.role === 'OWNER') {
      return c.ownerId === user.id || c.ownerId === 'owner-default' || !c.ownerId;
    }
    return c.studentId === user?.id || c.studentId === 'student-1' || !c.studentId;
  });

  const filtered = myConversations.filter((c) =>
    c.propertyName.toLowerCase().includes(search.toLowerCase()) ||
    c.studentName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] dark:bg-[#0B1320] text-gray-900 dark:text-white min-h-screen pb-20 transition-colors duration-150">
      <div className="px-6 pt-12 pb-4 shadow-sm sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Messages &amp; Inquiries</h1>
        <Input 
          icon={<Search className="w-5 h-5 text-gray-400" />}
          placeholder="Search conversations or properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-50 dark:bg-slate-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-slate-850"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-6 text-gray-400 dark:text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">No messages found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {user?.role === 'OWNER' 
                ? 'Student inquiries will appear here when students message your properties.'
                : 'Browse student housing on Home page and tap "Message Owner" to chat!'}
            </p>
          </div>
        ) : (
          filtered.map((chat) => {
            const displayName = user?.role === 'OWNER' ? chat.studentName : (chat.ownerName || 'Property Owner');
            return (
              <div 
                key={chat.id} 
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/80 cursor-pointer border-b border-gray-50 dark:border-slate-800/60 transition-colors"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-extrabold text-xl shadow-sm">
                    {displayName[0] || 'U'}
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{displayName}</h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">{chat.lastTimestamp}</span>
                  </div>
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 truncate mb-0.5">{chat.propertyName}</p>
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
