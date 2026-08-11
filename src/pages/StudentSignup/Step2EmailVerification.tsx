import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { verifyOTP, sendEmailOTP } from '../../firebase/otpService';

interface Props {
  email: string;
  name: string;
  generatedOtp: string;
  setGeneratedOtp: (otp: string) => void;
  onNext: () => void;
  onBack: () => void;
  initialError?: string;
}

export default function Step2EmailVerification({
  email,
  name,
  onNext,
  onBack,
  initialError = ''
}: Props) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes (300 seconds)
  const [error, setError] = useState<string>(initialError);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 5-minute (300s) countdown timer formatted as MM:SS
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    setError('');
    setSuccessMessage('');
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (timer > 0 || isResending) return;
    
    setError('');
    setSuccessMessage('');
    setIsResending(true);

    const result = await sendEmailOTP(email);
    setIsResending(false);

    if (result.success) {
      setSuccessMessage('OTP Sent Successfully');
      setTimer(300); // Reset 5-minute timer
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || 'Unable to send verification email. Please try again.');
    }
  };

  const handleVerify = async () => {
    setError('');
    setSuccessMessage('');

    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    const result = await verifyOTP(email, enteredOtp);
    setIsVerifying(false);

    if (result === true) {
      setSuccessMessage('Verified Successfully');
      setTimeout(() => {
        onNext();
      }, 800);
    } else if (result === 'expired') {
      setError('OTP Expired. Please click Resend OTP to receive a new code.');
    } else {
      setError('Invalid OTP. Please check the code sent to your email.');
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm"
    >
      <div className="text-center mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Verify Your Email</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Step 2 of 5</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 sm:space-y-6"
      >
        <div className="text-center bg-gray-50 dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-950/60 rounded-full flex items-center justify-center mx-auto mb-2 text-primary-600 dark:text-primary-400">
            <Mail className="w-5 h-5" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-1">We have sent a 6-digit OTP to:</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base break-all">{email}</p>
          
          {/* Countdown Timer */}
          <div className="mt-2 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/50 inline-block px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800">
            OTP expires in: <span className="font-mono font-bold text-sm">{formatTimer(timer)}</span>
          </div>
        </div>

        {/* 6 OTP Input Boxes */}
        <div className="flex justify-center items-center gap-1.5 sm:gap-2.5 w-full">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-9 sm:w-11 max-w-[44px] flex-1 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/40 outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-xs"
            />
          ))}
        </div>

        {/* Error or Success Message Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-3 rounded-xl text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-xl text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col gap-2.5 sm:gap-3 pt-1">
          {/* Verify Email Button */}
          <Button
            onClick={handleVerify}
            fullWidth
            size="lg"
            disabled={!isOtpComplete || isVerifying || isResending}
            className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 border-none shadow-md flex items-center justify-center gap-2 text-white font-bold py-3 sm:py-3.5"
          >
            {isVerifying ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Verify OTP
              </>
            )}
          </Button>

          {/* Resend Code Button with 5-min countdown */}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={timer > 0 || isResending}
            className={`text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 py-1.5 ${
              timer > 0 || isResending
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold cursor-pointer'
            }`}
          >
            {isResending ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></span>
                <span>Sending new OTP...</span>
              </>
            ) : timer > 0 ? (
              `Resend OTP in ${formatTimer(timer)}`
            ) : (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-4 h-4" /> Resend OTP
              </span>
            )}
          </button>

          {/* Change Email / Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors underline"
          >
            Change Email Address
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
