import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Lock, Phone, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

const ownerStep1Schema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().regex(passwordRegex, 'Password does not meet requirements'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword']
});

export type OwnerStep1Data = z.infer<typeof ownerStep1Schema>;

interface Props {
  onNext: (data: OwnerStep1Data) => void;
  defaultValues?: Partial<OwnerStep1Data>;
  isLoading?: boolean;
  errorMessage?: string;
}

export default function OwnerStep1PersonalInfo({ onNext, defaultValues, isLoading = false, errorMessage = '' }: Props) {
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<OwnerStep1Data>({
    resolver: zodResolver(ownerStep1Schema),
    mode: 'onChange',
    defaultValues
  });

  const password = watch('password', '');

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const getStrength = () => {
    if (!password) return { label: '', score: 0, color: 'bg-gray-200', text: 'text-gray-400', level: 0 };
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    if (score <= 2) return { label: 'Weak', score, color: 'bg-red-500', text: 'text-red-500', level: 1 };
    if (score <= 4) return { label: 'Medium', score, color: 'bg-amber-500', text: 'text-amber-500', level: 2 };
    return { label: 'Strong', score, color: 'bg-green-500', text: 'text-green-600', level: 3 };
  };

  const strength = getStrength();

  const PasswordReq = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
      {met ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{text}</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Property Owner Account</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Step 1 of 4: Personal Information</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Full Name"
            icon={<User className="w-5 h-5 text-gray-400" />}
            {...register('name')}
            error={errors.name?.message}
          />

          <Input 
            label="Email Address"
            type="email"
            icon={<Mail className="w-5 h-5 text-gray-400" />}
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <Input 
          label="Mobile Number (Required)"
          type="tel"
          placeholder="10-digit mobile number"
          icon={<Phone className="w-5 h-5 text-gray-400" />}
          {...register('phone')}
          error={errors.phone?.message}
        />

        <div className="space-y-3">
          <Input 
            label="Password"
            type="password"
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            {...register('password')}
            error={errors.password?.message}
          />

          {password && (
            <div className="space-y-1.5 px-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Password Strength:</span>
                <span className={`font-bold ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className={`h-1.5 rounded-full transition-colors duration-300 ${strength.level >= 1 ? strength.color : 'bg-gray-200 dark:bg-slate-700'}`} />
                <div className={`h-1.5 rounded-full transition-colors duration-300 ${strength.level >= 2 ? strength.color : 'bg-gray-200 dark:bg-slate-700'}`} />
                <div className={`h-1.5 rounded-full transition-colors duration-300 ${strength.level >= 3 ? strength.color : 'bg-gray-200 dark:bg-slate-700'}`} />
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-2">
            <PasswordReq met={hasMinLength} text="Min 8 characters" />
            <PasswordReq met={hasUpper} text="1 uppercase letter" />
            <PasswordReq met={hasLower} text="1 lowercase letter" />
            <PasswordReq met={hasNumber} text="1 number" />
            <PasswordReq met={hasSpecial} text="1 special character" />
          </div>
        </div>

        <Input 
          label="Confirm Password"
          type="password"
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-3 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div className="whitespace-pre-line">{errorMessage}</div>
          </div>
        )}

        <Button 
          type="submit" 
          fullWidth 
          size="lg"
          disabled={!isValid || isLoading}
          className="mt-6 bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 border-none shadow-md flex items-center justify-center gap-2 text-white font-bold"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            'Continue'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
