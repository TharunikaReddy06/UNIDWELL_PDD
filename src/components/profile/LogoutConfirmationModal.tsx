import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { X, LogOut, AlertCircle } from 'lucide-react';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutConfirmationModal({ isOpen, onClose }: LogoutConfirmationModalProps) {
  const navigate = useNavigate();
  const { logout } = useStore();

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative space-y-4 text-center border border-gray-100 dark:border-slate-800"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <LogOut className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Confirm Logout</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Are you sure you want to logout? You will need to log in again to access your account.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" fullWidth onClick={onClose} className="text-xs border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLogout}
              fullWidth
              className="bg-red-600 hover:bg-red-700 text-white border-none font-bold text-xs"
            >
              Logout
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
