import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { X, Bell, Eye, Users, MessageSquare, CheckCircle2 } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const navigate = useNavigate();
  const { user, notifications, markNotificationRead } = useStore();

  if (!isOpen || !user) return null;

  // Filter notifications for current user:
  // 1. Primary: receiverUid must match current user
  // 2. Defensive: never show notifications sent BY this user (senderUid !== user.id)
  const userNotifications = notifications.filter((n) => {
    const isForMe = (n.receiverUid === user.id) || (!n.receiverUid && n.userId === user.id);
    const isNotFromMe = !n.senderUid || n.senderUid !== user.id;
    return isForMe && isNotFromMe;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_VIEW':
        return <Eye className="w-4 h-4 text-amber-500" />;
      case 'NEW_INTERESTED':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'NEW_MESSAGE':
      case 'OWNER_REPLIED':
        return <MessageSquare className="w-4 h-4 text-secondary-600" />;
      default:
        return <Bell className="w-4 h-4 text-secondary-600" />;
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markNotificationRead(id);
    onClose();
    if (link) {
      navigate(link);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <Bell className="w-5 h-5 text-secondary-600" /> Notifications
              </h3>
              <p className="text-xs text-gray-500">Real-time alerts for views, inquiries & messages</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <Bell className="w-12 h-12 mx-auto text-gray-300 opacity-40" />
              <p className="text-xs font-semibold">No notifications yet</p>
              <p className="text-[11px] text-gray-400">Activity logs and message alerts will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.link)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start ${
                    (notif.isRead ?? notif.read)
                      ? 'bg-gray-50 border-gray-100 text-gray-600'
                      : 'bg-secondary-50/60 border-secondary-200 text-gray-900 shadow-sm'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-bold text-xs truncate text-gray-900">{notif.title}</h4>
                      <span className="text-[9px] text-gray-400 font-medium">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
