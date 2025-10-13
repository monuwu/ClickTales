import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../contexts/NotificationContext'
import { 
  FolderPlus, 
  Folder, 
  Download, 
  Trash2, 
  Grid,
  List,
  Search,
  Star,
  Eye,
  EyeOff
} from './icons'
import type { Album } from '../types'

interface AlbumManagerProps {
  albums: Album[]
  onCreateAlbum?: (name: string, description?: string) => void
  onDeleteAlbum?: (albumId: string) => void
  onExportAlbumToPDF?: (albumId: string) => void
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortOption = 'name' | 'date' | 'photos'
type FilterOption = 'all' | 'public' | 'private' | 'favorites'

const AlbumManager: React.FC<AlbumManagerProps> = ({
  albums = [],
  onCreateAlbum,
  onDeleteAlbum,
  onExportAlbumToPDF,
  className = ''
}) => {
  const { addNotification } = useNotifications()
  
  // View and filtering state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Selection state
  const [selectedAlbums, setSelectedAlbums] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Form state
  const [albumForm, setAlbumForm] = useState({
    name: '',
    description: '',
    isPublic: false
  })

  // Filter and sort albums
  const getFilteredAndSortedAlbums = useCallback(() => {
    let filtered = albums.filter(album => {
      // Search filter
      if (searchQuery && !album.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Visibility filter
      if (filterBy === 'public' && !album.isPublic) return false
      if (filterBy === 'private' && album.isPublic) return false
      if (filterBy === 'favorites') {
        const favorites = JSON.parse(localStorage.getItem('favorite-albums') || '[]')
        if (!favorites.includes(album.id)) return false
      }
      
      return true
    })
    
    // Sort albums
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'photos':
          return (b.photos?.length || 0) - (a.photos?.length || 0)
        default:
          return 0
      }
    })
  }, [albums, searchQuery, filterBy, sortBy])

  const handleCreateAlbum = useCallback(async () => {
    if (!albumForm.name.trim()) {
      addNotification({
        type: 'error',
        title: 'Invalid album name',
        message: 'Please enter a valid album name.'
      })
      return
    }

    try {
      if (onCreateAlbum) {
        await onCreateAlbum(albumForm.name, albumForm.description)
      }
      
      addNotification({
        type: 'success',
        title: 'Album created',
        message: `Album "${albumForm.name}" has been created successfully.`
      })
      
      setAlbumForm({ name: '', description: '', isPublic: false })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create album:', error)
      addNotification({
        type: 'error',
        title: 'Failed to create album',
        message: 'There was an error creating the album. Please try again.'
      })
    }
  }, [albumForm, onCreateAlbum, addNotification])

  const handleDeleteAlbum = useCallback(async (albumId: string) => {
    const album = albums.find(a => a.id === albumId)
    if (!album) return

    if (!window.confirm(`Are you sure you want to delete "${album.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      if (onDeleteAlbum) {
        await onDeleteAlbum(albumId)
      }
      
      addNotification({
        type: 'success',
        title: 'Album deleted',
        message: `Album "${album.title}" has been deleted successfully.`
      })
      
      // Remove from selection if selected
      setSelectedAlbums(prev => {
        const newSet = new Set(prev)
        newSet.delete(albumId)
        return newSet
      })
    } catch (error) {
      console.error('Failed to delete album:', error)
      addNotification({
        type: 'error',
        title: 'Failed to delete album',
        message: 'There was an error deleting the album. Please try again.'
      })
    }
  }, [albums, onDeleteAlbum, addNotification])

  const handleBulkDelete = useCallback(async () => {
    if (selectedAlbums.size === 0) return

    if (!window.confirm(`Are you sure you want to delete ${selectedAlbums.size} albums? This action cannot be undone.`)) {
      return
    }

    const deletePromises = Array.from(selectedAlbums).map(albumId => 
      onDeleteAlbum && onDeleteAlbum(albumId)
    )

    try {
      await Promise.all(deletePromises)
      
      addNotification({
        type: 'success',
        title: 'Albums deleted',
        message: `Successfully deleted ${selectedAlbums.size} albums.`
      })
      
      setSelectedAlbums(new Set())
    } catch (error) {
      console.error('Failed to delete albums:', error)
      addNotification({
        type: 'error',
        title: 'Failed to delete albums',
        message: 'Some albums could not be deleted. Please try again.'
      })
    }
  }, [selectedAlbums, onDeleteAlbum, addNotification])

  const handleExportAlbum = useCallback(async (albumId: string) => {
    const album = albums.find(a => a.id === albumId)
    if (!album || !onExportAlbumToPDF) return

    try {
      addNotification({
        type: 'info',
        title: 'Export started',
        message: `Preparing PDF export for "${album.title}"...`
      })
      
      await onExportAlbumToPDF(albumId)
      
      addNotification({
        type: 'success',
        title: 'Export complete',
        message: `Album "${album.title}" has been exported to PDF successfully.`
      })
    } catch (error) {
      console.error('Failed to export album:', error)
      addNotification({
        type: 'error',
        title: 'Export failed',
        message: 'Failed to export the album to PDF. Please try again.'
      })
    }
  }, [albums, onExportAlbumToPDF, addNotification])

  const toggleFavoriteAlbum = useCallback((albumId: string) => {
    const favorites = JSON.parse(localStorage.getItem('favorite-albums') || '[]')
    const isFavorite = favorites.includes(albumId)
    
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== albumId)
      : [...favorites, albumId]
    
    localStorage.setItem('favorite-albums', JSON.stringify(newFavorites))
    
    addNotification({
      type: 'success',
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      message: `Album ${isFavorite ? 'removed from' : 'added to'} your favorites.`
    })
  }, [addNotification])

  const renderAlbumCard = (album: Album) => {
    const isSelected = selectedAlbums.has(album.id)
    const photoCount = album.photos?.length || 0
    const coverPhoto = album.photos?.[0]?.photo
    const favorites = JSON.parse(localStorage.getItem('favorite-albums') || '[]')
    const isFavorite = favorites.includes(album.id)

    return (
      <motion.div
        key={album.id}
        className={`
          bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200/40 shadow-lg 
          hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer
          ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50/80' : ''}
        `}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Album Cover */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
          {coverPhoto ? (
            <img
              src={coverPhoto.thumbnailUrl || coverPhoto.url}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Folder className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleExportAlbum(album.id)
                }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Photo Count Badge */}
          <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
            {photoCount} photos
          </div>

          {/* Favorite Star */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavoriteAlbum(album.id)
            }}
            className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
              isFavorite ? 'text-yellow-400' : 'text-white/60 hover:text-yellow-400'
            }`}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Visibility Badge */}
          <div className="absolute bottom-3 right-3">
            {album.isPublic ? (
              <Eye className="w-4 h-4 text-white/80" />
            ) : (
              <EyeOff className="w-4 h-4 text-white/80" />
            )}
          </div>
        </div>

        {/* Album Info */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{album.title}</h3>
              {album.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{album.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Created {new Date(album.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                setSelectedAlbums(prev => {
                  const newSet = new Set(prev)
                  if (e.target.checked) {
                    newSet.add(album.id)
                  } else {
                    newSet.delete(album.id)
                  }
                  return newSet
                })
              }}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{photoCount} photos</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteAlbum(album.id)
              }}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const filteredAlbums = getFilteredAndSortedAlbums()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title and Stats */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Album Manager</h2>
            <p className="text-gray-600">
              {filteredAlbums.length} of {albums.length} albums
              {selectedAlbums.size > 0 && ` • ${selectedAlbums.size} selected`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {selectedAlbums.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200"
              >
                Delete Selected ({selectedAlbums.size})
              </motion.button>
            )}
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Create Album
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-3 py-2 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Albums</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="favorites">Favorites</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="photos">Sort by Photos</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-white/80 rounded-xl border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Albums Grid/List */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
        {filteredAlbums.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredAlbums.map((album) => renderAlbumCard(album))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Folder className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Albums Yet</h3>
            <p className="text-gray-600 mb-6">Create your first album to organize your photos!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Create Your First Album
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Albums Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters to find albums.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterBy('all')
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Create Album Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Album</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Album Name *
                  </label>
                  <input
                    type="text"
                    value={albumForm.name}
                    onChange={(e) => setAlbumForm({ ...albumForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter album name..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe your album..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={albumForm.isPublic}
                    onChange={(e) => setAlbumForm({ ...albumForm, isPublic: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                    Make this album public
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlbum}
                  className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  Create Album
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AlbumManager