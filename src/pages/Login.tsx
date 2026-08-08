import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { loginWithFirebase, sendFirebasePasswordReset } from '../firebase/authService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, AlertCircle, Building2, GraduationCap, Loader2 } from 'lucide-react';

import unidwellLogo from '../assets/unidwell-logo.png';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const isOwner = location.pathname.includes('owner');
  const requiredRole = isOwner ? 'OWNER' : 'STUDENT';

  const { register, handleSubmit, getValues, setValue, setError, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    }
  });

  // Load Remembered email from localStorage if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('unidwell_remember_email');
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setResetMessage('');

    // Handle Remember Me preference
    if (data.rememberMe) {
      localStorage.setItem('unidwell_remember_email', data.email);
    } else {
      localStorage.removeItem('unidwell_remember_email');
    }

    const result = await loginWithFirebase(data.email, data.password, requiredRole);
    setIsSubmitting(false);

    if (!result.success || !result.user) {
      setError('root', { message: result.error || 'Invalid email or password.' });
      return;
    }

    // Save student profile in global state
    login(result.user);

    // Redirect to role-specific dashboard
    if (result.user.role === 'OWNER') {
      navigate('/owner');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues('email')?.trim();
    if (!email) {
      setError('email', { message: 'Please enter your email address to reset password.' });
      return;
    }

    setIsSubmitting(true);
    const result = await sendFirebasePasswordReset(email);
    setIsSubmitting(false);

    if (result.success) {
      setResetMessage(`Password reset link sent to ${email}. Please check your inbox.`);
      showToast('Password reset email sent!');
    } else {
      setError('root', { message: result.error || 'Failed to send reset email.' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center py-4 sm:py-8 px-4">
      {/* Full Logo Display (150 px width) */}
      <div className="mb-4 flex flex-col items-center">
        <img
          src={unidwellLogo}
          alt="Unidwell Brand Logo"
          className="w-[130px] sm:w-[150px] h-auto object-contain rounded-2xl shadow-md border border-gray-100/60 dark:border-slate-800"
        />
      </div>

      {/* Role Toggle Selector */}
      <div className="w-full flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => navigate('/login/student')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            !isOwner ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Student Login
        </button>
        <button
          type="button"
          onClick={() => navigate('/login/owner')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            isOwner ? 'bg-white dark:bg-slate-900 text-secondary-600 dark:text-secondary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Owner Login
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        Sign in as {isOwner ? 'Property Owner' : 'Student'}
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6">
        {isOwner ? 'Manage your property listings & student bookings' : 'Access verified student housing & roommate matches'}
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
        <Input 
          label="Email Address"
          type="email"
          icon={<Mail className="w-5 h-5 text-gray-400" />}
          {...register('email')}
          error={errors.email?.message}
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
        
        <Input 
          label="Password"
          type="password"
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          {...register('password')}
          error={errors.password?.message}
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />

        {errors.root && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        {resetMessage && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3.5 rounded-xl text-xs font-semibold">
            {resetMessage}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input 
              id="remember-me" 
              type="checkbox" 
              {...register('rememberMe')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-700 rounded cursor-pointer dark:bg-slate-800" 
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
              Remember me
            </label>
          </div>
          <div className="text-xs">
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 bg-transparent border-none p-0 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          fullWidth
          disabled={isSubmitting}
          className={isOwner ? 'bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 border-none h-11 text-white font-bold' : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 border-none h-11 text-white font-bold'}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to={isOwner ? '/signup/owner' : '/signup/student'} className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500">
            Sign up as {isOwner ? 'Owner' : 'Student'}
          </Link>
        </p>
      </div>
    </div>
  );
}

