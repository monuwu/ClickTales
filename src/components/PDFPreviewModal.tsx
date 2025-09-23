import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Download, 
  Share2, 
  FileText, 
  Grid, 
  ImageIcon,
  Loader
} from './icons'
import { usePDFDownload } from '../hooks/usePDFDownload'
import type { Album, Photo } from '../contexts/PhotoContext'

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  album: Album
  photos: Photo[]
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  album,
  photos
}) => {
  const { generateAlbumPDF, isGenerating, progress, error } = usePDFDownload()
  const [selectedLayout, setSelectedLayout] = useState<'single' | 'grid'>('single')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [quality, setQuality] = useState(0.8)

  const handleDownload = async () => {
    try {
      await generateAlbumPDF(album, photos, {
        layout: selectedLayout,
        includeMetadata,
        quality
      })
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    }
  }

  const handleShare = async () => {
    if (!('share' in navigator)) {
      // Fallback: copy link to clipboard
      const albumUrl = `${window.location.origin}/albums/${album.id}`
      await navigator.clipboard.writeText(albumUrl)
      return
    }

    try {
      await navigator.share({
        title: `${album.title} - Album`,
        text: `Check out my photo album: ${album.title}`,
        url: `${window.location.origin}/albums/${album.id}`
      })
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">PDF Preview</h2>
                <p className="text-gray-600 text-sm">{album.title}</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Album Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{album.title}</h3>
              {album.description && (
                <p className="text-gray-600 text-sm mb-3">{album.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{photos.length} photos</span>
                <span>Created {new Date(album.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Layout Options */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Layout Options</h4>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedLayout('single')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedLayout === 'single'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Single Photo</p>
                      <p className="text-xs text-gray-500">One photo per page</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedLayout('grid')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedLayout === 'grid'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Grid className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Grid Layout</p>
                      <p className="text-xs text-gray-500">2x2 photos per page</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Options */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Options</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Include album metadata (title, date, description)</span>
                </label>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Image Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Preview Photos */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Photos to Include</h4>
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                {photos.slice(0, 12).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {photos.length > 12 && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-medium">
                      +{photos.length - 12}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      {progress.message || 'Generating PDF...'}
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
                className="p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200/50 bg-gray-50/50">
            <div className="text-sm text-gray-500">
              Estimated size: ~{Math.round((photos.length * quality * 0.5))}MB
            </div>
            
            <div className="flex items-center gap-3">
              {'share' in navigator && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Album
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={isGenerating || photos.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PDFPreviewModal