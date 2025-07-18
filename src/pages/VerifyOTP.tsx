import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, AlertCircle, Mail, RefreshCw } from 'lucide-react'
import { toast } from '../utils/toast'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { verifyOTP, sendInvitationOTP } from '../services/otpService'
import { FormField, Button } from '../components/atoms'

// Extract resend countdown logic to useResendCountdown hook
function useResendCountdown(initial: number) {
  const [count, setCount] = useState(initial)
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [count])
  return [count, setCount] as const
}

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate()
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation() // For common translations like users.resendInvitationSuccess
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  // Optionally, get role from query string or default to 'moderator'
  const role = searchParams.get('role') || 'moderator'

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useResendCountdown(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown, setResendCountdown])

  const handleVerifyOTP = async () => {
    if (!email || otp.length !== 6) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await verifyOTP(email, otp)
      if (!result.success) throw new Error(result.error)
      // Set flag for OTP verified
      localStorage.setItem('otp_verified', 'true')
      localStorage.setItem('otp_verified_email', email)
      navigate(`/setup-profile?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verifyEmail.invalidOTP'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) return
    setIsResending(true)
    try {
      const { success, error: resendError } = await sendInvitationOTP(email, role)
      if (!success) throw new Error(resendError)
      setResendCountdown(60)
      toast.success(tCommon('users.resendInvitationSuccess'))
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('users.resendInvitationError'))
      toast.error(tCommon('users.resendInvitationError'))
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4'>
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center'>
          <div className='mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6'>
            <AlertCircle className='w-8 h-8 text-red-600 dark:text-red-400' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('onboarding.invalidInvitation')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mb-6'>{t('onboarding.missingEmail')}</p>
          <Button onClick={() => navigate('/login')} variant='primary' size='md' fullWidth>
            {t('onboarding.goToLogin')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <Shield className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            {t('verifyEmail.title')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            {t('verifyEmail.description')}
          </p>
        </div>
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('verifyEmail.verifyYourEmail')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('verifyEmail.enterCode', { email })}
            </p>
          </div>
          <FormField
            label={t('verifyEmail.verificationCodeLabel')}
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('verifyEmail.verificationCodePlaceholder')}
            maxLength={6}
            pattern="[0-9]{6}"
            icon={<Mail className="w-5 h-5" />}
            size="lg"
          />
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
              <div className='flex items-center'>
                <AlertCircle className='w-5 h-5 text-red-600 dark:text-red-400 mr-2' />
                <span className='text-sm text-red-700 dark:text-red-300'>{error}</span>
              </div>
            </div>
          )}
          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
            loading={isLoading}
            variant="primary"
            size="lg"
            fullWidth
          >
            {t('verifyEmail.verifyCode')}
          </Button>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {t('verifyEmail.didNotReceiveCode')}
            </p>
            <Button
              onClick={handleResendOTP}
              disabled={resendCountdown > 0 || isResending}
              loading={isResending}
              variant="ghost"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {resendCountdown > 0
                ? t('verifyEmail.resendIn', { seconds: resendCountdown })
                : t('verifyEmail.resendCode')
              }
            </Button>
          </div>
        </div>
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {t('verifyEmail.alreadyHaveAccount')}
            <button
              onClick={() => navigate('/login')}
              className='text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium transition-colors'
            >
              {t('verifyEmail.signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
