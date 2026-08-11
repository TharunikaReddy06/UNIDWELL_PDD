import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useStore, type RegisteredUser } from '../../store/useStore';
import { signUpOwner } from '../../firebase/authService';
import { sendEmailOTP } from '../../firebase/otpService';

import OwnerStep1PersonalInfo, { type OwnerStep1Data } from './OwnerStep1PersonalInfo';
import Step2EmailVerification from '../StudentSignup/Step2EmailVerification';
import OwnerStep3AadhaarUpload from './OwnerStep3AadhaarUpload';
import OwnerStep4AadhaarReview from './OwnerStep4AadhaarReview';
import type { ExtractedAadhaarData } from '../../utils/aadhaarOcrService';
import unidwellLogo from '../../assets/unidwell-logo.png';

export default function OwnerSignupWizard() {
  const navigate = useNavigate();
  const { registerUser } = useStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OwnerStep1Data>>({});
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendEmailError, setSendEmailError] = useState<string>('');
  
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarData, setAadhaarData] = useState<ExtractedAadhaarData | null>(null);

  const handleStep1 = async (data: OwnerStep1Data) => {
    setIsSendingEmail(true);
    setSendEmailError('');
    
    try {
      setFormData(data);
      const res = await sendEmailOTP(data.email);
      setIsSendingEmail(false);

      if (res.success) {
        setStep(2);
      } else {
        setSendEmailError(res.error || 'Failed to send OTP to your email. Please check your email address.');
      }
    } catch (err: any) {
      setIsSendingEmail(false);
      setSendEmailError(err.message || 'Unable to send OTP. Please try again.');
    }
  };


  const handleStep2Success = () => {
    setStep(3);
  };

  const handleStep3 = (file: File, data: ExtractedAadhaarData) => {
    setAadhaarFile(file);
    setAadhaarData(data);
    setStep(4);
  };

  const handleConfirmAccount = async () => {
    const aadhaarImageUrl = aadhaarFile ? URL.createObjectURL(aadhaarFile) : undefined;

    let extractedGender = aadhaarData?.gender || 'Not Specified';
    if (extractedGender.toUpperCase().includes('FEMALE')) {
      extractedGender = 'Female';
    } else if (extractedGender.toUpperCase().includes('MALE')) {
      extractedGender = 'Male';
    }

    const ownerName = aadhaarData?.name && aadhaarData.name !== 'Not Available' ? aadhaarData.name : formData.name || 'Property Owner';
    const ownerEmail = formData.email || '';
    const ownerPhone = formData.phone || '';
    const ownerPassword = formData.password || 'Owner@123';
    const aadhaarNum = aadhaarData?.aadhaarNumber && aadhaarData.aadhaarNumber !== 'Not Available' ? aadhaarData.aadhaarNumber : 'XXXX XXXX 8892';
    const dob = aadhaarData?.dob && aadhaarData.dob !== 'Not Available' ? aadhaarData.dob : '15/08/1985';

    try {
      const registeredOwner = await signUpOwner(ownerEmail, ownerPassword, {
        fullName: ownerName,
        email: ownerEmail,
        mobileNumber: ownerPhone,
        aadhaarNumber: aadhaarNum,
        aadhaarHolderName: ownerName,
        gender: extractedGender,
        dateOfBirth: dob,
        verificationStatus: 'VERIFIED',
        profilePhoto: aadhaarImageUrl || '',
      });

      registerUser(registeredOwner);
    } catch (err) {
      console.error('Error during Firebase Owner signup:', err);
      // Fallback: register locally if auth fails (e.g. invalid config or user exists)
      const newOwner: RegisteredUser = {
        id: `owner-${Date.now()}`,
        name: ownerName,
        email: ownerEmail,
        phone: ownerPhone,
        password: ownerPassword,
        role: 'OWNER',
        verified: true,
        aadhaarNumber: aadhaarNum,
        aadhaarName: ownerName,
        dob: dob,
        gender: extractedGender,
        aadhaarImage: aadhaarImageUrl,
        accountStatus: 'Active',
      };
      registerUser(newOwner);
    }

    navigate('/owner');
  };


  const goBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-4 sm:py-6 px-2 sm:px-4">
      {/* Brand Logo Header */}
      <div className="mb-4 sm:mb-6 flex flex-col items-center">
        <img
          src={unidwellLogo}
          alt="Unidwell Logo"
          className="w-[125px] sm:w-[150px] h-auto object-contain rounded-2xl shadow-md border border-gray-100/60"
        />
      </div>

      {/* Progress Indicator */}
      <div className="w-full max-w-md mx-auto mb-6 sm:mb-8 px-2 sm:px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-full -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-secondary-500 rounded-full transition-all duration-500 -z-10"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-colors duration-300
                ${step > i ? 'bg-secondary-500 text-white' : 
                  step === i ? 'bg-secondary-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.3)]' : 
                  'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-400'}
              `}
            >
              {i}
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <OwnerStep1PersonalInfo 
              key="owner-step1" 
              onNext={handleStep1} 
              defaultValues={formData} 
              isLoading={isSendingEmail}
              errorMessage={sendEmailError}
            />
          )}
          {step === 2 && (
            <Step2EmailVerification 
              key="owner-step2" 
              email={formData.email || ''} 
              name={formData.name || ''} 
              generatedOtp={generatedOtp}
              setGeneratedOtp={setGeneratedOtp}
              onNext={handleStep2Success} 
              onBack={goBack} 
            />
          )}
          {step === 3 && (
            <OwnerStep3AadhaarUpload 
              key="owner-step3" 
              onNext={handleStep3} 
              onBack={goBack} 
              userGivenName={formData.name}
            />
          )}
          {step === 4 && (
            <OwnerStep4AadhaarReview 
              key="owner-step4" 
              file={aadhaarFile}
              aadhaarData={aadhaarData}
              onConfirm={handleConfirmAccount}
              onReupload={() => setStep(3)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
