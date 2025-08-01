import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Calendar,
  User,
  Clock,
  Eye,
  FileText,
  TrendingUp
} from 'lucide-react'
import { useTranslation, usePageTranslation } from '../../../hooks/useTranslation'
import { useContentTranslation } from '../../../hooks/useContentTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { Badge, Button, LanguageBadgeSelector } from '../../atoms'
import { RichTextRenderer } from '../../common'
import { RecordImage } from '../images'
import { CONTENT_LANGUAGE_CODES } from '../../../constants/languages'
import type { Image } from '../../../types'
import type { PostWithAuthor } from '../../../hooks/usePosts'
import type { LanguageCode } from '../../../types/translations'
import { getTypographyClasses, cn } from '../../../utils/theme'

interface PostViewModalProps {
  isOpen: boolean
  onClose: () => void
  post: PostWithAuthor
  image?: Image | null
  onEdit?: () => void
}

const PostViewModal: React.FC<PostViewModalProps> = ({
  isOpen,
  onClose,
  post,
  image,
  onEdit
}) => {
  const { t: tCommon, i18n } = useTranslation()
  const { t } = usePageTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(i18n.language as LanguageCode)

  // Get translations for this post
  const { translations } = useContentTranslation(
    'posts',
    post.id,
    {
      enabled: true,
      defaultLanguage: selectedLanguage,
      requiredLanguages: CONTENT_LANGUAGE_CODES
    }
  )

  // Get current translation data
  const currentTranslation = useMemo(() => {
    if (!translations || translations.length === 0) return null
    const translation = translations.find(t => t.language_code === selectedLanguage) || translations[0]
    // Cast to PostTranslation since we know this is for posts
    return translation as { id: string; language_code: string; title: string; excerpt?: string; content?: string; reading_time: number }
  }, [translations, selectedLanguage])

  // Get available languages for this post
  const availableLanguages = useMemo(() => {
    if (!translations || translations.length === 0) return []
    return translations.map(t => t.language_code as LanguageCode)
  }, [translations])

  const hasImages = !!image

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
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 200)
  }, [onClose])

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
    <div className='fixed inset-0 z-[100] overflow-y-auto'>
      {/* Enhanced background overlay */}
      <div
        className={`fixed inset-0 backdrop-blur-md bg-black/40 dark:bg-black/60 transition-all duration-200 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Modal container */}
      <div className='flex min-h-full items-center justify-center p-4'>
        {/* Enhanced modal with better dimensions for content reading */}
        <div className={`relative bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all duration-200 ease-out flex flex-col ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}>

          {/* Enhanced Header with gradient and post meta */}
          <div className='flex-shrink-0 bg-gradient-to-r from-gray-50/95 to-white/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 mr-6'>
                                {/* Post badges */}
                <div className='flex items-center space-x-3 mb-3'>
                  <Badge
                    variant={post.status as 'published' | 'draft'}
                    size='sm'
                    showIcon
                  >
                    {tCommon(`status.${post.status}`)}
                  </Badge>
                  <Badge
                    variant={post.type as 'news' | 'event' | 'terms_of_use' | 'privacy_policy'}
                    size='sm'
                    showIcon
                  >
                    {tCommon(
                      post.type === 'terms_of_use'
                        ? 'content.termsOfUse'
                        : post.type === 'privacy_policy'
                          ? 'content.privacyPolicy'
                          : `content.${post.type}`
                    )}
                  </Badge>
                </div>

                {/* Language selector */}
                <LanguageBadgeSelector
                  availableLanguages={availableLanguages}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  size='sm'
                  showLabel={false}
                  compact={false}
                  className='mb-4'
                />

                {/* Post title */}
                <h1 className={cn(
                  getTypographyClasses('h1'),
                  'text-2xl lg:text-3xl leading-tight mb-4 text-gray-900 dark:text-white'
                )}>
                  {currentTranslation?.title || tCommon('content.untitledPost')}
                </h1>

                {/* Author and meta info */}
                <div className='flex flex-wrap items-center space-x-6 text-sm text-gray-600 dark:text-gray-400'>
                  <div className='flex items-center space-x-2'>
                    <User className='w-4 h-4' />
                    <span className='font-medium'>{post.author?.full_name || t('posts.unknownAuthor')}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='w-4 h-4' />
                    <span>{formatDateDisplay(post.created_at || new Date().toISOString())}</span>
                  </div>
                  {typeof post.views === 'number' && (
                    <div className='flex items-center space-x-2'>
                      <Eye className='w-4 h-4' />
                      <span>{post.views.toLocaleString()} {t('posts.views').toLowerCase()}</span>
                    </div>
                  )}
                  {post.published_at && post.published_at !== post.created_at && (
                    <div className='flex items-center space-x-2'>
                      <Clock className='w-4 h-4' />
                      <span>Published {formatDateDisplay(post.published_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex items-center space-x-2'>
                {onEdit && (
                  <Button
                    variant='ghost'
                    size='sm'
                    leftIcon={FileText}
                    onClick={onEdit}
                    className='text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                  >
                    Edit
                  </Button>
                )}
                <button
                  onClick={handleClose}
                  className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className='flex-1 overflow-y-auto min-h-0'>
            <div className='px-8 py-6'>
              <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>

                {/* Main content area */}
                <div className='lg:col-span-3 space-y-6'>
                  {/* Featured image from images table - only show if images exist */}
                  {hasImages && (
                    <div>
                      <RecordImage
                        image={image}
                        className='w-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl'
                        fallbackClassName='hidden'
                        alt={`${currentTranslation?.title || 'Post'} featured image`}
                      />
                    </div>
                  )}

                  {/* Post content */}
                  <div className={!hasImages ? 'mt-6' : ''}>
                    {currentTranslation?.content ? (
                      <RichTextRenderer content={currentTranslation.content} />
                    ) : (
                      <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
                        <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600' />
                        <p>{tCommon('general.noContent')} for this post in {availableLanguages.find(lang => lang === selectedLanguage) ? tCommon('content.thisLanguage') : tCommon('content.selectedLanguage')}.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar with additional info */}
                <div className='lg:col-span-1 space-y-6'>

                  {/* Author information */}
                  {post.author && (
                    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50'>
                      <h3 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                        <User className='w-5 h-5 mr-2 text-blue-600 dark:text-blue-400' />
                        Author
                      </h3>
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg'>
                            {(post.author.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className='font-medium text-gray-900 dark:text-white'>
                              {post.author.full_name || 'Unknown'}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              {post.author.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post statistics */}
                  <div className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50'>
                    <h3 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                      <TrendingUp className='w-5 h-5 mr-2 text-purple-600 dark:text-purple-400' />
                      Post Metrics
                    </h3>
                    <div className='space-y-4'>
                      {typeof post.views === 'number' && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center'>
                            <Eye className='w-4 h-4 mr-2' />
                            Views
                          </span>
                          <span className='font-semibold text-gray-900 dark:text-white'>
                            {post.views.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center'>
                          <FileText className='w-4 h-4 mr-2' />
                          Word Count
                        </span>
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {currentTranslation?.content ? currentTranslation.content.replace(/<[^>]*>/g, '').split(' ').length : 0}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center'>
                          <Clock className='w-4 h-4 mr-2' />
                          Read Time
                        </span>
                        <span className='font-semibold text-gray-900 dark:text-white' aria-live='polite'>
                          {currentTranslation?.reading_time || 1} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default PostViewModal
