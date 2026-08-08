import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import type { Step1Data } from './Step1PersonalInfo';

interface Props {
  formData?: Partial<Step1Data>;
  onComplete: () => void;
}

export default function Step5Success({ formData, onComplete }: Props) {
  const displayFields = [
    { label: 'Student Name', value: formData?.name || 'Verified Student' },
    { label: 'College Name', value: formData?.college || 'Verified College' },
    { label: 'College Email', value: formData?.email || 'Email Verified' },
    { label: 'Mobile Number', value: formData?.phone || 'Mobile Registered' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto pb-8 bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Account Created Successfully</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Your student account has been registered and verified.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-50/80 dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-2xl p-5 mb-6 space-y-3"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-700">
          <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Registered Profile Summary</h3>
        </div>
        
        <div className="space-y-2.5">
          {displayFields.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
              <span className="font-bold text-gray-900 dark:text-white text-right ml-2 break-all">{item.value}</span>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-gray-200 dark:border-slate-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">Verification Status</span>
            <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-950/50 px-2.5 py-1 rounded-md border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button 
          onClick={onComplete} 
          fullWidth 
          size="lg"
          className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 border-none shadow-lg text-base h-12 flex items-center justify-center gap-2 text-white font-bold"
        >
          Go to Student Dashboard
          <ChevronRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
