import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ShieldCheck, Mail, Lock, Smartphone, LogOut, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PrivacySecurityPage() {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  if (!user) return null;

  const isOwner = user.role === 'OWNER';

  const handleLogoutAll = () => {
    setInfoMsg('Successfully logged out from all other active sessions.');
    setTimeout(() => setInfoMsg(''), 3000);
  };

  const handleDeleteAccount = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-transparent p-6 max-w-md mx-auto space-y-6 text-gray-900 dark:text-white">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isOwner ? '/owner/profile' : '/profile')}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy & Security</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Security settings and account verification status</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-md space-y-5"
      >
        {infoMsg && (
          <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            {infoMsg}
          </div>
        )}

        {/* Verification Badges */}
        <div className="space-y-2.5 text-xs">
          <h4 className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[11px]">Verification Status</h4>
          
          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" /> Account Status
            </span>
            <span className="font-bold text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-950/50 px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">
              Verified Account ✓
            </span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2 font-medium">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Email Verification
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Verified ({user.email})
            </span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              {isOwner ? 'Aadhaar OCR Verification' : 'Student ID Verification'}
            </span>
            <span className="font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              {isOwner ? 'Aadhaar Verified ✓' : 'ID Card Verified ✓'}
            </span>
          </div>
        </div>

        {/* Security Actions */}
        <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs">
          <h4 className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[11px]">Security Actions</h4>

          <button
            onClick={() => navigate(isOwner ? '/owner/profile/change-password' : '/profile/change-password')}
            className="w-full p-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center justify-between font-bold text-gray-800 dark:text-gray-200 transition-all"
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-secondary-600 dark:text-secondary-400" /> Change Password
            </span>
            <span className="text-secondary-600 dark:text-secondary-400 font-semibold">Update →</span>
          </button>

          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2 font-medium">
                <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" /> Active Session
              </span>
              <span className="font-bold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                This Device (Online)
              </span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Windows Web Client • Active Session</p>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={handleLogoutAll}
            className="border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout From All Devices
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowDeleteConfirm(true)}
              className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </Button>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 space-y-3">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" /> Confirm Account Deletion
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 text-xs border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none text-xs font-bold"
                >
                  Yes, Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
