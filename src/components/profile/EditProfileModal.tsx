import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { X, User, Phone, Mail, Camera, AlertCircle } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUserProfile } = useStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');

    // Step 1: Field Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a valid full name.');
      return; // Do NOT close popup or navigate on error
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^\d{10}$/.test(trimmedPhone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit mobile number.');
      return; // Do NOT close popup or navigate on error
    }

    // Step 2: Save updated profile (preserves session, role & ID)
    updateUserProfile({
      name: trimmedName,
      phone: trimmedPhone,
      avatar: avatar.trim(),
    });

    // Step 3: Automatically close Edit Profile popup modal ONLY (no navigation, user session preserved)
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col border border-gray-100 dark:border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update your name, profile photo, and mobile number</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-2xl flex items-center gap-2 flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
            {/* Profile Picture Uploader */}
            <div className="text-center space-y-2">
              <div className="relative w-24 h-24 mx-auto group">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-secondary-200 dark:border-secondary-800"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-secondary-100 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300 flex items-center justify-center font-black text-3xl border-4 border-secondary-200 dark:border-secondary-800 shadow-md uppercase">
                    {name?.[0] || 'U'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-secondary-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-secondary-700 transition-transform hover:scale-110 active:scale-95 border-2 border-white dark:border-slate-900">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Tap camera icon to choose from Camera or Gallery</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-secondary-600 dark:text-secondary-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 dark:focus:ring-secondary-900/40 font-semibold"
              />
            </div>

            {/* Email - READ ONLY */}
            <div>
              <label className="block font-bold text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 rounded-xl cursor-not-allowed font-medium"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-secondary-600 dark:text-secondary-400" /> Mobile Phone Number
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 dark:focus:ring-secondary-900/40 font-semibold"
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              ℹ️ Identity verification details (Aadhaar / Student ID) are verified & read-only.
            </div>

            <div className="flex gap-2 pt-2 flex-shrink-0">
              <Button type="button" variant="outline" fullWidth onClick={onClose} className="text-xs font-bold border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                Cancel
              </Button>
              <Button type="submit" fullWidth className="bg-secondary-600 text-white border-none text-xs font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
