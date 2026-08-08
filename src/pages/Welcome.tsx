import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import unidwellIcon from '../assets/unidwell-icon.png';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center p-4 sm:p-6 w-full max-w-full overflow-x-hidden bg-[var(--bg-primary)] dark:bg-[#0F172A] transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 text-center"
      >
        {/* Top Header: Logo, Name & Tagline */}
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-16 h-16 sm:w-18 sm:h-18 p-1.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xs flex items-center justify-center">
            <img
              src={unidwellIcon}
              alt="Unidwell Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div>
            <h1
              className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Unidwell
            </h1>
            <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-0.5">
              Smart Student Housing
            </p>
          </div>
        </div>

        {/* Welcome Headline & Description */}
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Unidwell
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            Find your perfect student home or list your property near campus.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* Student Login Button */}
          <button
            id="btn-student-login"
            onClick={() => navigate('/login/student')}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            style={{ background: 'linear-gradient(135deg, var(--color-primary, #0EA5A4) 0%, var(--color-secondary, #2563EB) 100%)' }}
          >
            <GraduationCap className="w-5 h-5 flex-shrink-0" />
            <span>Student Login</span>
          </button>

          {/* Property Owner Login Button */}
          <button
            id="btn-owner-login"
            onClick={() => navigate('/login/owner')}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-750 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200 shadow-xs hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <Building2 className="w-5 h-5 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span>Property Owner Login</span>
          </button>
        </div>

        {/* Create Account Link */}
        <div className="pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">New to Unidwell?</p>
          <button
            id="btn-create-account"
            onClick={() => navigate('/choose-account')}
            className="group inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-bold text-sm hover:text-primary-700 dark:hover:text-primary-300 transition-all active:scale-95"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Terms of Service and Privacy Policy */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 w-full">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}


