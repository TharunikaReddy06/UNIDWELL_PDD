import { Link } from 'react-router-dom';
import unidwellLogo from '../../assets/unidwell-logo.png';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs transition-colors duration-150">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-8 border-b border-gray-100 dark:border-slate-800 text-center md:text-left">
        {/* Brand Section */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={unidwellLogo} 
              alt="Unidwell Brand Logo" 
              className="w-12 h-12 object-contain rounded-xl shadow-xs"
            />
            <div>
              <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight block">Unidwell</span>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">Stay Together. Live Better.</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            The premier verified student housing and roommate matching platform connecting college students with authentic property owners.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center md:justify-end gap-6 text-xs font-bold text-gray-600 dark:text-gray-300">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Explore Homes</Link>
          <Link to="/roommates" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Roommate Finder</Link>
          <Link to="/saved" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Saved Listings</Link>
          <Link to="/profile/help" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Help & Support</Link>
          <Link to="/profile/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy & Security</Link>
        </div>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 dark:text-gray-500 font-medium">
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-950/40 px-3 py-1 rounded-full border border-green-100 dark:border-green-900">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Aadhaar & Student ID Verified</span>
        </div>
        <p className="flex items-center gap-1">
          © 2026 Unidwell Platform. Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Students.
        </p>
      </div>
    </footer>
  );
}
