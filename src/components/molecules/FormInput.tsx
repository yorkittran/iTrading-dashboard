import React from 'react'
import { Mail, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react'

interface FormInputProps {
  name: string
  label: string
  type?: string
  placeholder: string
  required?: boolean
  disabled?: boolean
  helpText?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  error?: string
  icon?: 'email' | 'user' | 'phone' | 'none'
}

// Helper function for field icons
const getFieldIcon = (iconType: string, hasError: boolean, hasValue: boolean) => {
  const iconClass = `w-5 h-5 transition-colors ${
    hasError ? 'text-red-500' : hasValue ? 'text-green-500' : 'text-gray-400'
  }`

  switch (iconType) {
  case 'email':
    return <Mail className={iconClass} />
  case 'user':
    return <User className={iconClass} />
  case 'phone':
    return <Phone className={iconClass} />
  case 'none':
    return null
  default:
    return null
  }
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  helpText,
  value,
  onChange,
  onBlur,
  error,
  icon = 'none'
}) => {
  const hasError = !!error
  const hasValue = !!value
  const showIcon = icon !== 'none'

  return (
    <div className='space-y-2'>
      <label htmlFor={name} className='block text-sm font-semibold text-gray-800 dark:text-gray-200'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <div className='relative group'>
        {showIcon && (
          <div className='absolute left-3 top-1/2 transform -translate-y-1/2 z-10'>
            {getFieldIcon(icon, hasError, hasValue)}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full ${showIcon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 border-2 rounded-xl
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-2 dark:focus:ring-white dark:focus:border-white
            focus:w-[22rem] max-w-full
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${
              hasError
                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }
            ${disabled ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed opacity-75' : ''}
          `}
          placeholder={placeholder}
        />
        {hasValue && !hasError && !disabled && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            <CheckCircle2 className='w-5 h-5 text-green-500' />
          </div>
        )}
      </div>
      {hasError && (
        <div className='flex items-center space-x-2 text-red-600'>
          <AlertCircle className='w-4 h-4' />
          <p className='text-sm font-medium'>{error}</p>
        </div>
      )}
      {helpText && !hasError && <p className='text-sm text-gray-500 dark:text-gray-400'>{helpText}</p>}
    </div>
  )
}

export default FormInput
