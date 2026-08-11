import { NavLink } from 'react-router-dom';
import { Home, Building2, Users, MessageSquare, User } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function OwnerBottomNavigation() {
  const { user, unreadMessageCount, notifications } = useStore();

  // Only count notifications FOR this user and NOT sent BY this user
  const myNotifications = (notifications || []).filter((n) => {
    const isForMe = (n.receiverUid === user?.id) || (!n.receiverUid && n.userId === user?.id);
    const isNotFromMe = !n.senderUid || n.senderUid !== user?.id;
    return isForMe && isNotFromMe;
  });

  const unreadInterestedCount = myNotifications.filter(
    (n) =>
      !(n.isRead ?? n.read) &&
      (n.type === 'INTERESTED_STUDENT' ||
        n.type === 'STUDENT_INTERESTED' ||
        n.type === 'NEW_INTERESTED' ||
        n.title?.toLowerCase().includes('interested') ||
        n.message?.toLowerCase().includes('interested'))
  ).length;

  const ownerNavItems = [
    { to: '/owner', icon: Home, label: 'Dashboard' },
    { to: '/owner/properties', icon: Building2, label: 'Properties' },
    { to: '/owner/interested-students', icon: Users, label: 'Interested', badge: unreadInterestedCount },
    { to: '/owner/messages', icon: MessageSquare, label: 'Messages', badge: unreadMessageCount || 0 },
    { to: '/owner/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 z-50 transition-colors duration-150 pb-[max(env(safe-area-inset-bottom,0px),4px)]">
      <div className="max-w-md mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {ownerNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/owner'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all relative ${
                  isActive ? 'font-bold scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`
              }
              style={({ isActive }) => isActive ? { color: 'var(--color-primary, #0EA5A4)' } : {}}
            >
              <div className="relative">
                <Icon size={22} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
