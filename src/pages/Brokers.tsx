import React, { useState } from 'react'
import { Plus, Search, Grid3X3, List } from 'lucide-react'
import { BrokersTable, BrokersStats, BrokerGrid } from '../features/brokers'
import { PaginationSelector } from '../components/molecules'
import { Button, Input, Modal } from '../components/atoms'
import { useBrokers } from '../hooks/useBrokers'
import { useBrokersFiltering } from '../hooks/useBrokersFiltering'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { BrokerForm, BrokerViewModal } from '../components/features/brokers'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import type { Broker, BrokerInsert, Image, Database } from '../types'

type BrokerAccountType = Database['public']['Tables']['broker_account_types']['Insert']
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { groupImagesByRecord } from '../utils'
import { supabase, queryKeys } from '../lib/supabase'
import { useImages } from '../hooks/useImages'
import { useFileUpload } from '../hooks/useFileUpload'

// Theme imports
import { getPageLayoutClasses, getTypographyClasses, cn } from '../utils/theme'

const Brokers: React.FC = () => {
  const { brokers, loading, createBroker, updateBroker, deleteBroker, isDeleting } = useBrokers()
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms
  const { createImage, deleteImage } = useImages()
  const { deleteFile } = useFileUpload()
  const queryClient = useQueryClient()

  // Use our new filtering hook to replace all the filtering/sorting/pagination logic
  const {
    filterState,
    paginatedBrokers,
    totalPages,
    setSearchTerm,
    setViewMode,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange
  } = useBrokersFiltering({ brokers })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null)
  const [viewingBroker, setViewingBroker] = useState<Broker | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    brokerId: string | null
    brokerName: string | null
  }>({
    isOpen: false,
    brokerId: null,
    brokerName: null
  })

  // Theme classes
  const layout = getPageLayoutClasses()

  const handleView = (broker: Broker) => {
    setViewingBroker(broker)
  }

  const handleEdit = (broker: Broker) => {
    setEditingBroker(broker)
    setIsModalOpen(true)
  }

  const handleDelete = (broker: Broker) => {
    setConfirmDialog({
      isOpen: true,
      brokerId: broker.id,
      brokerName: broker.name
    })
  }

  const handleToggleVisible = async (broker: Broker) => {
    await updateBroker(broker.id, { is_visible: !broker.is_visible })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDialog.brokerId) return

    try {
      await deleteBroker(confirmDialog.brokerId)
      // Reset to first page if current page becomes empty
      if (paginatedBrokers.length === 1 && filterState.currentPage > 1) {
        handlePageChange(filterState.currentPage - 1)
      }
    } finally {
      setConfirmDialog({
        isOpen: false,
        brokerId: null,
        brokerName: null
      })
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      brokerId: null,
      brokerName: null
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBroker(null)
  }

  const handleSubmit = async (
    data: BrokerInsert,
    logoImage: (Partial<Image> & { publicUrl?: string; file?: File }) | null | undefined,
    accountTypes: Partial<BrokerAccountType>[] = []
  ) => {
    try {
      let brokerId = editingBroker?.id

      if (editingBroker) {
        await updateBroker(editingBroker.id, data)
      } else {
        const newBroker = await createBroker(data)
        brokerId = newBroker.id
        // Go to first page to see the new broker
        handlePageChange(1)
      }

      if (!brokerId) return

      const existingLogo = images.find(
        img => img.record_id === brokerId && img.type === 'logo'
      )

      // Case 1: Logo removed
      if (!logoImage && existingLogo) {
        await deleteImage(existingLogo.id)
        await deleteFile('brokers', existingLogo.path)
      }

      // Case 2: New logo added or existing logo changed
      if (logoImage && logoImage.file) {
        if (existingLogo) {
          // A logo exists, so we're replacing it. Delete the old one first.
          await deleteImage(existingLogo.id)
          await deleteFile('brokers', existingLogo.path)
        }

        // Create new image record
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { file, publicUrl, ...imageData } = logoImage
        await createImage({
          ...imageData,
          record_id: brokerId
        } as Image)
      }

      // Save account types if broker was created/updated successfully
      if (brokerId && accountTypes.length > 0) {
        // First, delete existing account types for this broker
        await supabase
          .from('broker_account_types')
          .delete()
          .eq('broker_id', brokerId)

        // Then insert the new account types
        const accountTypesToInsert = accountTypes
          .filter(at => at.account_type && at.account_type.trim()) // Only save non-empty account types
          .map(at => ({
            broker_id: brokerId,
            account_type: at.account_type!,
            spreads: at.spreads || null,
            commission: at.commission || null,
            min_deposit: at.min_deposit || null
          }))

        if (accountTypesToInsert.length > 0) {
          const { error: accountTypesError } = await supabase
            .from('broker_account_types')
            .insert(accountTypesToInsert)
          
          if (accountTypesError) {
            console.error('Failed to save account types:', accountTypesError)
            throw accountTypesError
          }
        }
      }

      handleCloseModal()
    } catch (error) {
      console.error('Failed to save broker:', error)
    } finally {
      // Invalidate queries to refetch brokers and images
      await queryClient.invalidateQueries({ queryKey: queryKeys.brokers() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.images() })
    }
  }

  const brokerIds = paginatedBrokers.map(broker => String(broker.id))
  const { data: images = [] } = useQuery({
    queryKey: ['images', 'brokers', brokerIds],
    queryFn: async () => {
      if (brokerIds.length === 0) return []
      const { data } = await supabase
        .from('images')
        .select('*')
        .eq('table_name', 'brokers')
        .eq('type', 'logo')
        .in('record_id', brokerIds)
      return data || []
    },
    enabled: brokerIds.length > 0
  })
  const imagesByRecord = groupImagesByRecord(images)['brokers'] || {}

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('brokers.loadingBrokers')} />
      </div>
    )
  }

  const viewingBrokerImage = viewingBroker ? imagesByRecord[viewingBroker.id]?.[0] : undefined

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('brokers.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('brokers.description')}
            </p>
          </div>
          <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
            <Button
              variant='primary'
              size='md'
              leftIcon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              {t('brokers.addBroker')}
            </Button>
          </div>
        </div>

        {/* Stats Cards - Now using our BrokersStats component */}
        <BrokersStats brokers={brokers} />

        {/* Brokers Content */}
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchBrokersPlaceholder')}
                  value={filterState.searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='default'
                  className='transition-all duration-200 w-full max-w-full focus:w-[32rem]'
                />
              </div>

              <div className='flex items-center space-x-3'>
                {/* View Toggle */}
                <div className='flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      filterState.viewMode === 'list'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    title={t('brokers.listView')}
                  >
                    <List className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded-md transition-colors ${
                      filterState.viewMode === 'card'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    title={t('brokers.cardView')}
                  >
                    <Grid3X3 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>

            {/* Content - Table or Cards - Now using our components */}
            {filterState.viewMode === 'list' ? (
              <BrokersTable
                brokers={paginatedBrokers}
                imagesByRecord={imagesByRecord}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleVisible={handleToggleVisible}
                sortColumn={filterState.sortColumn}
                sortDirection={filterState.sortDirection}
                onSort={handleSort}
              />
            ) : (
              <>
                {paginatedBrokers.length > 0 ? (
                  <BrokerGrid
                    brokers={paginatedBrokers}
                    imagesByRecord={imagesByRecord}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className='text-center py-12'>
                    <div className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg'>
                      <span className='text-2xl'>📊</span>
                    </div>
                    <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {t('brokers.noBrokersFound')}
                    </h3>
                    <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                      {t('brokers.getStartedByCreating')}
                    </p>
                    <div className='mt-6'>
                      <Button
                        variant='primary'
                        size='md'
                        leftIcon={Plus}
                        onClick={() => setIsModalOpen(true)}
                      >
                        {t('brokers.addBroker')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

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
                      endItem: Math.min(
                        filterState.currentPage * filterState.itemsPerPage,
                        brokers.length
                      ),
                      total: brokers.length
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
                      className='w-12 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200'
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
        </div>

        {/* Modal for creating/editing brokers */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            editingBroker
              ? `${tCommon('actions.edit')} ${tCommon('entities.brokers')}`
              : t('brokers.addNewBroker')
          }
          size='full'
        >
          <BrokerForm
            broker={editingBroker}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            images={images}
          />
        </Modal>

        {/* Enhanced Modal for viewing broker details */}
        {viewingBroker && (
          <BrokerViewModal
            isOpen={!!viewingBroker}
            onClose={() => setViewingBroker(null)}
            broker={viewingBroker}
            image={viewingBrokerImage || null}
            onEdit={() => {
              setViewingBroker(null)
              handleEdit(viewingBroker)
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={t('brokers.deleteBrokerTitle')}
          message={
            <div>
              <p>
                {t('brokers.confirmDeleteMessage')}{' '}
                <strong className='font-semibold text-gray-900 dark:text-gray-100'>
                  {confirmDialog.brokerName || t('brokers.thisBroker')}
                </strong>
                ?
              </p>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>{t('brokers.actionCannotBeUndone')}</p>
            </div>
          }
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isDestructive={true}
          isLoading={isDeleting}
          variant='danger'
        />
      </div>
    </div>
  )
}

export default Brokers
