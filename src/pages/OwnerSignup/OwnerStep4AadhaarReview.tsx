import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import type { ExtractedAadhaarData } from '../../utils/aadhaarOcrService';

interface Props {
  file: File | null;
  aadhaarData: ExtractedAadhaarData | null;
  onConfirm: () => void;
  onReupload: () => void;
}

export default function OwnerStep4AadhaarReview({ file, aadhaarData, onConfirm, onReupload }: Props) {
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto pb-8 bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-950/60 text-secondary-600 dark:text-secondary-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Aadhaar Details Review</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Step 4 of 4: Confirm Your Identity</p>
      </div>

      {/* Uploaded Image Preview */}
      {previewUrl && (
        <div className="mb-6 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden bg-gray-50 dark:bg-slate-800 shadow-sm aspect-[16/9] max-h-48 flex items-center justify-center">
          <img src={previewUrl} alt="Uploaded Aadhaar" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Extracted Details Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50/80 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm mb-8 space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Extracted Aadhaar Information</h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Full Name</span>
            <span className="font-semibold text-gray-900 dark:text-white">{aadhaarData?.name || 'Not Available'}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Aadhaar Number</span>
            <span className="font-mono font-bold text-secondary-700 dark:text-secondary-300 bg-secondary-50 dark:bg-secondary-950/50 px-2 py-0.5 rounded border border-secondary-200 dark:border-secondary-800">
              {aadhaarData?.aadhaarNumber || 'XXXX XXXX 1234'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Date of Birth</span>
            <span className="font-semibold text-gray-900 dark:text-white">{aadhaarData?.dob || 'Not Available'}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Gender</span>
            <span className="font-semibold text-gray-900 dark:text-white">{aadhaarData?.gender || 'Not Available'}</span>
          </div>
        </div>
      </motion.div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onReupload} 
          fullWidth
          className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Re-upload
        </Button>
        <Button 
          onClick={onConfirm} 
          fullWidth 
          className="bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 border-none shadow-md text-white font-bold"
        >
          Confirm & Create Account
        </Button>
      </div>
    </motion.div>
  );
}
