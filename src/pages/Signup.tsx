import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Mail, Lock } from 'lucide-react';
import { mockStudents } from '../data/mock';
import unidwellLogo from '../assets/unidwell-logo.png';

const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'OWNER'])
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  
  const isOwner = location.pathname.includes('owner');
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: isOwner ? 'OWNER' : 'STUDENT' }
  });

  const onSubmit = (data: SignupFormValues) => {
    // Mock registration
    login({ ...mockStudents[0], name: data.name, role: data.role as any });
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center">
      <img 
        src={unidwellLogo} 
        alt="Unidwell Logo" 
        className="w-[150px] h-auto object-contain rounded-2xl shadow-md mb-4 border border-gray-100/60" 
      />
      
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Create {isOwner ? 'Property Owner' : 'Student'} Account
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
        <Input 
          label="Full Name"
          icon={<User className="w-5 h-5" />}
          {...register('name')}
          error={errors.name?.message}
        />

        <Input 
          label="Email Address"
          type="email"
          icon={<Mail className="w-5 h-5" />}
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Input 
          label="Password"
          type="password"
          icon={<Lock className="w-5 h-5" />}
          {...register('password')}
          error={errors.password?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input type="radio" value="STUDENT" {...register('role')} className="mr-2 text-primary-600 focus:ring-primary-500" />
              Student
            </label>
            <label className="flex items-center">
              <input type="radio" value="OWNER" {...register('role')} className="mr-2 text-primary-600 focus:ring-primary-500" />
              Property Owner
            </label>
          </div>
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
        </div>

        <Button type="submit" fullWidth>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
