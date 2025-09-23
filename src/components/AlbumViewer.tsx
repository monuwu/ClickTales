import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Plus, 
  User, 
  Search, 
  FileText,
  Grid,
  ImageIcon,
  Loader,
  ArrowUpDown,
  Eye
} from './icons'
import PhotoGrid from './PhotoGrid'
import PDFPreviewModal from './PDFPreviewModal'
import { usePhoto, type Album, type Photo } from '../contexts/PhotoContext'
import { usePDFDownload } from '../hooks/usePDFDownload'

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc'

interface AlbumViewerProps {
  album: Album
  onBack: () => void
  onEdit?: (album: Album) => void
}

const AlbumViewer: React.FC<AlbumViewerProps> = ({
  album,
  onBack,
  onEdit
}) => {
  const { 
    getAlbumPhotos, 
    deleteAlbum, 
    removePhotoFromAlbum, 
    photos 
  } = usePhoto()
  
  const { generateAlbumPDF, isGenerating, progress, error } = usePDFDownload()
  
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [showPDFOptions, setShowPDFOptions] = useState(false)
  const [showPDFPreview, setShowPDFPreview] = useState(false)

  const albumPhotos = getAlbumPhotos(album.id)
  const availablePhotos = photos.filter(photo => !album.photoIds.includes(photo.id))

  // Filter and sort photos based on search term and sort option
  const filteredAndSortedPhotos = useMemo(() => {
    let filtered = albumPhotos.filter(photo =>
      photo.filename.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'date-asc':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case 'name-asc':
          return a.filename.localeCompare(b.filename)
        case 'name-desc':
          return b.filename.localeCompare(a.filename)
        case 'size-desc':
          return (b.metadata?.size || 0) - (a.metadata?.size || 0)
        case 'size-asc':
          return (a.metadata?.size || 0) - (b.metadata?.size || 0)
        default:
          return 0
      }
    })
  }, [albumPhotos, searchTerm, sortBy])

  const handleDeleteAlbum = async () => {
    if (window.confirm(`Are you sure you want to delete "${album.title}"? This action cannot be undone.`)) {
      try {
        await deleteAlbum(album.id)
        onBack()
      } catch (error) {
        console.error('Failed to delete album:', error)
      }
    }
  }

  const handleRemovePhotos = async () => {
    if (selectedPhotos.size === 0) return
    
    const confirmMessage = `Remove ${selectedPhotos.size} photo${selectedPhotos.size !== 1 ? 's' : ''} from "${album.title}"?`
    if (window.confirm(confirmMessage)) {
      try {
        await Promise.all(
          Array.from(selectedPhotos).map(photoId => 
            removePhotoFromAlbum(photoId, album.id)
          )
        )
        setSelectedPhotos(new Set())
        setSelectionMode(false)
      } catch (error) {
        console.error('Failed to remove photos from album:', error)
      }
    }
  }

  const handleToggleSelection = (photoId: string) => {
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

  const handlePhotoSelect = (photo: Photo) => {
    if (selectionMode) {
      handleToggleSelection(photo.id)
    }
    // Could add full-screen photo view here
  }

  const handleDownloadPDF = async (layout: 'single' | 'grid' = 'single') => {
    try {
      await generateAlbumPDF(album, albumPhotos, { 
        layout, 
        includeMetadata: true,
        quality: 0.8 
      })
      setShowPDFOptions(false)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{album.title}</h1>
              {album.description && (
                <p className="text-gray-600 mt-1">{album.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {albumPhotos.length} photo{albumPhotos.length !== 1 ? 's' : ''} • 
                Created {new Date(album.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PDF Download Button */}
            {albumPhotos.length > 0 && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPDFOptions(!showPDFOptions)}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Download PDF
                    </>
                  )}
                </motion.button>

                {/* PDF Options Dropdown */}
                <AnimatePresence>
                  {showPDFOptions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-xl z-20"
                    >
                      <div className="p-2">
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: 'rgb(243 244 246)' }}
                          onClick={() => setShowPDFPreview(true)}
                          className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-3"
                        >
                          <Eye className="w-4 h-4" />
                          Preview & Options
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: 'rgb(243 244 246)' }}
                          onClick={() => handleDownloadPDF('single')}
                          className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-3"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Quick Single Layout
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: 'rgb(243 244 246)' }}
                          onClick={() => handleDownloadPDF('grid')}
                          className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-3"
                        >
                          <Grid className="w-4 h-4" />
                          Quick Grid Layout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(album)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAlbum}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </motion.button>
          </div>
        </div>

        {/* Progress Indicator for PDF Generation */}
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
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Search and Filter Bar */}
        {albumPhotos.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="size-desc">Largest First</option>
                <option value="size-asc">Smallest First</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Action Bar */}
        {albumPhotos.length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectionMode(!selectionMode)
                setSelectedPhotos(new Set())
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                selectionMode
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectionMode ? 'Cancel Selection' : 'Select Photos'}
            </motion.button>

            {selectionMode && selectedPhotos.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRemovePhotos}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Remove Selected ({selectedPhotos.size})
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {filteredAndSortedPhotos.length > 0 ? (
        <PhotoGrid
          photos={filteredAndSortedPhotos}
          onPhotoSelect={handlePhotoSelect}
          selectionMode={selectionMode}
          selectedPhotos={selectedPhotos}
          onToggleSelection={handleToggleSelection}
        />
      ) : searchTerm ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center shadow-lg"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">No photos found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            No photos match your search "{searchTerm}". Try a different search term.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
          >
            Clear Search
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center shadow-lg"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <Plus className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">No photos in this album</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            This album is empty. Add some photos to get started!
          </p>
          
          {availablePhotos.length > 0 && (
            <p className="text-sm text-gray-400">
              You have {availablePhotos.length} photo{availablePhotos.length !== 1 ? 's' : ''} that can be added to this album.
            </p>
          )}
        </motion.div>
      )}

      {/* Cover Photo Display */}
      {album.coverPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 w-16 h-16 rounded-xl overflow-hidden shadow-lg border-2 border-white z-10"
        >
          <img
            src={album.coverPhoto}
            alt="Album cover"
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => {
          setShowPDFPreview(false)
          setShowPDFOptions(false)
        }}
        album={album}
        photos={albumPhotos}
      />
    </motion.div>
  )
}

export default AlbumViewer