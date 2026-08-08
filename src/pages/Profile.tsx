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
  LogOut, Phone, Mail, GraduationCap, FileText, Palette
} from 'lucide-react';

export default function Profile() {
  const { user } = useStore();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAddMobileOpen, setIsAddMobileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Student Profile</h2>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-center space-y-6">
          {/* Profile Picture (or first letter avatar) */}
          <div className="relative w-24 h-24 mx-auto">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-primary-200 dark:border-primary-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-black text-3xl border-2 border-primary-200 dark:border-primary-800 shadow-sm uppercase">
                {user.name?.[0] || 'S'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-1.5 mb-1">
              {user.name}
              <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </h3>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-900/50 inline-block">
              Verified Student ✓
            </span>
          </div>

          {/* Account Information 2-Column Desktop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-left pt-4 border-t border-gray-100 dark:border-slate-800">

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" /> College Name
              </span>
              <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">{user.college || 'SIMATS School of Engineering'}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" /> Email Address
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>
            </div>

            {/* Mobile Number Logic */}
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" /> Mobile Number
              </span>
              {user.phone ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">+91 {user.phone}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditOpen(true)}
                    className="text-[10px] px-2 py-0.5 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 font-bold"
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">Mobile Number : Not Added</span>
                  <Button
                    size="sm"
                    onClick={() => setIsAddMobileOpen(true)}
                    className="bg-primary-600 text-white text-[10px] px-2.5 py-1 rounded-lg border-none font-bold"
                  >
                    Add Mobile Number
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Student ID Information (Verified) */}
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800 text-left">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Student ID Details
              </h4>
              <span className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200 dark:border-green-800">
                Verified ID Card
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-primary-50/50 dark:bg-primary-950/40 p-3.5 rounded-2xl border border-primary-100 dark:border-primary-900/50">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[10px]">College Name</span>
                <span className="font-bold text-gray-900 dark:text-white">{user.college || 'SIMATS Engineering'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Registration Number</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">{user.studentRegNo || 'REG20248891'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Department</span>
                <span className="font-bold text-gray-900 dark:text-white">{user.department || 'Computer Science'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Course / Academic Year</span>
                <span className="font-bold text-gray-900 dark:text-white">{user.course || 'B.Tech'} ({user.academicYear || '2024-2028'})</span>
              </div>
            </div>

            {/* Student ID Preview */}
            <div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">Uploaded Student ID Card Preview</span>
              <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-3 text-white flex justify-between items-center shadow-inner relative overflow-hidden">
                <div className="space-y-0.5 z-10">
                  <span className="text-[9px] font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">STUDENT ID CARD</span>
                  <p className="font-extrabold text-sm">{user.name}</p>
                  <p className="text-[10px] opacity-90">{user.college || 'SIMATS University'}</p>
                  <p className="text-[9px] font-mono opacity-80">ID: {user.studentRegNo || 'REG20248891'}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg border border-white/30 backdrop-blur-sm z-10 uppercase">
                  {user.name?.[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="pt-3 flex flex-col gap-2.5">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsEditOpen(true)}
              className="border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-bold"
            >
              <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsThemeOpen(true)}
              className="border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-bold"
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
