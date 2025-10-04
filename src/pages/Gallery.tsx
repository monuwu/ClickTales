import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhoto } from '../contexts/PhotoContext'
import { usePDFDownload } from '../hooks/usePDFDownload'
import { 
  GalleryHeader, 
  PhotoGrid, 
  CollageSection
} from '../components'
import { 
  Heart, 
  Download, 
  Loader
} from '../components/icons'
import AlbumGrid from '../components/AlbumGrid'
import AlbumViewer from '../components/AlbumViewer'
import CreateAlbum from '../components/CreateAlbum'
import type { Photo, Album } from '../contexts/PhotoContext'

type GalleryTab = 'photos' | 'collage' | 'albums'

const Gallery: React.FC = () => {
  const { photos, addPhoto, deletePhoto } = usePhoto()
  const { albums, getFavoritePhotos } = usePhoto()
  const { downloadPhotosAsZip, isGenerating, progress, error } = usePDFDownload()
  const [activeTab, setActiveTab] = useState<GalleryTab>('photos')

  // Handle photo selection for various operations
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  // Album-specific state
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false)

  // Filter photos based on favorites toggle
  const displayedPhotos = useMemo(() => {
    return showFavoritesOnly ? getFavoritePhotos() : photos
  }, [showFavoritesOnly, getFavoritePhotos, photos])

  const handlePhotoSelect = (photo: Photo) => {
    // For photo viewing, open in preview
    if (!selectionMode) {
      // Photo viewing is handled by PhotoGrid component internally
      return
    }
    
    // For selection mode, toggle selection
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photo.id)) {
        newSet.delete(photo.id)
      } else {
        newSet.add(photo.id)
      }
      return newSet
    })
  }

  const handlePhotoToggle = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photoId)) {
        newSet.delete(photoId)
      } else {
        newSet.add(photoId)
      }
      return newSet
    })
  }

  const handlePhotoDelete = (photoId: string) => {
    deletePhoto(photoId)
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      newSet.delete(photoId)
      return newSet
    })
  }

  const handleBulkDownload = async () => {
    if (selectedPhotos.size === 0) return
    
    const selectedPhotoObjects = displayedPhotos.filter(photo => 
      selectedPhotos.has(photo.id)
    )
    
    try {
      await downloadPhotosAsZip(selectedPhotoObjects, `photos-${Date.now()}.zip`)
      clearSelection()
    } catch (error) {
      console.error('Failed to download photos:', error)
    }
  }

  const handleCollageCreate = (collageData: string) => {
    // Create a new photo from the collage data
    const collagePhoto: Photo = {
      id: `collage-${Date.now()}`,
      url: collageData,
      thumbnail: collageData,
      filename: `collage-${Date.now()}.png`,
      timestamp: new Date(),
      isCollage: true
    }
    
    addPhoto(collagePhoto)
  }

  const clearSelection = () => {
    setSelectedPhotos(new Set())
    setSelectionMode(false)
  }

  const renderTabContent = () => {
    const tabVariants = {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    }

    switch (activeTab) {
      case 'photos':
        return (
          <motion.div
            key="photos"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Your Photos</h2>
                  <p className="text-gray-600">
                    {displayedPhotos.length} photo{displayedPhotos.length !== 1 ? 's' : ''} 
                    {showFavoritesOnly ? ' in favorites' : ' in your collection'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Favorites Filter Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 ${
                      showFavoritesOnly
                        ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    Favorites
                  </motion.button>

                  {displayedPhotos.length > 0 && (
                    <>
                      {selectionMode ? (
                        <>
                          {selectedPhotos.size > 0 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleBulkDownload}
                              disabled={isGenerating}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Download ({selectedPhotos.size})
                                </>
                              )}
                            </motion.button>
                          )}
                          
                          <button
                            onClick={clearSelection}
                            className="px-4 py-2 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectionMode(true)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
                        >
                          Select Photos
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Download Progress Indicator */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        {progress.message || 'Preparing download...'}
                      </p>
                      <div className="mt-1 bg-blue-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                      {progress.currentPhoto && progress.totalPhotos && (
                        <p className="text-xs text-blue-700 mt-1">
                          Processing photo {progress.currentPhoto} of {progress.totalPhotos}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
                >
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              <PhotoGrid
                photos={displayedPhotos}
                onPhotoSelect={handlePhotoSelect}
                onPhotoDelete={handlePhotoDelete}
                selectionMode={selectionMode}
                selectedPhotos={selectedPhotos}
                onToggleSelection={handlePhotoToggle}
              />
            </div>
          </motion.div>
        )

      case 'collage':
        return (
          <motion.div
            key="collage"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/40 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Create Collages
                </h2>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Combine your photos into beautiful collages
                </p>
              </div>
            </div>

            <CollageSection
              photos={photos.map(photo => ({
                ...photo,
                thumbnail: photo.thumbnail || photo.url
              }))}
              onCreateCollage={handleCollageCreate}
            />
          </motion.div>
        )

      case 'albums':
        return (
          <motion.div
            key="albums"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {selectedAlbum ? (
              // Show Album Viewer when an album is selected
              <AlbumViewer
                album={selectedAlbum}
                onBack={() => setSelectedAlbum(null)}
                onEdit={() => {
                  // TODO: Add album edit functionality
                }}
              />
            ) : (
              // Show Albums Grid
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/40 shadow-lg">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                      Photo Albums
                    </h2>
                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                      Organize your photos into beautiful albums
                    </p>
                  </div>
                </div>

                {albums && albums.length > 0 ? (
                  <AlbumGrid 
                    albums={albums} 
                    onAlbumSelect={(album) => setSelectedAlbum(album)}
                  />
                ) : (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/40 shadow-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Albums Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Create your first album to organize your photos
                    </p>
                    <button
                      onClick={() => setIsCreateAlbumOpen(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Your First Album
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Create Album Modal */}
            <CreateAlbum
              isOpen={isCreateAlbumOpen}
              onClose={() => setIsCreateAlbumOpen(false)}
              onSuccess={() => {
                setIsCreateAlbumOpen(false)
                // Refresh albums if needed
              }}
            />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Gallery Header with Tab Navigation */}
        <GalleryHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Gallery
