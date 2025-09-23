import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, FolderPlus as AlbumIcon } from '../components/icons'
import PhotoGrid from './PhotoGrid'
import { usePhoto } from '../contexts/PhotoContext'
import { useNotifications } from '../contexts/NotificationContext'

interface CreateAlbumProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (albumId: string) => void
}

const CreateAlbum: React.FC<CreateAlbumProps> = ({ isOpen, onClose, onSuccess }) => {
  const { photos, createAlbum, isLoading } = usePhoto()
  const { addNotification } = useNotifications()

  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [albumData, setAlbumData] = useState({
    title: '',
    description: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState<'photos' | 'details'>('photos')

  const resetForm = useCallback(() => {
    setSelectedPhotos(new Set())
    setAlbumData({ title: '', description: '' })
    setStep('photos')
    setIsCreating(false)
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const handlePhotoToggle = useCallback((photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photoId)) {
        newSet.delete(photoId)
      } else {
        newSet.add(photoId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(photos.map(photo => photo.id)))
    }
  }, [selectedPhotos.size, photos])

  const handleNextStep = useCallback(() => {
    if (selectedPhotos.size === 0) {
      addNotification({
        type: 'warning',
        title: 'No photos selected',
        message: 'Please select at least one photo to create an album.'
      })
      return
    }
    setStep('details')
  }, [selectedPhotos.size, addNotification])

  const handlePreviousStep = useCallback(() => {
    setStep('photos')
  }, [])

  const handleCreateAlbum = useCallback(async () => {
    if (!albumData.title.trim()) {
      addNotification({
        type: 'warning',
        title: 'Album title required',
        message: 'Please enter a title for your album.'
      })
      return
    }

    if (selectedPhotos.size === 0) {
      addNotification({
        type: 'warning',
        title: 'No photos selected',
        message: 'Please select at least one photo for your album.'
      })
      return
    }

    setIsCreating(true)

    try {
      const albumId = await createAlbum(
        albumData.title.trim(),
        albumData.description.trim() || undefined,
        Array.from(selectedPhotos)
      )

      if (albumId) {
        addNotification({
          type: 'success',
          title: 'Album created successfully',
          message: `Album "${albumData.title}" has been created with ${selectedPhotos.size} photos.`
        })
        
        if (onSuccess) {
          onSuccess(albumId)
        }
        
        handleClose()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to create album',
        message: 'There was an error creating your album. Please try again.'
      })
    } finally {
      setIsCreating(false)
    }
  }, [albumData, selectedPhotos, createAlbum, addNotification, onSuccess, handleClose])

  const handleInputChange = useCallback((field: string, value: string) => {
    setAlbumData(prev => ({ ...prev, [field]: value }))
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <AlbumIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {step === 'photos' ? 'Select Photos' : 'Album Details'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {step === 'photos' 
                    ? 'Choose photos to include in your album'
                    : 'Enter album information'
                  }
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={isCreating}
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${
                step === 'photos' ? 'bg-purple-500' : 'bg-green-500'
              }`} />
              <span className={`text-sm font-medium ${
                step === 'photos' ? 'text-purple-600' : 'text-gray-400'
              }`}>
                Select Photos
              </span>
              
              <div className={`w-8 h-px ${
                step === 'details' ? 'bg-purple-300' : 'bg-gray-300'
              }`} />
              
              <div className={`w-3 h-3 rounded-full transition-colors ${
                step === 'details' ? 'bg-purple-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm font-medium ${
                step === 'details' ? 'text-purple-600' : 'text-gray-400'
              }`}>
                Album Details
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {step === 'photos' ? (
              <div className="p-6">
                {/* Selection controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedPhotos.size} of {photos.length} photos selected
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSelectAll}
                      className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
                    >
                      {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
                    </motion.button>
                  </div>
                </div>

                {/* Photo grid */}
                {photos.length > 0 ? (
                  <PhotoGrid
                    photos={photos}
                    selectionMode={true}
                    selectedPhotos={selectedPhotos}
                    onToggleSelection={handlePhotoToggle}
                  />
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <AlbumIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Photos Available</h3>
                    <p className="text-gray-600">Take some photos first to create an album.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                {/* Album form */}
                <div className="space-y-6">
                  {/* Album title */}
                  <div>
                    <label htmlFor="album-title" className="block text-sm font-medium text-gray-700 mb-2">
                      Album Title *
                    </label>
                    <input
                      id="album-title"
                      type="text"
                      value={albumData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter album title..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      maxLength={100}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {albumData.title.length}/100
                    </div>
                  </div>

                  {/* Album description */}
                  <div>
                    <label htmlFor="album-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      id="album-description"
                      value={albumData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter album description..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      maxLength={500}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {albumData.description.length}/500
                    </div>
                  </div>

                  {/* Selected photos preview */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Selected Photos ({selectedPhotos.size})
                    </h3>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-32 overflow-auto">
                      {Array.from(selectedPhotos).slice(0, 20).map(photoId => {
                        const photo = photos.find(p => p.id === photoId)
                        if (!photo) return null
                        return (
                          <motion.div
                            key={photoId}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="aspect-square rounded-lg overflow-hidden bg-gray-200"
                          >
                            <img
                              src={photo.thumbnail || photo.url}
                              alt={photo.filename}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        )
                      })}
                      {selectedPhotos.size > 20 && (
                        <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500 font-medium">
                            +{selectedPhotos.size - 20}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              {step === 'details' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePreviousStep}
                  disabled={isCreating}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Previous
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                disabled={isCreating}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </motion.button>

              {step === 'photos' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextStep}
                  disabled={selectedPhotos.size === 0 || isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Album Details
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateAlbum}
                  disabled={!albumData.title.trim() || selectedPhotos.size === 0 || isCreating}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Album
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CreateAlbum