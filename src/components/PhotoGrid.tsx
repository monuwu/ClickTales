import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Download, Trash2, Check } from './icons'
import type { Photo } from '../types'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoSelect?: (photo: Photo) => void
  onPhotoDelete?: (photoId: string) => void
  selectionMode?: boolean
  selectedPhotos?: Set<string>
  onToggleSelection?: (photoId: string) => void
  maxSelections?: number
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoSelect,
  onPhotoDelete,
  selectionMode = false,
  selectedPhotos = new Set(),
  onToggleSelection,
  maxSelections
}) => {
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null)

  const handleDownload = (photo: Photo) => {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPhotoDelete && window.confirm('Are you sure you want to delete this photo?')) {
      onPhotoDelete(photoId)
    }
  }

  const handleSelection = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleSelection) {
      if (!selectedPhotos.has(photoId) && maxSelections && selectedPhotos.size >= maxSelections) {
        return // Don't allow more selections than max
      }
      onToggleSelection(photoId)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  }

  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
          <Eye className="w-12 h-12 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No photos yet</h3>
        <p className="text-gray-500 max-w-md">
          Start capturing memories! Your photos will appear here once you take some shots.
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            variants={itemVariants}
            layout
            className="relative group cursor-pointer"
            onClick={() => onPhotoSelect?.(photo)}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-purple-200/40 shadow-lg hover:shadow-xl transition-all duration-300">
              <img
                src={photo.thumbnail || photo.url}
                alt={photo.filename}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Selection overlay */}
              {selectionMode && (
                <div
                  className={`absolute inset-0 bg-purple-600/20 backdrop-blur-sm border-2 border-purple-500 rounded-2xl transition-all duration-200 ${
                    selectedPhotos.has(photo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => handleSelection(photo.id, e)}
                >
                  <div className="absolute top-2 right-2">
                    <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200 ${
                      selectedPhotos.has(photo.id) 
                        ? 'bg-purple-600 scale-110' 
                        : 'bg-white/80 hover:bg-white'
                    }`}>
                      {selectedPhotos.has(photo.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!selectionMode && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewPhoto(photo)
                      }}
                      className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(photo)
                      }}
                      className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    
                    {onPhotoDelete && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleDelete(photo.id, e)}
                        className="bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Photo info */}
            <div className="mt-2 px-1">
              <p className="text-xs text-gray-500 truncate">{photo.filename}</p>
              <p className="text-xs text-gray-400">
                {new Date(photo.timestamp).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewPhoto.url}
                alt={previewPhoto.filename}
                className="w-full h-full object-contain"
              />
              
              <div className="absolute top-4 right-4 flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(previewPhoto)}
                  className="bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPreviewPhoto(null)}
                  className="bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  ×
                </motion.button>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-semibold text-lg">{previewPhoto.filename}</h3>
                <p className="text-white/80 text-sm">
                  {new Date(previewPhoto.timestamp).toLocaleString()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default PhotoGrid
