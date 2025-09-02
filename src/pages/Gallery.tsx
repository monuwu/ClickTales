import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhotos } from '../contexts/PhotoContext'
import { 
  GalleryHeader, 
  PhotoGrid, 
  CollageSection, 
  AlbumManager, 
  exportAlbumToPDF 
} from '../components'
import type { Photo, Album } from '../types'

type GalleryTab = 'photos' | 'collage' | 'albums'

const Gallery: React.FC = () => {
  const { photos, addPhoto, deletePhoto } = usePhotos()
  const [activeTab, setActiveTab] = useState<GalleryTab>('photos')
  const [isLoading, setIsLoading] = useState(false)

  // Handle photo selection for various operations
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

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

  const handleAlbumExportPDF = async (album: Album) => {
    try {
      setIsLoading(true)
      await exportAlbumToPDF(album, photos, {
        photosPerPage: 4,
        includeMetadata: true,
        quality: 0.8
      })
    } catch (error) {
      console.error('Failed to export album to PDF:', error)
      alert('Failed to export album to PDF. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
                    {photos.length} photo{photos.length !== 1 ? 's' : ''} in your collection
                  </p>
                </div>
                
                {photos.length > 0 && (
                  <div className="flex space-x-3">
                    {selectionMode ? (
                      <>
                        <button
                          onClick={clearSelection}
                          className="px-4 py-2 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // Could add bulk operations here
                            clearSelection()
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
                          disabled={selectedPhotos.size === 0}
                        >
                          Done ({selectedPhotos.size})
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
                  </div>
                )}
              </div>

              <PhotoGrid
                photos={photos}
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create Collages</h2>
                <p className="text-gray-600">
                  Combine your photos into beautiful collages
                </p>
              </div>
            </div>

            <CollageSection
              photos={photos}
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Photo Albums</h2>
                <p className="text-gray-600">
                  Organize your photos into albums and export as PDF
                </p>
              </div>
            </div>

            <AlbumManager
              photos={photos}
              onExportAlbumPDF={handleAlbumExportPDF}
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

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="text-gray-700 font-medium">Exporting PDF...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Gallery
