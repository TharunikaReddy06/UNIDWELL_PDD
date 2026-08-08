import { Outlet, NavLink } from 'react-router-dom';
import { Home, Heart, Users, MessageSquare, User } from 'lucide-react';
import WebSidebar from '../components/navigation/WebSidebar';
import WebHeader from '../components/navigation/WebHeader';
import Footer from '../components/navigation/Footer';
import { useStore } from '../store/useStore';

export default function MainLayout() {
  const { unreadMessageCount } = useStore();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/saved', icon: Heart, label: 'Saved' },
    { to: '/roommates', icon: Users, label: 'Roommates' },
    { to: '/chat', icon: MessageSquare, label: 'Chat', badge: unreadMessageCount },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex w-full max-w-full overflow-x-hidden bg-[var(--bg-primary)] dark:bg-[#0B1320] text-gray-900 dark:text-gray-100 transition-colors duration-150">
      {/* Desktop Left Sidebar */}
      <WebSidebar />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Top Header */}
        <WebHeader />

        {/* Responsive Content Area with 1600px Centered Container */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-8 flex flex-col justify-between overflow-x-hidden">
          <div>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      {/* Mobile Bottom Navigation (Hidden on Desktop lg:hidden) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 z-50 shadow-lg">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
                    isActive ? 'text-primary-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                <div className="relative">
                  <Icon size={22} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
