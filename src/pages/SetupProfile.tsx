import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, X, Lock } from 'lucide-react';
import { Button, FormField } from '../components/atoms';
import { updateUserProfile } from '../services/userService';
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'

interface SetupProfileForm {
  fullName: string;
  password: string;
  confirmPassword: string;
}

const SetupProfile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [form, setForm] = useState<SetupProfileForm>({
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation() // For common translations

  // Extract password validation logic
  const validatePassword = (password: string, confirmPassword: string) => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    matches: password === confirmPassword && confirmPassword.length > 0
  })
  const passwordValidation = validatePassword(form.password, form.confirmPassword)
  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  useEffect(() => {
    // Check OTP verified flag and email
    const otpVerified = localStorage.getItem('otp_verified') === 'true';
    const otpVerifiedEmail = localStorage.getItem('otp_verified_email');
    if (!otpVerified || otpVerifiedEmail !== email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isPasswordValid) return;
    setLoading(true);
    try {
      const { success, error: updateError } = await updateUserProfile({
        fullName: form.fullName,
        password: form.password,
      });
      if (!success) {
        setError(updateError || t('setupProfile.failedToUpdateProfile'));
        return;
      }
      // Update user status to 'active' in users table
      try {
        const { data: user } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
        if (user?.user?.id) {
          await import('../lib/supabase').then(m => m.supabase
            .from('users')
            .update({ status: 'active' })
            .eq('id', user.user.id)
          );
        }
      } catch (statusError) {
        // Optionally log or handle this error, but don't block the flow
        console.error('Failed to update user status:', statusError);
      }
      // Clear OTP verified flag
      localStorage.removeItem('otp_verified');
      localStorage.removeItem('otp_verified_email');
      navigate('/login');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('setupProfile.failedToUpdateProfile')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <Shield className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            {t('setupProfile.title')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            {t('setupProfile.description')}
          </p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Error Message */}
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
              <div className='flex items-center'>
                <AlertCircle className='w-5 h-5 text-red-600 dark:text-red-400 mr-2' />
                <span className='text-sm text-red-700 dark:text-red-300'>{error}</span>
              </div>
            </div>
          )}
          {/* Full Name Field */}
          <FormField
            label={t('setupProfile.fullName')}
            name='fullName'
            value={form.fullName}
            onChange={handleChange}
            required
            autoFocus
            placeholder={t('setupProfile.enterFullName')}
            size='lg'
          />
          {/* Password Field */}
          <FormField
            label={t('setupProfile.newPassword')}
            name='password'
            type='password'
            value={form.password}
            onChange={handleChange}
            required
            isPasswordField
            showPasswordToggle
            icon={<Lock className='w-5 h-5' />}
            size='lg'
            placeholder={tCommon('general.password')}
          />
          {/* Confirm Password Field */}
          <FormField
            label={t('setupProfile.confirmPassword')}
            name='confirmPassword'
            type='password'
            value={form.confirmPassword}
            onChange={handleChange}
            required
            isPasswordField
            showPasswordToggle
            icon={<Lock className='w-5 h-5' />}
            size='lg'
            placeholder={t('setupProfile.confirmPassword')}
          />
          {/* Password Requirements */}
          <div className='bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4'>
            <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
              {t('setupProfile.passwordRequirements')}
            </p>
            <div className='space-y-2'>
              <PasswordRequirement
                met={passwordValidation.minLength}
                text={t('setupProfile.atLeast8Characters')}
              />
              <PasswordRequirement
                met={passwordValidation.hasUppercase}
                text={t('setupProfile.oneUppercaseLetter')}
              />
              <PasswordRequirement
                met={passwordValidation.hasLowercase}
                text={t('setupProfile.oneLowercaseLetter')}
              />
              <PasswordRequirement
                met={passwordValidation.hasNumber}
                text={t('setupProfile.oneNumber')}
              />
              <PasswordRequirement
                met={passwordValidation.matches}
                text={t('setupProfile.passwordsMatch')}
              />
            </div>
          </div>
          {/* Submit Button */}
          <Button
            type='submit'
            variant='primary'
            size='lg'
            fullWidth
            disabled={!isPasswordValid}
            loading={loading}
            loadingText={t('setupProfile.settingUpProfile')}
          >
            {t('setupProfile.title')}
          </Button>
        </form>
        {/* Footer */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {t('setupProfile.alreadyHaveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              className='text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium transition-colors'
            >
              {t('setupProfile.signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Password Requirement Component
interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text }) => (
  <div className='flex items-center'>
    {met ? (
      <CheckCircle className='w-4 h-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0' />
    ) : (
      <X className='w-4 h-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0' />
    )}
    <span className={`text-sm ${met
      ? 'text-green-700 dark:text-green-300'
      : 'text-red-700 dark:text-red-300'}`}>
      {text}
    </span>
  </div>
);

export default SetupProfile;
