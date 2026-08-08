import { Component, ReactNode, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AuthLayout from './layouts/AuthLayout';
import Welcome from './pages/Welcome';
import ChooseAccountType from './pages/ChooseAccountType';
import Home from './pages/Home';
import RoommatesHome from './pages/RoommatesHome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentSignupWizard from './pages/StudentSignup/StudentSignupWizard';
import OwnerSignupWizard from './pages/OwnerSignup/OwnerSignupWizard';
import ChatList from './pages/ChatList';
import ChatScreen from './pages/ChatScreen';
import Profile from './pages/Profile';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerProperties from './pages/OwnerProperties';
import OwnerMessages from './pages/OwnerMessages';
import OwnerInterestedStudents from './pages/OwnerInterestedStudents';
import OwnerProfile from './pages/OwnerProfile';
import SavedPropertiesPage from './pages/SavedPropertiesPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import PrivacySecurityPage from './pages/PrivacySecurityPage';
import HelpSupportPage from './pages/HelpSupportPage';
import { useStore } from './store/useStore';
import { subscribeToAuthChanges } from './firebase/authService';
import { subscribeToProperties } from './firebase/propertyService';
import { subscribeToUserChats, subscribeToUnreadMessageCount } from './firebase/chatService';
import { subscribeToSavedRooms } from './firebase/savedRoomsService';
import { subscribeToRoommatePosts } from './firebase/roommatePostService';
import { subscribeToUserNotifications } from './firebase/notificationService';
import { subscribeToUserVisitRequests } from './firebase/visitRequestService';
import { subscribeToOwnerPropertyViews } from './firebase/propertyViewService';
import { subscribeToOwnerInterestedStudents } from './firebase/interestedStudentService';
import { setupPresenceListeners } from './firebase/presenceService';
import SplashScreen from './components/common/SplashScreen';
import { applyThemeToDocument } from './utils/theme';
import { CheckCircle2, X } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error in UI rendering:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
            <p className="text-xs text-gray-500">
              An unexpected application error occurred. Click below to reload the app.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('unidwell-storage');
                window.location.href = '/welcome';
              }}
              className="bg-primary-600 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md hover:bg-primary-700 transition-all w-full"
            >
              Reset & Reload Unidwell
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Wrappers enforcing Independent Navigation Layouts
function StudentRouteWrapper() {
  const { user, authInitialized, authLoading, isLoggingOut } = useStore();
  if (!authInitialized || authLoading) {
    return <SplashScreen />;
  }
  if (!user || isLoggingOut) return <Navigate to="/welcome" replace />;
  if (user.role === 'OWNER') return <Navigate to="/owner" replace />;
  return <MainLayout />;
}

function OwnerRouteWrapper() {
  const { user, authInitialized, authLoading, isLoggingOut } = useStore();
  if (!authInitialized || authLoading) {
    return <SplashScreen />;
  }
  if (!user || isLoggingOut) return <Navigate to="/welcome" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/" replace />;
  return <OwnerLayout />;
}

function AppContent() {
  const { 
    user, 
    authInitialized,
    authLoading,
    isLoggingOut,
    setAuthInitialized,
    setAuthLoading,
    clearAuthState,
    login, 
    logout, 
    setProperties, 
    setConversations, 
    setSavedProperties,
    setRoommatePosts,
    setNotifications,
    setVisitRequests,
    setPropertyViews,
    setInterestedStudentsList,
    setUnreadMessageCount,
    toastMessage,
    toastPopup,
    setToastPopup,
    themeMode,
    accentColor
  } = useStore();

  useEffect(() => {
    applyThemeToDocument(themeMode || 'light', accentColor || 'teal');
  }, [themeMode, accentColor]);

  useEffect(() => {
    const unsubAuth = subscribeToAuthChanges((firestoreUser) => {
      if (firestoreUser && typeof login === 'function') {
        login(firestoreUser);
        if (typeof setAuthInitialized === 'function') setAuthInitialized(true);
        if (typeof setAuthLoading === 'function') setAuthLoading(false);
      } else {
        if (!useStore.getState().isLoggingOut && useStore.getState().user) {
          if (typeof clearAuthState === 'function') clearAuthState();
        }
        if (typeof setAuthInitialized === 'function') setAuthInitialized(true);
        if (typeof setAuthLoading === 'function') setAuthLoading(false);
      }
    });

    const unsubProps = subscribeToProperties((updatedProperties) => {
      if (typeof setProperties === 'function') setProperties(updatedProperties);
    });

    const unsubRoommatePosts = subscribeToRoommatePosts((posts) => {
      if (typeof setRoommatePosts === 'function') setRoommatePosts(posts);
    });

    let unsubChats: (() => void) | null = null;
    let unsubSaved: (() => void) | null = null;
    let unsubNotifs: (() => void) | null = null;
    let unsubVisits: (() => void) | null = null;
    let unsubUnreadMsgs: (() => void) | null = null;
    let unsubViews: (() => void) | null = null;
    let unsubInterests: (() => void) | null = null;
    let unsubPresence: (() => void) | null = null;

    if (user?.id) {
      unsubPresence = setupPresenceListeners(user.id);

      unsubChats = subscribeToUserChats(user.id, user.role, (updatedChats) => {
        if (typeof setConversations === 'function') setConversations(updatedChats);
      });

      unsubSaved = subscribeToSavedRooms(user.id, (savedIds) => {
        if (typeof setSavedProperties === 'function') setSavedProperties(savedIds);
      });

      unsubNotifs = subscribeToUserNotifications(user.id, (notifs) => {
        if (typeof setNotifications === 'function') setNotifications(notifs);
      });

      unsubVisits = subscribeToUserVisitRequests(user.id, user.role, (requests) => {
        if (typeof setVisitRequests === 'function') setVisitRequests(requests);
      });

      unsubUnreadMsgs = subscribeToUnreadMessageCount(user.id, (count) => {
        if (typeof setUnreadMessageCount === 'function') setUnreadMessageCount(count);
      });

      if (user.role === 'OWNER') {
        unsubViews = subscribeToOwnerPropertyViews(user.id, (views) => {
          if (typeof setPropertyViews === 'function') setPropertyViews(views);
        });

        unsubInterests = subscribeToOwnerInterestedStudents(user.id, (interests) => {
          if (typeof setInterestedStudentsList === 'function') setInterestedStudentsList(interests);
        });
      }
    }

    return () => {
      unsubAuth();
      unsubProps();
      unsubRoommatePosts();
      if (unsubPresence) unsubPresence();
      if (unsubChats) unsubChats();
      if (unsubSaved) unsubSaved();
      if (unsubNotifs) unsubNotifs();
      if (unsubVisits) unsubVisits();
      if (unsubUnreadMsgs) unsubUnreadMsgs();
      if (unsubViews) unsubViews();
      if (unsubInterests) unsubInterests();
    };
  }, [user?.id, user?.role, login, logout, setProperties, setConversations, setSavedProperties, setRoommatePosts, setNotifications, setVisitRequests, setPropertyViews, setInterestedStudentsList, setUnreadMessageCount]);

  return (
    <HashRouter>
      {/* Global Toast Notification System */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-gray-700 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Real-time Green Gradient Toast Popup */}
      {toastPopup && (
        <div className="fixed top-5 right-5 z-[110] bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <h4 className="font-extrabold text-xs tracking-wide uppercase">{toastPopup.title}</h4>
            </div>
            <p className="text-xs font-semibold text-emerald-50 leading-snug">{toastPopup.message}</p>
            <span className="text-[10px] font-medium text-emerald-200 block pt-0.5">{toastPopup.timestamp}</span>
          </div>
          <button 
            onClick={() => setToastPopup(null)} 
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Routes>
        <Route path="/splash" element={<SplashScreen />} />
        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/welcome"
            element={
              authInitialized && user && !isLoggingOut
                ? <Navigate to={user.role === 'OWNER' ? "/owner" : "/"} replace />
                : <Welcome />
            }
          />
          <Route path="/choose-account" element={<ChooseAccountType />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/student" element={<Login />} />
          <Route path="/login/owner" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/student" element={<StudentSignupWizard />} />
          <Route path="/signup/owner" element={<OwnerSignupWizard />} />
        </Route>
        
        {/* Student Only Routes */}
        <Route element={<StudentRouteWrapper />}>
          <Route path="/" element={<Home />} />
          <Route path="/student/dashboard" element={<Home />} />
          <Route path="/saved" element={<SavedPropertiesPage />} />
          <Route path="/roommates" element={<RoommatesHome />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:id" element={<ChatScreen />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/change-password" element={<ChangePasswordPage />} />
          <Route path="/profile/privacy" element={<PrivacySecurityPage />} />
          <Route path="/profile/help" element={<HelpSupportPage />} />
        </Route>

        {/* Owner Only Routes */}
        <Route element={<OwnerRouteWrapper />}>
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/properties" element={<OwnerProperties />} />
          <Route path="/owner/interested-students" element={<OwnerInterestedStudents />} />
          <Route path="/owner/messages" element={<OwnerMessages />} />
          <Route path="/owner/profile" element={<OwnerProfile />} />
          <Route path="/owner/profile/change-password" element={<ChangePasswordPage />} />
          <Route path="/owner/profile/privacy" element={<PrivacySecurityPage />} />
          <Route path="/owner/profile/help" element={<HelpSupportPage />} />
        </Route>
        
        <Route
          path="*"
          element={
            !authInitialized || authLoading ? (
              <SplashScreen />
            ) : (
              <Navigate
                to={
                  user && !isLoggingOut
                    ? (user.role === 'OWNER' ? '/owner' : '/')
                    : '/welcome'
                }
                replace
              />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}
