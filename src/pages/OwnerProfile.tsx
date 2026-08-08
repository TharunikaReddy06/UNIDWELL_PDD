import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import EditProfileModal from '../components/profile/EditProfileModal';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import PrivacySecurityModal from '../components/profile/PrivacySecurityModal';
import HelpSupportModal from '../components/profile/HelpSupportModal';
import AddMobileModal from '../components/profile/AddMobileModal';
import LogoutConfirmationModal from '../components/profile/LogoutConfirmationModal';
import ThemeSettingsModal from '../components/profile/ThemeSettingsModal';
import { 
  ShieldCheck, CheckCircle2, Edit3, Lock, Shield, HelpCircle, 
  LogOut, Phone, Mail, Building2, CreditCard, Clock, Activity, Palette
} from 'lucide-react';

export default function OwnerProfile() {
  const { user, properties } = useStore();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAddMobileOpen, setIsAddMobileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  if (!user) return null;

  const ownerPropertiesCount = properties.filter((p) => p.ownerId === user.id).length;

  // Account Activity Status Logic (Inactivity Rule: >30 Days -> Inactive)
  const is30DaysInactive = user.lastLoginTimestamp
    ? Date.now() - user.lastLoginTimestamp > 30 * 24 * 60 * 60 * 1000
    : false;

  const currentAccountStatus = user.accountStatus === 'Suspended'
    ? 'Suspended'
    : is30DaysInactive
    ? 'Inactive'
    : 'Active';

  // Mask Aadhaar Number (Show only last 4 digits)
  const rawAadhaar = user.aadhaarNumber || '123456788892';
  const digitsOnly = rawAadhaar.replace(/\D/g, '');
  const last4 = digitsOnly.length >= 4 ? digitsOnly.slice(-4) : '8892';
  const maskedAadhaar = `XXXX XXXX ${last4}`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Owner Profile</h2>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-center space-y-6">
          {/* Profile Picture */}
          <div className="relative w-24 h-24 mx-auto cursor-pointer group" onClick={() => setIsEditOpen(true)}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-secondary-200 dark:border-secondary-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-secondary-100 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300 flex items-center justify-center font-black text-3xl border-2 border-secondary-200 dark:border-secondary-800 shadow-sm uppercase">
                {user.name?.[0] || 'O'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-1.5 mb-1">
              {user.name}
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </h3>
            <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-950/50 px-3 py-1 rounded-full border border-secondary-100 dark:border-secondary-900/50 inline-block">
              Aadhaar Verified Badge ✓
            </span>
          </div>

          {/* Account & Activity Details 2-Column Desktop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-left pt-2 border-t border-gray-100 dark:border-slate-800">

            {/* Account Status Badge */}
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-secondary-600 dark:text-secondary-400" /> Account Status
              </span>
              <span className={`font-bold text-xs px-3 py-0.5 rounded-full border ${
                currentAccountStatus === 'Active'
                  ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-300 border-green-200 dark:border-green-800'
                  : currentAccountStatus === 'Inactive'
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}>
                ● {currentAccountStatus}
              </span>
            </div>

            {/* Last Login Timestamp */}
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-secondary-600 dark:text-secondary-400" /> Last Login
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {user.lastLoginDate ? `${user.lastLoginDate} at ${user.lastLoginTime}` : 'Today at Just now'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-secondary-600 dark:text-secondary-400" /> Email Address
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>
            </div>

            {/* Mobile Number */}
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-secondary-600 dark:text-secondary-400" /> Mobile Number
              </span>
              {user.phone ? (
                <span className="font-semibold text-gray-900 dark:text-white">+91 {user.phone}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">Mobile Number : Not Added</span>
                  <Button
                    size="sm"
                    onClick={() => setIsAddMobileOpen(true)}
                    className="bg-secondary-600 text-white text-[10px] px-2.5 py-1 rounded-lg border-none font-bold"
                  >
                    Add Mobile Number
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-secondary-600 dark:text-secondary-400" /> Total Published Properties
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{ownerPropertiesCount} Listed</span>
            </div>
          </div>

          {/* Aadhaar Verification Details */}
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800 text-left">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" /> Aadhaar Information
              </h4>
              <span className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200 dark:border-green-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> Aadhaar Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-green-50/50 dark:bg-green-950/30 p-3.5 rounded-2xl border border-green-100 dark:border-green-900/50">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Aadhaar Number (Masked)</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono tracking-wider">{maskedAadhaar}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Aadhaar Holder Name</span>
                <span className="font-bold text-gray-900 dark:text-white">{user.aadhaarName || user.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Date of Birth</span>
                <span className="font-bold text-gray-900 dark:text-white">{user.dob || '15/08/1985'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Gender</span>
                <span className="font-bold text-gray-900 dark:text-white">{user.gender || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="pt-3 flex flex-col gap-2.5">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsEditOpen(true)}
              className="border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 text-xs font-bold"
            >
              <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsThemeOpen(true)}
              className="border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 text-xs font-bold"
            >
              <Palette className="w-4 h-4 mr-2" /> Theme & Appearance Options
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsPasswordOpen(true)}
              className="border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold"
            >
              <Lock className="w-4 h-4 mr-2" /> Change Password
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsPrivacyOpen(true)}
              className="border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold"
            >
              <Shield className="w-4 h-4 mr-2" /> Privacy & Security
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsHelpOpen(true)}
              className="border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold"
            >
              <HelpCircle className="w-4 h-4 mr-2" /> Help & Support
            </Button>
            <Button
              onClick={() => setIsLogoutOpen(true)}
              fullWidth
              className="bg-red-500 hover:bg-red-600 text-white border-none text-xs font-bold mt-1"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      <ChangePasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
      <PrivacySecurityModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onOpenChangePassword={() => setIsPasswordOpen(true)}
      />
      <HelpSupportModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <AddMobileModal isOpen={isAddMobileOpen} onClose={() => setIsAddMobileOpen(false)} />
      <LogoutConfirmationModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
      <ThemeSettingsModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
    </div>
  );
}
