import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BulkDownloadService, type DownloadProgress } from '../services/bulkDownloadService'
import { usePhoto } from '../contexts/PhotoContext'
import { useNotifications } from '../contexts/NotificationContext'
import { Download, ImageIcon, Heart, FolderOpen, X, AlertTriangle } from './icons'
import type { Photo, Album } from '../contexts/PhotoContext'

interface BulkDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPhotos?: Photo[]
  selectedAlbum?: Album
  downloadType: 'selected' | 'album' | 'favorites' | 'all'
}

export const BulkDownloadModal: React.FC<BulkDownloadModalProps> = ({
  isOpen,
  onClose,
  selectedPhotos,
  selectedAlbum,
  downloadType
}) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [estimatedSize, setEstimatedSize] = useState<string>('')
  
  const { photos, favoritePhotos, getAlbumPhotos } = usePhoto()
  const { addNotification } = useNotifications()

  // Get photos based on download type
  const getPhotosToDownload = useCallback((): Photo[] => {
    switch (downloadType) {
      case 'selected':
        return selectedPhotos || []
      case 'album':
        return selectedAlbum ? getAlbumPhotos(selectedAlbum.id) : []
      case 'favorites':
        return photos.filter(photo => favoritePhotos.includes(photo.id))
      case 'all':
        return photos
      default:
        return []
    }
  }, [downloadType, selectedPhotos, selectedAlbum, photos, favoritePhotos, getAlbumPhotos])

  const photosToDownload = getPhotosToDownload()

  // Estimate download size when modal opens
  React.useEffect(() => {
    if (isOpen && photosToDownload.length > 0) {
      BulkDownloadService.estimateDownloadSize(photosToDownload)
        .then(size => setEstimatedSize(BulkDownloadService.formatBytes(size)))
        .catch(() => setEstimatedSize('Unknown'))
    }
  }, [isOpen, photosToDownload])

  const handleDownload = async () => {
    if (photosToDownload.length === 0) return

    setIsDownloading(true)
    setDownloadProgress(null)

    try {
      const onProgress = (progress: DownloadProgress) => {
        setDownloadProgress(progress)
      }

      switch (downloadType) {
        case 'selected':
          const selectedIds = selectedPhotos?.map(p => p.id) || []
          await BulkDownloadService.downloadSelectedPhotos(photos, selectedIds, onProgress)
          break
        case 'album':
          if (selectedAlbum) {
            await BulkDownloadService.downloadAlbumAsZip(selectedAlbum, photos, onProgress)
          }
          break
        case 'favorites':
          await BulkDownloadService.downloadFavoritesAsZip(photos, favoritePhotos, onProgress)
          break
        case 'all':
          await BulkDownloadService.downloadPhotosAsZip(photos, 'all_photos.zip', onProgress)
          break
      }

      addNotification({
        type: 'success',
        title: 'Download Complete',
        message: `Successfully downloaded ${photosToDownload.length} photos as ZIP file.`
      })

      onClose()
    } catch (error) {
      console.error('Download failed:', error)
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred during download.'
      })
    } finally {
      setIsDownloading(false)
      setDownloadProgress(null)
    }
  }

  const getTitle = () => {
    switch (downloadType) {
      case 'selected': return `Download ${photosToDownload.length} Selected Photos`
      case 'album': return `Download Album: ${selectedAlbum?.title}`
      case 'favorites': return `Download ${photosToDownload.length} Favorite Photos`
      case 'all': return `Download All ${photosToDownload.length} Photos`
      default: return 'Download Photos'
    }
  }

  const getIcon = () => {
    switch (downloadType) {
      case 'selected': return ImageIcon
      case 'album': return FolderOpen
      case 'favorites': return Heart
      case 'all': return Download
      default: return Download
    }
  }

  const IconComponent = getIcon()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Download
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isDownloading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getTitle()}
              </h3>
              <p className="text-gray-600 text-sm">
                Photos will be downloaded as a ZIP file
              </p>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {photosToDownload.length}
                  </div>
                  <div className="text-sm text-gray-600">Photos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {estimatedSize}
                  </div>
                  <div className="text-sm text-gray-600">Est. Size</div>
                </div>
              </div>
            </div>

            {/* Warning for large downloads */}
            {photosToDownload.length > 50 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">Large Download</div>
                  <div className="text-yellow-700 mt-1">
                    This is a large download that may take several minutes. Please keep this tab open during the download.
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isDownloading && downloadProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Downloading: {downloadProgress.currentItem}</span>
                  <span>{downloadProgress.completed}/{downloadProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${downloadProgress.percentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-center text-sm text-gray-600">
                  {downloadProgress.percentage}% complete
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isDownloading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleDownload}
              disabled={isDownloading || photosToDownload.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download ZIP</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Bulk download button component for quick access
interface BulkDownloadButtonProps {
  photos?: Photo[]
  album?: Album
  type: 'selected' | 'album' | 'favorites' | 'all'
  className?: string
  children?: React.ReactNode
}

export const BulkDownloadButton: React.FC<BulkDownloadButtonProps> = ({
  photos,
  album,
  type,
  className = '',
  children
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const buttonContent = children || (
    <div className="flex items-center space-x-2">
      <Download className="h-4 w-4" />
      <span>Download ZIP</span>
    </div>
  )

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors ${className}`}
      >
        {buttonContent}
      </motion.button>

      <BulkDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPhotos={photos}
        selectedAlbum={album}
        downloadType={type}
      />
    </>
  )
}

export default BulkDownloadModal