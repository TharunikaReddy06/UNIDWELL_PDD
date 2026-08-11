import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Camera, Image as ImageIcon, UploadCloud, FileText, X } from 'lucide-react';
import { processAadhaarOcr, type ExtractedAadhaarData } from '../../utils/aadhaarOcrService';

interface Props {
  onNext: (file: File, aadhaarData: ExtractedAadhaarData) => void;
  onBack: () => void;
  userGivenName?: string;
}

export default function OwnerStep3AadhaarUpload({ onNext, onBack, userGivenName }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selected);
    
    if (selected.type.startsWith('image/')) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
    } else {
      setPreview('pdf');
    }
  };

  const triggerFileInput = (capture: boolean = false) => {
    if (fileInputRef.current) {
      if (capture) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  const clearFile = () => {
    setFile(null);
    if (preview && preview !== 'pdf') URL.revokeObjectURL(preview);
    setPreview(null);
    setError('');
  };

  const handleContinue = async () => {
    if (!file) return;

    setError('');
    setIsProcessing(true);

    try {
      // Perform Real Aadhaar OCR using Tesseract.js
      const result = await processAadhaarOcr(file, userGivenName);

      setIsProcessing(false);

      if (!result.success || !result.data) {
        setError(result.error || "We couldn't read your Aadhaar card clearly. Please upload a clearer image.");
        return;
      }

      onNext(file, result.data);
    } catch (err) {
      console.error('Aadhaar OCR processing error:', err);
      setIsProcessing(false);
      setError("We couldn't read your Aadhaar card clearly. Please upload a clearer image.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm"
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Aadhaar Card Upload</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Step 3 of 4: Identity Verification</p>
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleFileChange}
      />

      {!file ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-secondary-200 dark:border-secondary-900/50 bg-secondary-50/40 dark:bg-secondary-950/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-secondary-600 dark:text-secondary-400 mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Upload your Aadhaar Card</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-[250px] mx-auto">
              Please upload a clear photo or PDF of your valid Aadhaar identity card.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <Button 
                variant="outline" 
                fullWidth 
                className="bg-white dark:bg-slate-800 border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-950/40 font-bold"
                onClick={() => triggerFileInput(true)}
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                className="bg-white dark:bg-slate-800 border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-950/40 font-bold"
                onClick={() => triggerFileInput(false)}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Gallery
              </Button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Accepted: JPG, PNG, PDF (Max 5MB)</p>
          </div>
          
          {error && <p className="text-red-500 dark:text-red-400 text-sm text-center font-medium">{error}</p>}
          
          <Button variant="outline" onClick={onBack} fullWidth className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300">
            Back
          </Button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="relative border border-gray-200 dark:border-slate-700 rounded-2xl p-2 bg-white dark:bg-slate-900 shadow-sm overflow-hidden group">
            <button 
              onClick={clearFile}
              disabled={isProcessing}
              className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center z-10 hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800 flex flex-col items-center justify-center relative">
              {preview === 'pdf' ? (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-red-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-700 dark:text-gray-200">{file.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <img src={preview!} alt="Aadhaar Preview" className="w-full h-full object-cover" />
              )}
            </div>
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm text-center font-medium">{error}</p>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={clearFile} disabled={isProcessing} fullWidth className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300">
              Retake
            </Button>
            <Button 
              onClick={handleContinue} 
              fullWidth 
              disabled={isProcessing}
              className="bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 border-none shadow-md flex items-center justify-center gap-2 text-white font-bold"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-sm font-medium">Extracting Aadhaar Details...</span>
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
