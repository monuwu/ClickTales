import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Plus, X, ImageIcon, Layout, RotateCcw } from './icons'
import PhotoGrid from './PhotoGrid'
import type { Photo } from '../types'

interface CollageSectionProps {
  photos: Photo[]
  onCreateCollage?: (collageData: string) => void
}

interface CollageLayout {
  id: string
  name: string
  positions: Array<{
    x: number
    y: number
    width: number
    height: number
  }>
}

const collageLayouts: CollageLayout[] = [
  {
    id: 'grid-2x2',
    name: '2x2 Grid',
    positions: [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 50, y: 0, width: 50, height: 50 },
      { x: 0, y: 50, width: 50, height: 50 },
      { x: 50, y: 50, width: 50, height: 50 }
    ]
  },
  {
    id: 'grid-3x3',
    name: '3x3 Grid',
    positions: [
      { x: 0, y: 0, width: 33.33, height: 33.33 },
      { x: 33.33, y: 0, width: 33.33, height: 33.33 },
      { x: 66.66, y: 0, width: 33.33, height: 33.33 },
      { x: 0, y: 33.33, width: 33.33, height: 33.33 },
      { x: 33.33, y: 33.33, width: 33.33, height: 33.33 },
      { x: 66.66, y: 33.33, width: 33.33, height: 33.33 },
      { x: 0, y: 66.66, width: 33.33, height: 33.33 },
      { x: 33.33, y: 66.66, width: 33.33, height: 33.33 },
      { x: 66.66, y: 66.66, width: 33.33, height: 33.33 }
    ]
  },
  {
    id: 'hero-layout',
    name: 'Hero Layout',
    positions: [
      { x: 0, y: 0, width: 70, height: 100 },
      { x: 70, y: 0, width: 30, height: 50 },
      { x: 70, y: 50, width: 30, height: 50 }
    ]
  },
  {
    id: 'magazine',
    name: 'Magazine Style',
    positions: [
      { x: 0, y: 0, width: 60, height: 60 },
      { x: 60, y: 0, width: 40, height: 30 },
      { x: 60, y: 30, width: 40, height: 30 },
      { x: 0, y: 60, width: 30, height: 40 },
      { x: 30, y: 60, width: 30, height: 40 },
      { x: 60, y: 60, width: 40, height: 40 }
    ]
  }
]

const CollageSection: React.FC<CollageSectionProps> = ({ photos, onCreateCollage }) => {
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout>(collageLayouts[0])
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([])
  const [showPhotoSelector, setShowPhotoSelector] = useState(false)
  const [collagePreview, setCollagePreview] = useState<string | null>(null)

  const maxPhotos = selectedLayout.positions.length

  const handleLayoutChange = (layout: CollageLayout) => {
    setSelectedLayout(layout)
    setSelectedPhotos(prev => prev.slice(0, layout.positions.length))
  }

  const handlePhotoSelect = (photo: Photo) => {
    if (selectedPhotos.length < maxPhotos) {
      setSelectedPhotos(prev => [...prev, photo])
    }
  }

  const handlePhotoRemove = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const generateCollage = async () => {
    if (selectedPhotos.length === 0) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasSize = 800
    canvas.width = canvasSize
    canvas.height = canvasSize

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Load and draw images
    const imagePromises = selectedPhotos.map((photo, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const position = selectedLayout.positions[index]
          if (position) {
            const x = (position.x / 100) * canvasSize
            const y = (position.y / 100) * canvasSize
            const width = (position.width / 100) * canvasSize
            const height = (position.height / 100) * canvasSize

            // Add subtle border
            ctx.strokeStyle = '#e5e7eb'
            ctx.lineWidth = 2
            ctx.strokeRect(x, y, width, height)

            // Draw image
            ctx.drawImage(img, x + 1, y + 1, width - 2, height - 2)
          }
          resolve()
        }
        img.src = photo.url
      })
    })

    await Promise.all(imagePromises)
    
    const collageDataUrl = canvas.toDataURL('image/png', 0.9)
    setCollagePreview(collageDataUrl)
    
    if (onCreateCollage) {
      onCreateCollage(collageDataUrl)
    }
  }

  const downloadCollage = () => {
    if (collagePreview) {
      const link = document.createElement('a')
      link.href = collagePreview
      link.download = `collage-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const resetCollage = () => {
    setSelectedPhotos([])
    setCollagePreview(null)
  }

  useEffect(() => {
    if (selectedPhotos.length > 0) {
      generateCollage()
    }
  }, [selectedPhotos, selectedLayout])

  return (
    <div className="space-y-6">
      {/* Layout Selector */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <Layout className="w-5 h-5 mr-2 text-purple-600" />
          Choose Layout
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {collageLayouts.map((layout) => (
            <motion.button
              key={layout.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLayoutChange(layout)}
              className={`relative aspect-square rounded-xl border-2 transition-all duration-200 ${
                selectedLayout.id === layout.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-gray-50 hover:border-purple-300'
              }`}
            >
              <div className="absolute inset-2">
                {layout.positions.map((position, index) => (
                  <div
                    key={index}
                    className={`absolute border rounded ${
                      selectedLayout.id === layout.id
                        ? 'border-purple-400 bg-purple-100'
                        : 'border-gray-300 bg-gray-100'
                    }`}
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      width: `${position.width}%`,
                      height: `${position.height}%`
                    }}
                  />
                ))}
              </div>
              <div className="absolute bottom-1 left-1 right-1">
                <p className="text-xs font-medium text-gray-600 truncate">
                  {layout.name}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Photo Slots */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
            Selected Photos ({selectedPhotos.length}/{maxPhotos})
          </h3>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPhotoSelector(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Photos
            </motion.button>
            {selectedPhotos.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetCollage}
                className="bg-gray-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-600 transition-colors duration-200 flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </motion.button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: maxPhotos }).map((_, index) => (
            <div key={index} className="relative aspect-square">
              {selectedPhotos[index] ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full h-full rounded-xl overflow-hidden bg-white shadow-lg group"
                >
                  <img
                    src={selectedPhotos[index].thumbnail || selectedPhotos[index].url}
                    alt={selectedPhotos[index].filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
                    <button
                      onClick={() => handlePhotoRemove(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPhotoSelector(true)}
                  className="w-full h-full rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/50 transition-colors duration-200 flex items-center justify-center"
                >
                  <Plus className="w-6 h-6 text-purple-400" />
                </motion.button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collage Preview */}
      {collagePreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Collage Preview</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCollage}
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </motion.button>
          </div>
          <div className="flex justify-center">
            <img
              src={collagePreview}
              alt="Collage Preview"
              className="max-w-md w-full rounded-xl shadow-lg"
            />
          </div>
        </motion.div>
      )}

      {/* Photo Selector Modal */}
      <AnimatePresence>
        {showPhotoSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPhotoSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-700">
                  Select Photos for Collage
                </h3>
                <button
                  onClick={() => setShowPhotoSelector(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <PhotoGrid
                photos={photos.filter(photo => !selectedPhotos.some(selected => selected.id === photo.id))}
                onPhotoSelect={(photo) => {
                  handlePhotoSelect(photo)
                  if (selectedPhotos.length + 1 >= maxPhotos) {
                    setShowPhotoSelector(false)
                  }
                }}
                selectionMode={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CollageSection
