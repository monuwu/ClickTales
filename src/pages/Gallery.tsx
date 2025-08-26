import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, Trash2, Home, Grid, List, Share2, Eye, Calendar, Camera } from '../components/icons'
import { usePhotos } from '../contexts/PhotoContext'
import Navigation from '../components/Navigation'
import type { Photo } from '../types'

type ViewMode = 'grid' | 'list'

const Gallery: React.FC = () => {
  const { photos, deletePhoto } = usePhotos()
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const handleDownload = (photo: Photo) => {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadSelected = () => {
    selectedPhotos.forEach(photoId => {
      const photo = photos.find(p => p.id === photoId)
      if (photo) handleDownload(photo)
    })
    setSelectedPhotos(new Set())
    setIsSelectionMode(false)
  }

  const handleDeleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedPhotos.size} photo(s)?`)) {
      selectedPhotos.forEach(photoId => deletePhoto(photoId))
      setSelectedPhotos(new Set())
      setIsSelectionMode(false)
    }
  }

  const handleDelete = (photoId: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      deletePhoto(photoId)
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos)
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId)
    } else {
      newSelection.add(photoId)
    }
    setSelectedPhotos(newSelection)
  }

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo)
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const clearSelection = () => {
    setSelectedPhotos(new Set())
    setIsSelectionMode(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-inter">
      <Navigation />
      
      {/* Vibrant Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 pt-20 pb-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link 
                to="/camera" 
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Camera</span>
              </Link>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-3">
              {/* Selection Mode Toggle */}
              {photos.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSelectionMode(!isSelectionMode)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isSelectionMode
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isSelectionMode ? 'Cancel' : 'Select'}
                </motion.button>
              )}
              
              {/* View Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl transition-all duration-300"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>

          {/* Selection Action Bar */}
          {isSelectionMode && selectedPhotos.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-white/20 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">
                  {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadSelected}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteSelected}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearSelection}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Title Section */}
          <div className="text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <h1 className="text-5xl md:text-6xl font-poppins font-bold mb-4">
                Captured <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">Moments</span>
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-4">
                A showcase of your photos with ClickTales
              </p>
              <div className="flex items-center justify-center space-x-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span className="text-lg font-medium">{photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}</span>
                </div>
                {photos.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-lg">
                      Latest: {new Date(Math.max(...photos.map(p => new Date(p.timestamp).getTime()))).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-4">
              No photos yet!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start capturing amazing moments with your camera!
            </p>
            <Link to="/camera">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <Camera className="w-6 h-6 inline mr-3" />
                Take Your First Photo
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Gallery Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Quick Actions */}
                <div className="flex items-center space-x-4">
                  <Link to="/camera">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Take Photo</span>
                    </motion.button>
                  </Link>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      photos.forEach(photo => handleDownload(photo))
                    }}
                    disabled={photos.length === 0}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download All</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSelectionMode(!isSelectionMode)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg ${
                      isSelectionMode
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <span>{isSelectionMode ? 'Cancel Select' : 'Select Multiple'}</span>
                  </motion.button>
                </div>
                
                {/* Gallery Info & Status */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className={`w-3 h-3 rounded-full ${photos.length > 0 ? 'bg-green-400' : 'bg-gray-300'} animate-pulse`}></div>
                    <span className="font-medium">
                      {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
                    </span>
                  </div>
                  
                  {isSelectionMode && selectedPhotos.size > 0 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-purple-600 font-medium">
                        {selectedPhotos.size} selected
                      </span>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDownloadSelected}
                          className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm transition-all duration-300"
                        >
                          Download
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDeleteSelected}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm transition-all duration-300"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }
            >
              {photos.map((photo: Photo, index: number) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    viewMode === 'list' ? 'flex items-center p-4 space-x-4' : ''
                  } ${
                    isSelectionMode && selectedPhotos.has(photo.id) ? 'ring-4 ring-purple-400' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="absolute top-3 left-3 z-20">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => togglePhotoSelection(photo.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          selectedPhotos.has(photo.id)
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'bg-white/80 border-white hover:bg-white'
                        }`}
                      >
                        {selectedPhotos.has(photo.id) && '✓'}
                      </motion.button>
                    </div>
                  )}

                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'
                  } bg-gradient-to-br from-purple-100 to-pink-100`}>
                    <img 
                      src={photo.thumbnail} 
                      alt={photo.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                      onClick={() => isSelectionMode ? togglePhotoSelection(photo.id) : openLightbox(photo)}
                    />
                    
                    {/* Overlay Actions - Grid View */}
                    {viewMode === 'grid' && !isSelectionMode && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              openLightbox(photo)
                            }}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(photo)
                              }}
                              className="bg-green-500/80 backdrop-blur-sm hover:bg-green-500 text-white p-2 rounded-lg transition-all duration-300"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                // Add share functionality
                              }}
                              className="bg-blue-500/80 backdrop-blur-sm hover:bg-blue-500 text-white p-2 rounded-lg transition-all duration-300"
                            >
                              <Share2 className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(photo.id)
                              }}
                              className="bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white p-2 rounded-lg transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Photo Info */}
                  <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
                    <h3 className="font-semibold text-gray-800 truncate mb-1">
                      {photo.filename}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(photo.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    
                    {/* List View Actions */}
                    {viewMode === 'list' && !isSelectionMode && (
                      <div className="flex space-x-2 mt-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openLightbox(photo)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm transition-all duration-300"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          View
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(photo)}
                          className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm transition-all duration-300"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          Download
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(photo.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.filename}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                
                <div className="absolute top-4 right-4 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownload(selectedPhoto)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-xl transition-all duration-300"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeLightbox}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-xl transition-all duration-300"
                  >
                    ×
                  </motion.button>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-xl font-poppins font-bold text-gray-800 mb-2">
                  {selectedPhoto.filename}
                </h3>
                <p className="text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedPhoto.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Gallery
