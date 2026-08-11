import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import unidwellLogo from '../assets/unidwell-logo.png';

export default function ChooseAccountType() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="flex flex-col min-h-full px-3 sm:px-4 pt-3 sm:pt-6 pb-6 sm:pb-10 relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Decorative Background Elements for Glassmorphism Context */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-100/30 dark:bg-secondary-900/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="mb-6 text-center flex flex-col items-center">
        <img 
          src={unidwellLogo} 
          alt="Unidwell Brand Logo" 
          className="w-[125px] sm:w-[150px] h-auto object-contain rounded-2xl shadow-md mb-3 border border-gray-100/60 dark:border-slate-800"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">
          Create Your Account
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm max-w-sm mx-auto">
          Choose how you want to use Unidwell.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-sm mx-auto w-full"
      >
        {/* Student Card */}
        <motion.div variants={itemVariants}>
          <div 
            className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/40 dark:border-slate-800/60 p-6 rounded-[20px] shadow-sm hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => navigate('/signup/student')}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out"></div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50/80 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-all duration-300 shadow-sm border border-primary-100/50 dark:border-primary-800/40">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  Student
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Find verified rooms, discover compatible roommates, and book student accommodation near your college.
                </p>
              </div>
            </div>

            <Button 
              variant="primary" 
              fullWidth
              className="mt-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 border-none transition-all shadow-md group-hover:shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/signup/student');
              }}
            >
              Continue as Student
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>

        {/* Property Owner Card */}
        <motion.div variants={itemVariants}>
          <div 
            className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/40 dark:border-slate-800/60 p-6 rounded-[20px] shadow-sm hover:shadow-xl hover:border-secondary-200 dark:hover:border-secondary-800 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => navigate('/signup/owner')}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out"></div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-50/80 dark:bg-secondary-950/60 text-secondary-600 dark:text-secondary-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-secondary-100 dark:group-hover:bg-secondary-900/50 transition-all duration-300 shadow-sm border border-secondary-100/50 dark:border-secondary-800/40">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Property Owner
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  List your rental properties, manage bookings, and connect with verified students.
                </p>
              </div>
            </div>

            <Button 
              variant="outline" 
              fullWidth
              className="mt-2 text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-800 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm group-hover:bg-secondary-50 dark:group-hover:bg-secondary-950/40 group-hover:border-secondary-300 transition-colors shadow-sm font-bold"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/signup/owner');
              }}
            >
              Continue as Property Owner
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
