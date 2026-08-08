import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  Bell, 
  Search, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  GraduationCap,
  LogOut,
  ChevronDown,
  Trash2,
  Eye,
  Calendar,
  CheckCircle2,
  XCircle,
  Heart,
  MessageSquare,
  AlertTriangle,
  X,
  Menu,
  Home,
  Users,
  LayoutDashboard
} from 'lucide-react';

import unidwellIcon from '../../assets/unidwell-icon.png';

export default function WebHeader() {
  const { user, logout, notifications, markAllNotificationsRead, deleteNotification, clearAllNotifications, shakeBell } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confirmation Modals
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const isOwner = user?.role === 'OWNER';
  const unreadNotifs = (notifications || []).filter(n => !(n.isRead ?? n.read));

  const handleToggleNotifications = () => {
    const nextShow = !showNotifications;
    setShowNotifications(nextShow);
    if (nextShow) {
      markAllNotificationsRead();
    }
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSec < 30) return 'Just now';
    if (diffInSec < 60) return `${diffInSec}s ago`;
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `${diffInMin}m ago`;
    const diffInHrs = Math.floor(diffInMin / 60);
    if (diffInHrs < 24) return `${diffInHrs}h ago`;
    const diffInDays = Math.floor(diffInHrs / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INTERESTED_STUDENT':
      case 'NEW_INTERESTED':
        return <Heart className="w-4 h-4 text-purple-600 flex-shrink-0" />;
      case 'PROPERTY_VIEWS':
      case 'NEW_VIEW':
        return <Eye className="w-4 h-4 text-blue-600 flex-shrink-0" />;
      case 'VISIT_REQUEST':
        return <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />;
      case 'VISIT_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
      case 'VISIT_REJECTED':
      case 'VISIT_CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />;
      case 'PROPERTY_UPDATED':
      case 'PROPERTY_UNAVAILABLE':
        return <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />;
      case 'BOOKING_CONFIRMED':
        return <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
      case 'SUPPORT_REPLY':
      case 'PROPERTY_REVIEW':
      default:
        return <MessageSquare className="w-4 h-4 text-teal-600 flex-shrink-0" />;
    }
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Explore Student Properties';
    if (p === '/saved') return 'Saved Properties';
    if (p === '/roommates') return 'Roommate Matcher';
    if (p.startsWith('/chat')) return 'Messages & Conversations';
    if (p === '/profile') return 'My Profile';
    if (p === '/owner') return 'Owner Dashboard';
    if (p === '/owner/properties') return 'Property Management';
    if (p === '/owner/messages') return 'Student Enquiries';
    if (p === '/owner/profile') return 'Owner Profile';
    return 'Unidwell Platform';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!isOwner) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/owner/messages?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs transition-colors duration-150">
      {/* Brand & Page Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Button (<1024px lg:hidden) */}
        <button
          type="button"
          onClick={() => setShowMobileDrawer(true)}
          className="lg:hidden p-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile / Navbar Logo (42x42 px icon + text beside it) */}
        <div 
          onClick={() => navigate(isOwner ? '/owner' : '/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Unidwell Home"
        >
          <img 
            src={unidwellIcon} 
            alt="Unidwell Logo" 
            className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform" 
          />
          <div className="hidden sm:block">
            <span className="font-black text-lg text-gray-900 dark:text-white tracking-tight block leading-none">Unidwell</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold block mt-0.5">{isOwner ? 'Owner Console' : 'Student Platform'}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 hidden sm:block" />

        <div>
          <h1 className="text-sm sm:text-lg font-extrabold text-gray-900 dark:text-white leading-tight truncate max-w-[150px] sm:max-w-none">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-80 lg:w-96">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isOwner ? "Search student inquiries or properties..." : "Search by college, location, or PG name..."}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl text-xs font-semibold outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all shadow-2xs"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Owner Badge */}
        {user && isOwner && (
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-secondary-50 dark:bg-secondary-950/60 border border-secondary-100 dark:border-secondary-900 text-secondary-700 dark:text-secondary-300 text-xs font-bold shadow-2xs">
            <Building2 className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
            <span>Owner Console</span>
          </div>
        )}


        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className={`p-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-all relative border border-gray-100 dark:border-slate-700 ${
              shakeBell ? 'animate-bounce text-red-500 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900' : ''
            }`}
            title="Notifications"
          >
            <Bell className={`w-5 h-5 ${shakeBell ? 'text-red-600' : ''}`} />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs flex items-center justify-center min-w-[18px]">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Notifications
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2.5">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !(n.isRead ?? n.read);
                    return (
                      <div
                        key={n.id || n.notificationId}
                        className={`p-3 rounded-2xl transition-all border relative group ${
                          isUnread
                            ? 'border-l-4 border-l-purple-600 border-purple-100 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/30'
                            : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-gray-50/80 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {getNotificationIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate flex items-center gap-1">
                                {n.title}
                                {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block" />}
                              </h4>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold flex-shrink-0">
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(n.id || n.notificationId);
                            }}
                            title="Delete notification"
                            className="text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors flex-shrink-0 opacity-80 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-100 dark:border-slate-700"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                isOwner ? 'bg-gradient-to-r from-secondary-600 to-secondary-500' : 'bg-gradient-to-r from-primary-600 to-primary-500'
              }`}>
                {user.name[0]}
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 hidden sm:block max-w-[120px] truncate">{user.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in duration-200">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 mb-1">
                  <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    navigate(isOwner ? '/owner/profile' : '/profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  View Profile
                </button>

                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-primary-600 text-white font-bold text-xs px-4 py-2 rounded-2xl hover:bg-primary-700 transition-colors shadow-xs"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Single Notification Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Delete Notification?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Are you sure you want to delete this notification?</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const idToDelete = confirmDeleteId;
                  setConfirmDeleteId(null);
                  if (idToDelete) {
                    await deleteNotification(idToDelete);
                  }
                }}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Notifications Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Clear All Notifications?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">This will permanently delete all notifications from your account.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmClear(false);
                  await clearAllNotifications();
                }}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Mobile Navigation Drawer (<1024px) */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-[130] flex lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setShowMobileDrawer(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 text-gray-900 dark:text-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-300 border-r border-gray-100 dark:border-slate-800">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={unidwellIcon} alt="Unidwell" className="w-10 h-10 object-contain rounded-xl shadow-xs" />
                  <div>
                    <h2 className="font-black text-lg text-gray-900 dark:text-white leading-none">Unidwell</h2>
                    <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 mt-0.5">{isOwner ? 'Owner Console' : 'Student Housing'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileDrawer(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Badge */}
              {user && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{user.name}</h4>
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 block truncate">{user.email}</span>
                  </div>
                </div>
              )}

              {/* Drawer Links */}
              <nav className="space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 block mb-2">Navigation</span>
                
                {!isOwner ? (
                  <>
                    <button
                      onClick={() => { navigate('/'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                      <Home className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span>Explore Homes</span>
                    </button>
                    <button
                      onClick={() => { navigate('/saved'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Saved Properties</span>
                    </button>
                    <button
                      onClick={() => { navigate('/roommates'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                      <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Roommate Matcher</span>
                    </button>
                    <button
                      onClick={() => { navigate('/chat'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Messages &amp; Chat</span>
                    </button>
                    <button
                      onClick={() => { navigate('/profile'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Student Profile</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/owner'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-slate-800 hover:text-secondary-700 dark:hover:text-secondary-400 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                      <span>Owner Dashboard</span>
                    </button>
                    <button
                      onClick={() => { navigate('/owner/properties'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-slate-800 hover:text-secondary-700 dark:hover:text-secondary-400 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span>My Properties</span>
                    </button>
                    <button
                      onClick={() => { navigate('/owner/interested-students'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-slate-800 hover:text-secondary-700 dark:hover:text-secondary-400 transition-colors"
                    >
                      <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Interested Students</span>
                    </button>
                    <button
                      onClick={() => { navigate('/owner/messages'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-slate-800 hover:text-secondary-700 dark:hover:text-secondary-400 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Student Enquiries</span>
                    </button>
                    <button
                      onClick={() => { navigate('/owner/profile'); setShowMobileDrawer(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-slate-800 hover:text-secondary-700 dark:hover:text-secondary-400 transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Owner Profile</span>
                    </button>
                  </>
                )}
              </nav>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={async () => {
                  setShowMobileDrawer(false);
                  await logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs hover:bg-red-100 dark:hover:bg-red-950/70 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
