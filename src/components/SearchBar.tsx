import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Heart, ImageIcon, ChevronDown } from '../components/icons'
import type { Photo, Album } from '../types'

export interface SearchFilters {
  query: string
  dateRange: {
    start?: Date
    end?: Date
  }
  favorites: boolean
  albums: string[]
  hasFilter: boolean
}

interface SearchBarProps {
  photos: Photo[]
  albums: Album[]
  onSearchResults: (results: Photo[]) => void
  className?: string
}

interface FilterDropdownProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  albums: Album[]
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ filters, onFiltersChange, albums }) => {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearFilters = () => {
    onFiltersChange({
      query: filters.query,
      dateRange: {},
      favorites: false,
      albums: [],
      hasFilter: false
    })
  }

  const hasActiveFilters = filters.favorites || filters.albums.length > 0 || 
    filters.dateRange.start || filters.dateRange.end || filters.hasFilter

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
          hasActiveFilters
            ? 'bg-purple-500 text-white border-purple-500'
            : 'bg-white/70 text-gray-700 border-gray-300 hover:bg-white/90'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters</span>
        {hasActiveFilters && (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50"
          >
            {/* Quick Filters */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Filters</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilters({ favorites: !filters.favorites })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.favorites
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Favorites
                </button>
                
                <button
                  onClick={() => updateFilters({ hasFilter: !filters.hasFilter })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.hasFilter
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  With Filters
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Date Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value ? new Date(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value ? new Date(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Albums */}
            {albums.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Albums</h3>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {albums.map((album) => (
                    <label key={album.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.albums.includes(album.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilters({ albums: [...filters.albums, album.id] })
                          } else {
                            updateFilters({ albums: filters.albums.filter(id => id !== album.id) })
                          }
                        }}
                        className="w-3 h-3 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{album.title}</span>
                      <span className="text-xs text-gray-500">({album.photos?.length || 0})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

const SearchBar: React.FC<SearchBarProps> = ({ photos, albums, onSearchResults, className = '' }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: {},
    favorites: false,
    albums: [],
    hasFilter: false
  })

  // Get favorites from localStorage or context
  const getFavorites = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]')
    } catch {
      return []
    }
  }

  const searchResults = useMemo(() => {
    let filteredPhotos = [...photos]
    const favorites = getFavorites()

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase()
      filteredPhotos = filteredPhotos.filter(photo =>
        photo.filename.toLowerCase().includes(query) ||
        photo.filter?.toLowerCase().includes(query)
      )
    }

    // Favorites filter
    if (filters.favorites) {
      filteredPhotos = filteredPhotos.filter(photo => favorites.includes(photo.id))
    }

    // Filter photos with effects
    if (filters.hasFilter) {
      filteredPhotos = filteredPhotos.filter(photo => photo.filter && photo.filter !== 'none')
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filteredPhotos = filteredPhotos.filter(photo => {
        const photoDate = new Date(photo.timestamp)
        const start = filters.dateRange.start
        const end = filters.dateRange.end

        if (start && photoDate < start) return false
        if (end && photoDate > end) return false
        return true
      })
    }

    // Album filter
    if (filters.albums.length > 0) {
      const albumPhotoIds = new Set(
        filters.albums.flatMap(albumId => {
          const album = albums.find(a => a.id === albumId)
          return album?.photos?.map(p => p.photoId || p.photo?.id).filter(Boolean) || []
        })
      )
      filteredPhotos = filteredPhotos.filter(photo => albumPhotoIds.has(photo.id))
    }

    return filteredPhotos
  }, [photos, albums, filters])

  // Update search results whenever they change
  React.useEffect(() => {
    onSearchResults(searchResults)
  }, [searchResults, onSearchResults])

  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query }))
  }

  const clearSearch = () => {
    setFilters({
      query: '',
      dateRange: {},
      favorites: false,
      albums: [],
      hasFilter: false
    })
  }

  const hasActiveSearch = filters.query || filters.favorites || filters.albums.length > 0 ||
    filters.dateRange.start || filters.dateRange.end || filters.hasFilter

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search photos by name or filter..."
            className="w-full pl-10 pr-10 py-3 bg-white/70 backdrop-blur-sm border border-purple-200/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-500"
          />
          {filters.query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdown */}
      <FilterDropdown
        filters={filters}
        onFiltersChange={setFilters}
        albums={albums}
      />

      {/* Clear All Button */}
      {hasActiveSearch && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearSearch}
          className="px-3 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
        >
          Clear All
        </motion.button>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600 whitespace-nowrap">
        {searchResults.length} of {photos.length} photos
      </div>
    </div>
  )
}

export default SearchBar