import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { UploadCloud, AlertCircle, ScanLine, Loader2 } from 'lucide-react';
import { processIdCardOcr, type ExtractedIdData } from '../../utils/ocrService';

interface Props {
  onNext: (file: File, previewUrl: string, extractedData: ExtractedIdData) => void;
  onBack: () => void;
  defaultFile?: File | null;
  defaultPreview?: string | null;
  userGivenName?: string;
}

export default function Step3IdUpload({ onNext, onBack, defaultFile, defaultPreview, userGivenName }: Props) {
  const [file, setFile] = useState<File | null>(defaultFile || null);
  const [preview, setPreview] = useState<string | null>(defaultPreview || null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selected: File) => {
    setError('');

    // Format check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selected.type.toLowerCase()) && !selected.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
      setError('Invalid format. Please upload a JPG, PNG, JPEG image or PDF document.');
      return;
    }

    // Size check (max 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5 MB limit. Please upload a smaller file.');
      return;
    }

    setFile(selected);

    // Read Data URL for preview
    let previewUrl = 'pdf';
    if (selected.type.startsWith('image/')) {
      previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selected);
      });
    }
    setPreview(previewUrl);

    // Run OCR Scanner automatically
    setIsScanning(true);
    setScanStage('Scanning College ID Image...');

    try {
      setScanStage('Extracting Details from College ID...');
      const ocrResult = await processIdCardOcr(selected, userGivenName);

      if (!ocrResult.success || !ocrResult.data) {
        setIsScanning(false);
        setError("Unable to read the College ID clearly. Please upload a clearer image.");
        return;
      }

      setScanStage('ID Card Scanned Successfully!');
      setTimeout(() => {
        setIsScanning(false);
        onNext(selected, previewUrl, ocrResult.data!);
      }, 400);
    } catch (err: any) {
      console.error('OCR Error:', err);
      setIsScanning(false);
      setError("Unable to read the College ID clearly. Please upload a clearer image.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleFileSelect(selected);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Upload College ID</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Step 3 of 5 — Upload your student ID card to scan</p>
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        onChange={handleInputChange}
      />

      {isScanning ? (
        /* OCR Loading Scanner Animation */
        <div className="border-2 border-primary-300 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-950/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md text-primary-600 dark:text-primary-400">
            <ScanLine className="w-10 h-10 animate-pulse text-primary-600 dark:text-primary-400" />
            <div className="absolute inset-0 border-2 border-primary-500 rounded-2xl animate-ping opacity-30"></div>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600 dark:text-primary-400" />
              <span>Scanning ID Card</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">{scanStage}</p>
          </div>
          <div className="w-full max-w-xs bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div className="space-y-6">
          <div 
            onClick={triggerFileInput}
            className="border-2 border-dashed border-primary-300 dark:border-primary-800 hover:border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 hover:bg-primary-50/80 dark:hover:bg-primary-950/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
          >
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md text-primary-600 dark:text-primary-400 mb-3">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Upload College ID</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-[260px] mx-auto">
              Upload a clear photo or PDF of your student ID card. OCR will automatically extract details.
            </p>
            <Button variant="primary" type="button" size="sm" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
              Select Image File
            </Button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Accepted: JPG, PNG, JPEG, PDF (Max 5MB)</p>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-3.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} fullWidth className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300">
              Back
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

