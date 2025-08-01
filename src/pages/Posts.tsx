import React, { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import {
  usePosts,
  usePostsFiltering,
  PostsTable,
  PostsStats,
  PostForm,
  PostViewModal,
  type PostWithAuthor
} from '../features/posts'
import { usePostsWithTranslations } from '../hooks/usePostsWithTranslations'
import { FilterDropdown, TabNavigation, PaginationSelector } from '../components/molecules'
import { Modal, Button, Input } from '../components/atoms'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import { POST_TYPES } from '../constants/general'
import type { PostInsert, Image, ImageInsert } from '../types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { groupImagesByRecord } from '../utils'
import { supabase, queryKeys } from '../lib/supabase'
import { useImages } from '../hooks/useImages'
import { useFileUpload } from '../hooks/useFileUpload'

// Theme imports
import {
  getPageLayoutClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'
import { FILTER_OPTIONS } from '../constants/components'

// Tab configuration keys
const POST_TAB_CONFIGS = [
  {
    id: 'all',
    labelKey: 'posts.tabs.all.label',
    descriptionKey: 'posts.tabs.all.description'
  },
  {
    id: POST_TYPES.NEWS,
    labelKey: 'posts.tabs.news.label',
    descriptionKey: 'posts.tabs.news.description'
  },
  {
    id: POST_TYPES.EVENT,
    labelKey: 'posts.tabs.event.label',
    descriptionKey: 'posts.tabs.event.description'
  },
  {
    id: POST_TYPES.TERMS_OF_USE,
    labelKey: 'posts.tabs.termsOfUse.label',
    descriptionKey: 'posts.tabs.termsOfUse.description'
  },
  {
    id: POST_TYPES.PRIVACY_POLICY,
    labelKey: 'posts.tabs.privacyPolicy.label',
    descriptionKey: 'posts.tabs.privacyPolicy.description'
  }
]

const Posts: React.FC = () => {
  const { posts: postsWithTranslations, loading: translationsLoading } = usePostsWithTranslations()
  const { posts, loading, createPost, updatePost, deletePost } = usePosts()
  const { user } = useAuthStore()
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms
  const { createImage, deleteImage } = useImages()
  const { deleteFile } = useFileUpload()
  const queryClient = useQueryClient()

  // Use posts with translations for display, fallback to regular posts for CRUD operations
  const displayPosts = postsWithTranslations.length > 0 ? postsWithTranslations : posts
  const isLoading = translationsLoading || loading

  // Use our new filtering hook to replace all the filtering/sorting/pagination logic
  const {
    filterState,
    paginatedPosts,
    totalPages,
    setSearchTerm,
    setFilterStatus,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange,
    handleTabChange
  } = usePostsFiltering({ posts: displayPosts as PostWithAuthor[] })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    post: PostWithAuthor | null
    isDeleting: boolean
  }>({
    isOpen: false,
    post: null,
    isDeleting: false
  })
  const [viewingPost, setViewingPost] = useState<PostWithAuthor | null>(null)

  // Theme classes
  const layout = getPageLayoutClasses()

  // Calculate tab counts with translations
  const tabsWithCounts = useMemo(() => {
    return POST_TAB_CONFIGS.map(tab => ({
      id: tab.id,
      label: t(tab.labelKey),
      description: t(tab.descriptionKey),
      count: tab.id === 'all' ? displayPosts.length : displayPosts.filter(post => post.type === tab.id).length
    }))
  }, [displayPosts, t])

  const handleView = (post: PostWithAuthor) => {
    setViewingPost(post)
  }

  const handleEdit = (post: PostWithAuthor) => {
    // Security check - only allow editing if user is authenticated
    if (!user) {
      alert(t('posts.loginRequired', { action: tCommon('actions.edit').toLowerCase() }))
      return
    }
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = (post: PostWithAuthor) => {
    // Security check - only allow deleting if user is authenticated
    if (!user) {
      alert(t('posts.loginRequired', { action: tCommon('actions.delete').toLowerCase() }))
      return
    }
    setDeleteConfirm({ isOpen: true, post, isDeleting: false })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.post) return

    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }))

    try {
      await deletePost(deleteConfirm.post.id)
      setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })
      // Reset to first page if current page becomes empty
      if (paginatedPosts.length === 1 && filterState.currentPage > 1) {
        handlePageChange(filterState.currentPage - 1)
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  const handleSubmit = async (
    data: PostInsert,
    thumbnailImage: (Partial<Image> & { publicUrl?: string; file?: File }) | null | undefined
  ) => {
    try {
      let postId = editingPost?.id

      if (editingPost) {
        await updatePost(editingPost.id, data)
      } else {
        const newPost = await createPost({ ...data, author_id: user?.id ?? '' })
        postId = newPost.id
        // Go to first page to see the new post
        handlePageChange(1)
      }

      if (!postId) return

      const existingThumbnail = images.find(
        img => img.record_id === postId && img.type === 'thumbnail'
      )

      // Case 1: Thumbnail removed
      if (!thumbnailImage && existingThumbnail) {
        await deleteImage(existingThumbnail.id)
        await deleteFile('posts', existingThumbnail.path)
      }

      // Case 2: New thumbnail added or existing thumbnail changed
      if (thumbnailImage && thumbnailImage.file) {
        if (existingThumbnail) {
          // A thumbnail exists, so we're replacing it. Delete the old one first.
          await deleteImage(existingThumbnail.id)
          await deleteFile('posts', existingThumbnail.path)
        }

        // Create new image record
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { file, publicUrl, ...imageData } = thumbnailImage
        await createImage({
          ...imageData,
          record_id: postId
        } as ImageInsert)
      }

      handleCloseModal()
    } catch (error) {
      console.error('Failed to save post:', error)
    } finally {
      // Invalidate queries to refetch posts and images
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.images() })
    }
  }

  // Use predefined filter options from constants
  const statusOptions = [...FILTER_OPTIONS.postStatus]

  const postIds = paginatedPosts.map(post => String(post.id))
  const { data: images = [] } = useQuery({
    queryKey: ['images', 'posts', postIds],
    queryFn: async () => {
      if (postIds.length === 0) return []
      const { data } = await supabase
        .from('images')
        .select('*')
        .eq('table_name', 'posts')
        .in('record_id', postIds)
      return data || []
    },
    enabled: postIds.length > 0
  })
  const imagesByRecord = groupImagesByRecord(images)['posts'] || {}

  if (isLoading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('posts.loadingPosts')} />
      </div>
    )
  }

  const viewingPostImage = viewingPost ? imagesByRecord[viewingPost.id]?.[0] : undefined

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('posts.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('posts.description')}
            </p>
          </div>
          <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
            <Button
              variant='primary'
              size='md'
              leftIcon={Plus}
              onClick={() => {
                if (!user) {
                  alert(t('posts.loginRequired', { action: tCommon('actions.create').toLowerCase() }))
                  return
                }
                setIsModalOpen(true)
              }}
            >
              {t('posts.createPost')}
            </Button>
          </div>
        </div>

        {/* Stats Cards - Now using our PostsStats component */}
        <PostsStats posts={displayPosts as PostWithAuthor[]} />

        {/* Tabs with Content Inside */}
        <TabNavigation tabs={tabsWithCounts} activeTab={filterState.activeTab} onTabChange={handleTabChange}>
          {/* Enhanced Filters */}
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchPostsPlaceholder')}
                  value={filterState.searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='default'
                  className='transition-all duration-200 w-full max-w-full focus:w-[32rem]'
                />
              </div>

              <div className='flex items-center space-x-3'>
                <FilterDropdown
                  options={statusOptions}
                  value={filterState.filterStatus}
                  onChange={value => {
                    setFilterStatus(value as 'all' | 'draft' | 'published')
                    handlePageChange(1)
                  }}
                  label={tCommon('general.status')}
                />
              </div>
            </div>

            {/* Table - Now using our PostsTable component */}
            <PostsTable
              posts={paginatedPosts as PostWithAuthor[]}
              imagesByRecord={imagesByRecord}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              sortColumn={filterState.sortColumn}
              sortDirection={filterState.sortDirection}
              onSort={handleSort}
            />

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={filterState.itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    handlePageChange(1) // Reset to first page when changing items per page
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {tCommon('pagination.showingRows', {
                      startItem: (filterState.currentPage - 1) * filterState.itemsPerPage + 1,
                      endItem: Math.min(filterState.currentPage * filterState.itemsPerPage, posts.length),
                      total: posts.length
                    })}
                  </span>
                </div>
              </div>

              {totalPages > 1 && (
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => handlePageChange(filterState.currentPage - 1)}
                    disabled={filterState.currentPage === 1}
                    className='p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                  </button>
                  <div className='flex items-center'>
                    <span className='text-sm text-gray-700 dark:text-gray-300'>{tCommon('pagination.page')}</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <input
                      type='text'
                      value={filterState.pageInputValue}
                      onChange={e => {
                        setPageInputValue(e.target.value)
                      }}
                      onBlur={e => {
                        const page = parseInt(e.target.value)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          handlePageChange(page)
                        } else {
                          setPageInputValue(filterState.currentPage.toString())
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const page = parseInt(filterState.pageInputValue)
                          if (!isNaN(page) && page >= 1 && page <= totalPages) {
                            handlePageChange(page)
                          } else {
                            setPageInputValue(filterState.currentPage.toString())
                          }
                        }
                      }}
                      className='w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-2 dark:focus:ring-white dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      {tCommon('pagination.of')} {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChange(filterState.currentPage + 1)}
                    disabled={filterState.currentPage === totalPages}
                    className='p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </TabNavigation>

        {/* Modals */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingPost ? t('posts.editPost') : t('posts.createNewPost')}
          size='xl'
        >
          <PostForm
            post={editingPost}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            images={images}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })}
          onConfirm={confirmDelete}
          title={t('posts.deletePostTitle')}
          message={
            <div>
              <p>
                {t('posts.confirmDeleteMessage')}{' '}
                <strong className='font-semibold text-gray-900 dark:text-gray-100'>
                  {(deleteConfirm.post?.title || t('posts.thisPost')) as string}
                </strong>
                ?
              </p>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>{t('posts.actionCannotBeUndone')}</p>
            </div>
          }
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isDestructive={true}
          isLoading={deleteConfirm.isDeleting}
          variant='danger'
        />

        {/* Enhanced Post Viewer Modal */}
        {viewingPost && (
          <PostViewModal
            isOpen={!!viewingPost}
            onClose={() => setViewingPost(null)}
            post={viewingPost}
            image={viewingPostImage || null}
            onEdit={() => {
              setViewingPost(null)
              handleEdit(viewingPost)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Posts
