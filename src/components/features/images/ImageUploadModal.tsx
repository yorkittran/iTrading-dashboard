import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Upload, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react'
import { useFileUpload } from '../../../hooks/useFileUpload'
import { useImages } from '../../../hooks/useImages'
import { useToast } from '../../../hooks/useToast'
import { useFormTranslation } from '../../../hooks/useTranslation'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImageInsert: (url: string, alt?: string) => void
  bucket?: string
  folder?: string
  /** Optional: Create image record in database */
  createImageRecord?: {
    tableName: string
    recordId: string
  }
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageInsert,
  bucket = 'posts',
  folder = 'images',
  createImageRecord
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [altText, setAltText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, isUploading, progress } = useFileUpload()
  const { createImageFromUpload } = useImages()
  const toast = useToast()
  const { t: tForm } = useFormTranslation()

  // Reset modal state
  const resetModal = useCallback(() => {
    setPreview(null)
    setAltText('')
    setSelectedFile(null)
    setDragActive(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('fileType')
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = e => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [toast])

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect]
  )

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect]
  )

  // Handle upload and insert
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('required')
      return
    }

    try {
      const result = await uploadFile(selectedFile, {
        bucket,
        folder,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        maxSizeInMB: 10
      })

      // Optionally create image record in database
      if (createImageRecord) {
        await createImageFromUpload(
          createImageRecord.tableName,
          createImageRecord.recordId,
          result,
          altText || selectedFile.name,
          selectedFile.size,
          selectedFile.type
        )
      }

      onImageInsert(result.url, altText || selectedFile.name)
      toast.success('uploaded', 'image')
      resetModal()
      onClose()
    } catch (error) {
      // Error is already handled in useFileUpload hook
      console.error('Upload error:', error)
    }
  }

  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 200)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    if (isUploading) {
      toast.error('general', null, 'Please wait for upload to complete')
      return
    }
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      resetModal()
      onClose()
    }, 200)
  }, [onClose, isUploading, toast, resetModal])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  if (!isVisible) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const modalContent = (
    <div 
      className='fixed inset-0 flex items-center justify-center z-[100] p-4'
      onClick={handleBackdropClick}
    >
      <div
        className={`absolute inset-0 backdrop-blur-md bg-black/30 dark:bg-black/50 transition-all duration-200 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden='true'
        onClick={handleBackdropClick}
      />
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 ease-out ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{tForm('imageUpload.uploadImage')}</h3>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-4'>
          {/* Upload Area */}
          {!preview && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleInputChange}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                disabled={isUploading}
              />

              <div className='space-y-4'>
                <div className='flex justify-center'>
                  <Upload className='w-12 h-12 text-gray-400 dark:text-gray-500' />
                </div>
                <div>
                  <p className='text-lg font-medium text-gray-900 dark:text-white'>
                    {tForm('imageUpload.dropImageHere')}
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{tForm('imageUpload.supportedFormatsModal')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className='space-y-4'>
              <div className='relative'>
                <img
                  src={preview}
                  alt='Preview'
                  className='w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700'
                />
                {!isUploading && (
                  <button
                    onClick={() => {
                      setPreview(null)
                      setSelectedFile(null)
                      setAltText('')
                    }}
                    className='absolute top-2 right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1 hover:bg-red-600 dark:hover:bg-red-700 transition-colors'
                  >
                    <X className='w-4 h-4' />
                  </button>
                )}
              </div>

              {/* Alt Text Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {tForm('imageUpload.altTextOptional')}
                </label>
                <input
                  type='text'
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  placeholder={tForm('placeholders.imageDescription')}
                  disabled={isUploading}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:cursor-not-allowed'
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-300'>{tForm('actions.uploading')}</span>
                    <span className='text-gray-600 dark:text-gray-300'>{progress}%</span>
                  </div>
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                    <div
                      className='bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {!preview && !selectedFile && (
            <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
              <AlertCircle className='w-4 h-4 mr-2' />
              Supported formats: JPEG, PNG, GIF, WebP (max 10MB)
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {tForm('actions.cancel')}
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
          >
            {isUploading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                {tForm('actions.uploading')}
              </>
            ) : (
              <>
                <ImageIcon className='w-4 h-4 mr-2' />
                {tForm('imageUpload.insertImage')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ImageUploadModal
