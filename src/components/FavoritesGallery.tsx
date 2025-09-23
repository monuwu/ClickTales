import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhoto } from '../contexts/PhotoContext'
import { useNotifications } from '../contexts/NotificationContext'
import { BulkDownloadButton } from './BulkDownloadModal'
import { 
  Heart, 
  Search, 
  Filter, 
  Grid, 
  List, 
  ArrowUpDown,
  Trash2,
  Download,
  X
} from './icons'
import type { Photo } from '../contexts/PhotoContext'

interface FavoritesGalleryProps {
  className?: string
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc'
type FilterOption = 'all' | 'today' | 'week' | 'month' | 'collages' | 'photos'
type ViewMode = 'grid' | 'list'

export const FavoritesGallery: React.FC<FavoritesGalleryProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const { photos, favoritePhotos, toggleFavoritePhoto, deletePhoto } = usePhoto()
  const { addNotification } = useNotifications()

  // Get favorite photos
  const favoritePhotoObjects = useMemo(() => {
    return photos.filter(photo => favoritePhotos.includes(photo.id))
  }, [photos, favoritePhotos])

  // Apply search, filter, and sort
  const filteredAndSortedPhotos = useMemo(() => {
    let filtered = favoritePhotoObjects

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(photo => 
        photo.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.metadata?.size?.toString().includes(searchQuery)
      )
    }

    // Apply date filters
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (filterBy) {
      case 'today':
        filtered = filtered.filter(photo => photo.timestamp >= today)
        break
      case 'week':
        filtered = filtered.filter(photo => photo.timestamp >= weekAgo)
        break
      case 'month':
        filtered = filtered.filter(photo => photo.timestamp >= monthAgo)
        break
      case 'collages':
        filtered = filtered.filter(photo => photo.isCollage)
        break
      case 'photos':
        filtered = filtered.filter(photo => !photo.isCollage)
        break
      default:
        // 'all' - no additional filtering
        break
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'date-asc':
          return a.timestamp.getTime() - b.timestamp.getTime()
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

    return sorted
  }, [favoritePhotoObjects, searchQuery, filterBy, sortBy])

  // Selection handlers
  const togglePhotoSelection = useCallback((photoId: string) => {
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

  const selectAllPhotos = useCallback(() => {
    setSelectedPhotos(new Set(filteredAndSortedPhotos.map(p => p.id)))
  }, [filteredAndSortedPhotos])

  const clearSelection = useCallback(() => {
    setSelectedPhotos(new Set())
    setIsSelectionMode(false)
  }, [])

  // Bulk operations
  const handleBulkUnfavorite = useCallback(async () => {
    try {
      const promises = Array.from(selectedPhotos).map(photoId => 
        toggleFavoritePhoto(photoId)
      )
      await Promise.all(promises)
      
      addNotification({
        type: 'success',
        title: 'Removed from favorites',
        message: `${selectedPhotos.size} photos removed from favorites`
      })
      
      clearSelection()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to remove favorites',
        message: 'An error occurred while removing photos from favorites'
      })
    }
  }, [selectedPhotos, toggleFavoritePhoto, addNotification, clearSelection])

  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedPhotos.size} photos? This action cannot be undone.`)) {
      return
    }

    try {
      const promises = Array.from(selectedPhotos).map(photoId => deletePhoto(photoId))
      await Promise.all(promises)
      
      addNotification({
        type: 'success',
        title: 'Photos deleted',
        message: `${selectedPhotos.size} photos deleted successfully`
      })
      
      clearSelection()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to delete photos',
        message: 'An error occurred while deleting photos'
      })
    }
  }, [selectedPhotos, deletePhoto, addNotification, clearSelection])

  const getSelectedPhotos = useCallback(() => {
    return filteredAndSortedPhotos.filter(photo => selectedPhotos.has(photo.id))
  }, [filteredAndSortedPhotos, selectedPhotos])

  if (favoritePhotoObjects.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Favorite Photos</h3>
        <p className="text-gray-500">
          Start favoriting photos to see them appear here!
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Heart className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Favorite Photos ({favoritePhotoObjects.length})
          </h2>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search favorite photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="collages">Collages Only</option>
            <option value="photos">Photos Only</option>
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
        </div>
      </div>

      {/* Selection Mode Controls */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <span className="text-blue-800 font-medium">
                {selectedPhotos.size} selected
              </span>
              <button
                onClick={selectAllPhotos}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Select All ({filteredAndSortedPhotos.length})
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <BulkDownloadButton
                photos={getSelectedPhotos()}
                type="selected"
                className="!bg-green-600 hover:!bg-green-700"
              >
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </div>
              </BulkDownloadButton>
              
              <button
                onClick={handleBulkUnfavorite}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center space-x-1"
              >
                <Heart className="h-4 w-4" />
                <span>Unfavorite</span>
              </button>
              
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
              
              <button
                onClick={clearSelection}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredAndSortedPhotos.length} of {favoritePhotoObjects.length} favorite photos
        </span>
        
        {!isSelectionMode && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSelectionMode(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Select Photos
            </button>
            
            <BulkDownloadButton
              photos={filteredAndSortedPhotos}
              type="favorites"
              className="!px-3 !py-1 !text-sm"
            />
          </div>
        )}
      </div>

      {/* Photos */}
      {filteredAndSortedPhotos.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No photos found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-2'
        }>
          {filteredAndSortedPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              viewMode={viewMode}
              isSelected={selectedPhotos.has(photo.id)}
              isSelectionMode={isSelectionMode}
              onToggleSelection={() => togglePhotoSelection(photo.id)}
              onToggleFavorite={() => toggleFavoritePhoto(photo.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Photo Card Component
interface PhotoCardProps {
  photo: Photo
  viewMode: ViewMode
  isSelected: boolean
  isSelectionMode: boolean
  onToggleSelection: () => void
  onToggleFavorite: () => void
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  viewMode,
  isSelected,
  isSelectionMode,
  onToggleSelection,
  onToggleFavorite
}) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        className={`flex items-center space-x-4 p-3 rounded-lg border transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelection}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        )}

        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={photo.thumbnail || photo.url}
            alt={photo.filename}
            className="h-16 w-16 object-cover rounded-lg"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {photo.filename}
          </h4>
          <p className="text-xs text-gray-500">
            {photo.timestamp.toLocaleDateString()} • {photo.isCollage ? 'Collage' : 'Photo'}
          </p>
          {photo.metadata?.size && (
            <p className="text-xs text-gray-400">
              {Math.round(photo.metadata.size / 1024)} KB
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center space-x-2">
          <button
            onClick={onToggleFavorite}
            className="p-1 text-red-500 hover:text-red-600 transition-colors"
          >
            <Heart className="h-4 w-4 fill-current" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      className={`relative group rounded-lg overflow-hidden shadow-sm transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}
    >
      {/* Selection Overlay */}
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelection}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      )}

      {/* Image */}
      <div className="aspect-square bg-gray-100">
        <img
          src={photo.thumbnail || photo.url}
          alt={photo.filename}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
        <div className="w-full p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white text-xs font-medium truncate">
                {photo.filename}
              </h4>
              <p className="text-white/80 text-xs">
                {photo.timestamp.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onToggleFavorite}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
            >
              <Heart className="h-4 w-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Type indicator */}
      {photo.isCollage && (
        <div className="absolute top-2 right-2">
          <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
            Collage
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default FavoritesGallery