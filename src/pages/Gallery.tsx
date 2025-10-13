import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhotos } from '../contexts/PhotoContext'
import {
  GalleryHeader,
  PhotoGrid,
  CollageSection
} from '../components'
import {
  Heart as HeartIcon,
  Download
} from '../components/icons'
import AlbumGrid from '../components/AlbumGrid'
import AlbumViewer from '../components/AlbumViewer'
import CreateAlbum from '../components/CreateAlbum'
import type { Photo, Album } from '../contexts/PhotoContext'

type GalleryTab = 'photos' | 'favorites' | 'collage' | 'albums'

const Gallery: React.FC = () => {
  const { photos, addPhoto, deletePhoto, favoritePhotos, toggleFavoritePhoto, albums } = usePhotos()
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
    return showFavoritesOnly ? photos.filter(photo => favoritePhotos.includes(photo.id)) : photos
  }, [showFavoritesOnly, photos, favoritePhotos])

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
      // Create download links for selected photos
      selectedPhotoObjects.forEach((photo) => {
        const link = document.createElement('a')
        link.href = photo.url
        link.download = photo.filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
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
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Your Photos</h2>
                    <p className="text-slate-300 text-lg">
                      {displayedPhotos.length} photo{displayedPhotos.length !== 1 ? 's' : ''}
                      {showFavoritesOnly ? ' in favorites' : ' in your collection'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Favorites Filter Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border ${
                        showFavoritesOnly
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-500/25 border-white/20'
                          : 'bg-slate-800/50 backdrop-blur-sm text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                      }`}
                    >
                      <HeartIcon className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                      Favorites
                    </motion.button>

                    {displayedPhotos.length > 0 && (
                      <>
                        {selectionMode ? (
                          <>
                            {selectedPhotos.size > 0 && (
                              <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBulkDownload}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2 border border-white/20"
                              >
                                <Download className="w-5 h-5" />
                                Download ({selectedPhotos.size})
                              </motion.button>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={clearSelection}
                              className="px-6 py-3 bg-slate-600/60 backdrop-blur-sm text-white rounded-xl font-medium border border-white/20 hover:bg-slate-500/60 transition-all duration-300"
                            >
                              Cancel
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectionMode(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-xl hover:shadow-purple-500/25 transition-all duration-300 border border-white/20"
                          >
                            Select Photos
                          </motion.button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <PhotoGrid
                  photos={displayedPhotos}
                  onPhotoSelect={handlePhotoSelect}
                  onPhotoDelete={handlePhotoDelete}
                  selectionMode={selectionMode}
                  selectedPhotos={selectedPhotos}
                  onToggleSelection={handlePhotoToggle}
                  favoritePhotos={favoritePhotos}
                  toggleFavoritePhoto={toggleFavoritePhoto}
                />
              </div>
            </motion.div>
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
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-2xl">
                <div className="text-center mb-10">
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4"
                  >
                    Create Collages
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-300 text-xl max-w-md mx-auto leading-relaxed"
                  >
                    Combine your photos into beautiful, artistic collages
                  </motion.p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CollageSection
                photos={photos.map(photo => ({
                  ...photo,
                  thumbnail: photo.thumbnail || photo.url
                }))}
                onCreateCollage={handleCollageCreate}
              />
            </motion.div>
          </motion.div>
        )

      case 'favorites':
        const favoritePhotosList = photos.filter(photo => favoritePhotos.includes(photo.id))
        return (
          <motion.div
            key="favorites"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-red-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white flex items-center mb-2">
                      <HeartIcon className="w-8 h-8 mr-3 text-pink-400 fill-current" />
                      Favorite Photos
                    </h2>
                    <p className="text-slate-300 text-lg">
                      {favoritePhotosList.length} favorite photo{favoritePhotosList.length !== 1 ? 's' : ''} in your collection
                    </p>
                  </div>

                  {favoritePhotosList.length > 0 && (
                    <div className="flex space-x-4">
                      {selectionMode ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={clearSelection}
                            className="px-6 py-3 bg-slate-600/60 backdrop-blur-sm text-white rounded-xl font-medium border border-white/20 hover:bg-slate-500/60 transition-all duration-300"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              // Could add bulk operations here
                              clearSelection()
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-xl hover:shadow-pink-500/25 transition-all duration-300 border border-white/20"
                            disabled={selectedPhotos.size === 0}
                          >
                            Done ({selectedPhotos.size})
                          </motion.button>
                        </>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectionMode(true)}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-xl hover:shadow-purple-500/25 transition-all duration-300 border border-white/20"
                        >
                          Select Photos
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>

                {favoritePhotosList.length > 0 ? (
                  <PhotoGrid
                    photos={favoritePhotosList}
                    onPhotoSelect={handlePhotoSelect}
                    onPhotoDelete={handlePhotoDelete}
                    selectionMode={selectionMode}
                    selectedPhotos={selectedPhotos}
                    onToggleSelection={handlePhotoToggle}
                    favoritePhotos={favoritePhotos}
                    toggleFavoritePhoto={toggleFavoritePhoto}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <HeartIcon className="w-10 h-10 text-white fill-current" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-4">No favorite photos yet</h3>
                    <p className="text-slate-300 text-lg max-w-md mx-auto">Click the heart icon on photos to add them to your favorites collection</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
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
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {selectedAlbum ? (
              // Show Album Viewer when an album is selected
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <AlbumViewer
                  album={selectedAlbum}
                  onBack={() => setSelectedAlbum(null)}
                  onEdit={() => {
                    // TODO: Add album edit functionality
                  }}
                />
              </motion.div>
            ) : (
              // Show Albums Grid
              <div>
                {albums && albums.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <AlbumGrid
                      albums={albums}
                      onAlbumSelect={(album) => setSelectedAlbum(album)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                    <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 shadow-2xl text-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
                      >
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-4">No Albums Yet</h3>
                      <p className="text-slate-300 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                        Create your first album to organize your photos into beautiful collections
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreateAlbumOpen(true)}
                        className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 border border-white/20"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center space-x-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Create Your First Album</span>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"></div>
      </div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Gallery Header with Tab Navigation */}
        <GalleryHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="container mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Gallery
