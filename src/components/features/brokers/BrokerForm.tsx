import React, { useMemo, useCallback, useState } from 'react'
import { X, Save, Plus, Building2, Calendar, MapPin } from 'lucide-react'
import type { Broker, BrokerInsert, Image } from '../../../types'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField, Textarea } from '../../atoms'
import { MainImageUpload } from '../images'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import { supabase } from '../../../lib/supabase'
import type { UploadResult } from '../../../hooks/useFileUpload'

// Move schema outside component to prevent re-renders
const BROKER_FORM_SCHEMA = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Broker name must be between 2 and 100 characters'
  },
  established_in: {
    min: 1800,
    max: new Date().getFullYear(),
    custom: (value: number | null) => !value || (value >= 1800 && value <= new Date().getFullYear()),
    message: 'Please enter a valid year between 1800 and current year'
  },
  headquarter: {
    maxLength: 100,
    message: 'Headquarter must be less than 100 characters'
  },
  description: {
    minLength: 10,
    message: 'Description must be at least 10 characters'
  }
} as const

interface BrokerFormProps {
  broker?: Broker | null
  onSubmit: (data: BrokerInsert, logoImage?: (Partial<Image> & { file?: File }) | null) => void
  onCancel: () => void
  images?: Image[] | null
}

const BrokerForm: React.FC<BrokerFormProps> = ({ broker, onSubmit, onCancel, images }) => {
  const { t: tForm } = useFormTranslation()
  const { t } = useTranslation()

  const [logoImage, setLogoImage] = useState<
    (Partial<Image> & { publicUrl?: string; file?: File }) | null
  >(null)

  // Memoize initial data to prevent re-renders
  const initialData = useMemo(() => ({
    name: '',
    established_in: null as number | null,
    headquarter: '',
    description: ''
  }), [])

  // Enhanced form validation with our new hook
  const {
    data: formData,
    errors,
    isValidating,
    updateField,
    handleBlur,
    handleChange,
    handleSubmit,
    reset
  } = useFormValidation({
    schema: BROKER_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  React.useEffect(() => {
    if (broker) {
      reset({
        name: broker.name,
        established_in: broker.established_in || null,
        headquarter: broker.headquarter || '',
        description: broker.description || ''
      })
      const existingLogo = images?.find(
        img => img.record_id === broker.id && img.type === 'logo'
      )
      if (existingLogo) {
        const { data: urlData } = supabase.storage
          .from('brokers')
          .getPublicUrl(existingLogo.path)
        setLogoImage({ ...existingLogo, publicUrl: urlData.publicUrl })
      } else {
        setLogoImage(null)
      }
    } else {
      reset(initialData)
      setLogoImage(null)
    }
  }, [broker, reset, images, initialData])

  const handleLogoUpload = useCallback(
    (uploadResult: UploadResult | null, file?: File) => {
      if (uploadResult && file) {
        const { url: publicUrl, path, id: storageObjectId } = uploadResult
        setLogoImage(prev => ({
          ...prev,
          path,
          publicUrl,
          storage_object_id: storageObjectId,
          table_name: 'brokers',
          record_id: broker?.id || '',
          type: 'logo',
          alt_text: `${formData.name} logo`,
          file_size: file.size,
          mime_type: file.type,
          file
        }))
      } else {
        setLogoImage(null)
      }
    },
    [broker?.id, formData.name]
  )

  const handleEstablishedYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateField('established_in', value ? parseInt(value) : null)
  }, [updateField])

  const handleFormSubmit = useCallback((data: typeof formData) => {
    onSubmit(data, logoImage)
  }, [onSubmit, logoImage])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Broker name field - full width for emphasis using enhanced FormField */}
      <FormField
        label={tForm('labels.name')}
        name='name'
        value={formData.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        placeholder={tForm('placeholders.enterBrokerName')}
        required
        disabled={isValidating}
        {...(errors.name && { error: errors.name })}
        icon={<Building2 className='w-5 h-5' />}
        helperText='Enter the official name of the brokerage'
      />

      {/* Enhanced layout for better organization */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column - Logo and basic info */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Logo upload section */}
          <div>
            <MainImageUpload
              label={tForm('labels.logo')}
              imageUrl={logoImage?.publicUrl || logoImage?.path || null}
              onChange={handleLogoUpload}
              bucket='brokers'
              folder='logos'
              size='lg'
              disabled={isValidating}
              recommendationText={tForm('hints.logoRecommendation')}
              alt='Broker logo'
            />
          </div>

          {/* Basic info fields using enhanced FormField components */}
          <div className='space-y-4'>
            <FormField
              label={tForm('labels.establishedYear')}
              type='number'
              name='established_in'
              value={formData.established_in?.toString() || ''}
              onChange={handleEstablishedYearChange}
              onBlur={handleBlur('established_in')}
              placeholder={tForm('placeholders.enterEstablishedYear')}
              min={1800}
              max={new Date().getFullYear()}
              disabled={isValidating}
              {...(errors.established_in && { error: errors.established_in })}
              icon={<Calendar className='w-5 h-5' />}
              helperText='Year the brokerage was founded'
            />

            <FormField
              label={tForm('labels.headquarter')}
              name='headquarter'
              value={formData.headquarter || ''}
              onChange={handleChange('headquarter')}
              onBlur={handleBlur('headquarter')}
              placeholder={tForm('placeholders.enterHeadquarter')}
              disabled={isValidating}
              {...(errors.headquarter && { error: errors.headquarter })}
              icon={<MapPin className='w-5 h-5' />}
              helperText='Primary business location'
            />
          </div>
        </div>

        {/* Right column - Description editor */}
        <div className='lg:col-span-2'>
          <Textarea
            label={tForm('labels.description')}
            name='description'
            value={formData.description || ''}
            onChange={handleChange('description')}
            onBlur={handleBlur('description')}
            placeholder={tForm('placeholders.brokerDescriptionPlaceholder')}
            disabled={isValidating}
            rows={12}
            {...(errors.description && { error: errors.description })}
            maxLength={5000}
            helperText="Describe the broker's services, history, regulations, trading platforms, and key features."
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center'
          disabled={isValidating}
        >
          <X className='w-4 h-4 mr-2' />
          {t('actions.cancel')}
        </button>
        <button
          type='submit'
          disabled={isValidating}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isValidating ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-b-gray-900 mr-2'></div>
              {broker ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {broker ? (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  {t('actions.update')} {t('entities.brokers')}
                </>
              ) : (
                <>
                  <Plus className='w-4 h-4 mr-2' />
                  {t('actions.add')} {t('entities.brokers')}
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default BrokerForm
