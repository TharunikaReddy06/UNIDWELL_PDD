import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  Home, 
  Heart, 
  Users, 
  MessageSquare, 
  User, 
  Building2, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  Bell
} from 'lucide-react';

import unidwellIcon from '../../assets/unidwell-icon.png';

export default function WebSidebar() {
  const { user, logout, notifications, unreadMessageCount } = useStore();
  const navigate = useNavigate();

  const isOwner = user?.role === 'OWNER';

  // Only count notifications that are FOR this user and NOT sent BY this user
  const myNotifications = (notifications || []).filter((n) => {
    const isForMe = (n.receiverUid === user?.id) || (!n.receiverUid && n.userId === user?.id);
    const isNotFromMe = !n.senderUid || n.senderUid !== user?.id;
    return isForMe && isNotFromMe;
  });

  const unreadNotifs = myNotifications.filter(n => !(n.isRead ?? n.read)).length;
  const unreadInterestedCount = myNotifications.filter(
    (n) =>
      !(n.isRead ?? n.read) &&
      (n.type === 'INTERESTED_STUDENT' ||
        n.type === 'STUDENT_INTERESTED' ||
        n.type === 'NEW_INTERESTED' ||
        n.title?.toLowerCase().includes('interested') ||
        n.message?.toLowerCase().includes('interested'))
  ).length;

  const studentNavItems = [
    { to: '/', icon: Home, label: 'Explore Homes' },
    { to: '/saved', icon: Heart, label: 'Saved Properties' },
    { to: '/roommates', icon: Users, label: 'Roommate Finder' },
    { to: '/chat', icon: MessageSquare, label: 'Messages', badge: unreadMessageCount || 0 },
    { to: '/profile', icon: User, label: 'My Profile' },
  ];

  const ownerNavItems = [
    { to: '/owner', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/owner/properties', icon: Building2, label: 'My Properties' },
    { to: '/owner/interested-students', icon: Users, label: 'Interested Students', badge: unreadInterestedCount },
    { to: '/owner/messages', icon: MessageSquare, label: 'Bookings & Messages', badge: unreadMessageCount || 0 },
    { to: '/owner/profile', icon: User, label: 'Owner Profile' },
  ];


  const navItems = isOwner ? ownerNavItems : studentNavItems;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 h-screen sticky top-0 shrink-0 z-30 justify-between p-4 xl:p-5 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 overflow-y-auto transition-colors duration-150 scrollbar-hide">
      <div className="space-y-4">
        {/* Brand Logo */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-slate-800">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate(isOwner ? '/owner' : '/')}
            title="Navigate to Dashboard"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary-400/20 rounded-xl blur-md" />
              <img
                src={unidwellIcon}
                alt="Unidwell"
                className="relative w-10 h-10 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <h1 className="font-black text-[18px] tracking-tight text-gray-900 dark:text-white leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Unidwell
              </h1>
              <p className="text-[10px] font-semibold mt-0.5 flex items-center gap-1"
                style={{ color: isOwner ? '#2563EB' : '#0EA5A4' }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {isOwner ? 'Owner Console' : 'Student Housing'}
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div
            className="p-3.5 rounded-2xl border flex items-center gap-3 bg-primary-50/60 dark:bg-slate-800/80 border-primary-100 dark:border-slate-700 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase shadow-sm flex-shrink-0"
              style={{ background: isOwner ? 'linear-gradient(135deg, #2563EB, #1d4ed8)' : 'linear-gradient(135deg, #0EA5A4, #0c9190)', color: '#fff' }}
            >
              {user.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate flex items-center gap-1">
                {user.name || 'User'}
                <ShieldCheck className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
              </h4>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5"
                style={{
                  background: isOwner ? '#2563EB' : '#0EA5A4',
                  color: '#fff',
                }}
              >
                {isOwner ? 'Property Owner' : 'Verified Student'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1">
          <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 block mb-2">
            Main Menu
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/' || item.to === '/owner'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-[12.5px] transition-all duration-200 group ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: 'linear-gradient(135deg, var(--color-primary, #0EA5A4) 0%, var(--color-secondary, #2563EB) 100%)',
                  boxShadow: '0 4px 12px var(--color-accent-glow, rgba(14, 165, 164, 0.3))',
                } : {}}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Action Button for Owners */}
        {isOwner && (
          <div className="pt-1">
            <button
              onClick={() => navigate('/owner/properties')}
              className="w-full text-white py-3 px-4 rounded-2xl text-[12px] font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, var(--color-primary, #0EA5A4) 0%, var(--color-secondary, #2563EB) 100%)' }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Property</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 space-y-2 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[12px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-medium">
          © 2026 Unidwell Platform Inc.
        </p>
      </div>
    </aside>
  );
}

