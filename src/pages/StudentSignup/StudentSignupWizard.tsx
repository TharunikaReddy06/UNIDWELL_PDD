import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { signUpStudent } from '../../firebase/authService';
import { sendEmailOTP } from '../../firebase/otpService';
import type { ExtractedIdData } from '../../utils/ocrService';

import Step1PersonalInfo from './Step1PersonalInfo';
import type { Step1Data } from './Step1PersonalInfo';
import Step2EmailVerification from './Step2EmailVerification';
import Step3IdUpload from './Step3IdUpload';
import Step4ReviewDetails from './Step4ReviewDetails';
import type { FinalScannedDetails } from './Step4ReviewDetails';
import Step5Success from './Step5Success';

import unidwellLogo from '../../assets/unidwell-logo.png';

const STEPS = [
  { number: 1, name: 'Personal Details', short: 'Details' },
  { number: 2, name: 'Email OTP', short: 'OTP' },
  { number: 3, name: 'Upload ID', short: 'ID' },
  { number: 4, name: 'Review Details', short: 'Review' },
  { number: 5, name: 'Success', short: 'Done' },
];

export default function StudentSignupWizard() {
  const navigate = useNavigate();
  const { login } = useStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data>>({});
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendEmailError, setSendEmailError] = useState<string>('');
  
  const [collegeIdFile, setCollegeIdFile] = useState<File | null>(null);
  const [collegeIdPreview, setCollegeIdPreview] = useState<string | null>(null);
  const [extractedOcrData, setExtractedOcrData] = useState<ExtractedIdData | null>(null);

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createAccountError, setCreateAccountError] = useState<string>('');

  const handleStep1 = async (data: Step1Data) => {
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

  const handleStep3OcrSuccess = (file: File, previewUrl: string, ocrData: ExtractedIdData) => {
    setCollegeIdFile(file);
    setCollegeIdPreview(previewUrl);
    setExtractedOcrData(ocrData);
    setStep(4);
  };

  const handleStep4Confirm = async (finalDetails: FinalScannedDetails) => {
    setIsCreatingAccount(true);
    setCreateAccountError('');

    try {
      const studentEmail = formData.email || '';
      const studentPassword = formData.password || '';
      const mobileNumber = formData.phone || '';

      // Create Firebase Authentication account & save strictly extracted details in Firestore
      const registeredStudent = await signUpStudent(studentEmail, studentPassword, {
        fullName: finalDetails.fullName || formData.name || 'Student',
        email: studentEmail,
        mobileNumber: mobileNumber,
        collegeName: finalDetails.collegeName || formData.college || '',
        registrationNumber: finalDetails.registrationNumber || '',
        course: finalDetails.course || '',
        department: finalDetails.department || '',
        academicYear: finalDetails.academicYear || '',
      });

      login(registeredStudent);
      setIsCreatingAccount(false);
      setStep(5);
    } catch (err: any) {
      console.error('Error in Student Signup:', err);
      setIsCreatingAccount(false);
      setCreateAccountError(err.message || 'Failed to complete registration. Please try again.');
    }
  };

  const handleComplete = () => {
    navigate('/');
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
      <div className="w-full max-w-xl mx-auto mb-6 sm:mb-8 px-1 sm:px-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-3.5 sm:top-4 transform -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-full -z-10"></div>
          <div 
            className="absolute left-0 top-3.5 sm:top-4 transform -translate-y-1/2 h-1 bg-primary-500 rounded-full transition-all duration-500 -z-10"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((s) => (
            <div key={s.number} className="flex flex-col items-center">
              <div 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs transition-colors duration-300
                  ${step > s.number ? 'bg-primary-500 text-white' : 
                    step === s.number ? 'bg-primary-600 text-white shadow-[0_0_0_3px_rgba(14,165,164,0.3)]' : 
                    'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-400'}
                `}
              >
                {s.number}
              </div>
              <span className={`text-[9px] sm:text-[10px] mt-1 font-semibold text-center max-w-[50px] sm:max-w-[70px] truncate ${step >= s.number ? 'text-primary-700 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.name}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1PersonalInfo 
              key="step1" 
              onNext={handleStep1} 
              defaultValues={formData} 
              isLoading={isSendingEmail}
              errorMessage={sendEmailError}
            />
          )}
          {step === 2 && (
            <Step2EmailVerification 
              key="step2" 
              email={formData.email || ''} 
              name={formData.name || ''} 
              generatedOtp={generatedOtp}
              setGeneratedOtp={setGeneratedOtp}
              onNext={handleStep2Success} 
              onBack={goBack} 
            />
          )}
          {step === 3 && (
            <Step3IdUpload 
              key="step3" 
              onNext={handleStep3OcrSuccess} 
              onBack={goBack} 
              defaultFile={collegeIdFile}
              defaultPreview={collegeIdPreview}
              userGivenName={formData.name}
            />
          )}
          {step === 4 && (
            <Step4ReviewDetails 
              key="step4" 
              formData={formData}
              extractedData={extractedOcrData}
              collegeIdPreview={collegeIdPreview}
              collegeIdFileName={collegeIdFile?.name}
              onConfirm={handleStep4Confirm} 
              onBack={goBack} 
              isLoading={isCreatingAccount}
            />
          )}
          {step === 5 && (
            <Step5Success 
              key="step5" 
              formData={formData}
              onComplete={handleComplete} 
            />
          )}
        </AnimatePresence>

        {createAccountError && step === 4 && (
          <div className="max-w-lg mx-auto mt-4 bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-center text-sm font-medium">
            {createAccountError}
          </div>
        )}
      </div>
    </div>
  );
}

