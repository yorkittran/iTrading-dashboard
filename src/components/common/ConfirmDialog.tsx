import React from 'react'
import { AlertTriangle, Trash2, AlertCircle, X, Check } from 'lucide-react'
import { getTypographyClasses, cn } from '../../utils/theme'
import { Button } from '../atoms'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  isLoading?: boolean
  variant?: 'warning' | 'danger' | 'info'
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  variant = isDestructive ? 'danger' : 'warning'
}) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
    case 'danger':
      return {
        iconBg: 'bg-red-100 dark:bg-red-900/20',
        iconColor: 'text-red-600 dark:text-red-400',
        icon: Trash2
      }
    case 'warning':
      return {
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        icon: AlertTriangle
      }
    case 'info':
      return {
        iconBg: 'bg-blue-100 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        icon: AlertCircle
      }
    default:
      return {
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        icon: AlertTriangle
      }
    }
  }

  const { iconBg, iconColor, icon: Icon } = getVariantStyles()

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto' aria-modal='true' role='dialog'>
      {/* Enhanced background overlay */}
      <div
        className='fixed inset-0 backdrop-blur-md bg-black/30 dark:bg-black/50 transition-all duration-300 ease-out'
        onClick={handleBackdropClick}
      />

      {/* Dialog container */}
      <div className='flex min-h-full items-center justify-center p-4'>
        {/* Dialog panel */}
        <div className='relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-md transform transition-all duration-300 ease-out scale-100'>
          <div className='p-6'>
            {/* Icon and content */}
            <div className='flex items-start'>
              <div
                className={cn(
                  'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl shadow-sm',
                  iconBg,
                  'sm:mx-0 sm:h-10 sm:w-10'
                )}
              >
                <Icon className={cn('h-6 w-6', iconColor)} />
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1'>
                <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>{title}</h3>
                <div className='mt-2'>
                  <div className={getTypographyClasses('small')}>
                    {typeof message === 'string' ? <p>{message}</p> : message}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className='mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0'>
              <Button
                variant='secondary'
                size='md'
                leftIcon={X}
                onClick={onClose}
                disabled={isLoading}
                className='w-full sm:w-auto'
              >
                {cancelLabel}
              </Button>
              <Button
                variant={isDestructive ? 'danger' : 'primary'}
                size='md'
                leftIcon={isDestructive ? Trash2 : Check}
                onClick={handleConfirm}
                loading={isLoading}
                loadingText='Processing...'
                className='w-full sm:w-auto'
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
