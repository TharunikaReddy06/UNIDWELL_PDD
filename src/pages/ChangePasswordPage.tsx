import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, changePassword } = useStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!user) return null;

  const isOwner = user.role === 'OWNER';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (user.password && currentPassword !== user.password) {
      setErrorMsg('Current password is incorrect.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and Confirm password must match.');
      return;
    }

    changePassword(newPassword);
    setSuccessMsg('Password Changed Successfully.');

    setTimeout(() => {
      navigate(isOwner ? '/owner/profile' : '/profile');
    }, 1500);
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Update your account security password</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-md space-y-4"
      >
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-2xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Current Password */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 dark:focus:ring-secondary-900/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                placeholder="Enter new password (min. 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 dark:focus:ring-secondary-900/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 dark:focus:ring-secondary-900/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate(isOwner ? '/owner/profile' : '/profile')}
              className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              className={isOwner ? 'bg-secondary-600 text-white border-none font-bold' : 'bg-primary-600 text-white border-none font-bold'}
            >
              Save Password
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
