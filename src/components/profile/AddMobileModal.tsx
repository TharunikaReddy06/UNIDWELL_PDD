import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { X, Phone, CheckCircle2 } from 'lucide-react';

interface AddMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMobileModal({ isOpen, onClose }: AddMobileModalProps) {
  const { user, updateUserProfile } = useStore();
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    updateUserProfile({ phone: cleanPhone });
    setSuccessMsg('Mobile Number added successfully!');

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-4 border border-gray-100 dark:border-slate-800"
        >
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Phone className="w-5 h-5 text-secondary-600 dark:text-secondary-400" /> Add Mobile Number
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enter your 10-digit contact mobile number</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Mobile Phone Number</label>
              <div className="flex gap-2">
                <span className="px-3.5 py-2.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 dark:focus:ring-secondary-900/40 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" fullWidth onClick={onClose} className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                Cancel
              </Button>
              <Button type="submit" fullWidth className="bg-secondary-600 text-white border-none">
                Save Number
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
