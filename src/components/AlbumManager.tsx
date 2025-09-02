import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Plus, X, Download, Eye, Edit2, Trash2 } from './icons'
import PhotoGrid from './PhotoGrid'
import type { Photo, Album } from '../types'

interface AlbumManagerProps {
  photos: Photo[]
  onAlbumCreate?: (album: Album) => void
  onAlbumUpdate?: (album: Album) => void
  onAlbumDelete?: (albumId: string) => void
  onExportAlbumPDF?: (album: Album) => void
}

const AlbumManager: React.FC<AlbumManagerProps> = ({
  photos,
  onAlbumCreate,
  onAlbumUpdate,
  onAlbumDelete,
  onExportAlbumPDF
}) => {
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPhotoSelector, setShowPhotoSelector] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  // Form states
  const [albumName, setAlbumName] = useState('')
  const [albumDescription, setAlbumDescription] = useState('')

  useEffect(() => {
    // Load albums from localStorage
    const savedAlbums = localStorage.getItem('photobooth-albums')
    if (savedAlbums) {
      setAlbums(JSON.parse(savedAlbums))
    }
  }, [])

  useEffect(() => {
    // Save albums to localStorage
    localStorage.setItem('photobooth-albums', JSON.stringify(albums))
  }, [albums])

  const createAlbum = () => {
    if (!albumName.trim()) return

    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      name: albumName.trim(),
      description: albumDescription.trim(),
      photoIds: Array.from(selectedPhotos),
      coverPhotoId: Array.from(selectedPhotos)[0] || undefined,
      createdAt: new Date()
    }

    setAlbums(prev => [...prev, newAlbum])
    onAlbumCreate?.(newAlbum)
    resetForm()
  }

  const updateAlbum = () => {
    if (!editingAlbum || !albumName.trim()) return

    const updatedAlbum: Album = {
      ...editingAlbum,
      name: albumName.trim(),
      description: albumDescription.trim(),
      photoIds: Array.from(selectedPhotos),
      coverPhotoId: Array.from(selectedPhotos)[0] || editingAlbum.coverPhotoId
    }

    setAlbums(prev => prev.map(album => 
      album.id === editingAlbum.id ? updatedAlbum : album
    ))
    onAlbumUpdate?.(updatedAlbum)
    resetForm()
  }

  const deleteAlbum = (albumId: string) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      setAlbums(prev => prev.filter(album => album.id !== albumId))
      onAlbumDelete?.(albumId)
      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(null)
      }
    }
  }

  const resetForm = () => {
    setAlbumName('')
    setAlbumDescription('')
    setSelectedPhotos(new Set())
    setShowCreateModal(false)
    setEditingAlbum(null)
    setShowPhotoSelector(false)
  }

  const openEditModal = (album: Album) => {
    setEditingAlbum(album)
    setAlbumName(album.name)
    setAlbumDescription(album.description || '')
    setSelectedPhotos(new Set(album.photoIds))
    setShowCreateModal(true)
  }

  const getAlbumPhotos = (album: Album) => {
    return photos.filter(photo => album.photoIds.includes(photo.id))
  }

  const getCoverPhoto = (album: Album) => {
    if (album.coverPhotoId) {
      return photos.find(photo => photo.id === album.coverPhotoId)
    }
    return getAlbumPhotos(album)[0]
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

  if (selectedAlbum) {
    const albumPhotos = getAlbumPhotos(selectedAlbum)
    
    return (
      <div className="space-y-6">
        {/* Album Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="text-purple-600 hover:text-purple-700 mb-2 flex items-center"
              >
                ← Back to Albums
              </button>
              <h2 className="text-2xl font-bold text-gray-800">{selectedAlbum.name}</h2>
              {selectedAlbum.description && (
                <p className="text-gray-600 mt-1">{selectedAlbum.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {albumPhotos.length} photos • Created {new Date(selectedAlbum.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openEditModal(selectedAlbum)}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onExportAlbumPDF?.(selectedAlbum)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </motion.button>
            </div>
          </div>
        </div>

        {/* Album Photos */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
          <PhotoGrid
            photos={albumPhotos}
            onPhotoDelete={(photoId) => {
              const updatedAlbum = {
                ...selectedAlbum,
                photoIds: selectedAlbum.photoIds.filter(id => id !== photoId)
              }
              setAlbums(prev => prev.map(album => 
                album.id === selectedAlbum.id ? updatedAlbum : album
              ))
              setSelectedAlbum(updatedAlbum)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Albums Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <FolderOpen className="w-5 h-5 mr-2 text-purple-600" />
            Albums ({albums.length})
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Album
          </motion.button>
        </div>
      </div>

      {/* Albums Grid */}
      {albums.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <FolderOpen className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No albums yet</h3>
          <p className="text-gray-500 max-w-md mb-6">
            Create your first album to organize your photos into collections.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Album
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const coverPhoto = getCoverPhoto(album)
            const albumPhotos = getAlbumPhotos(album)
            
            return (
              <motion.div
                key={album.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-200/40 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedAlbum(album)}
              >
                <div className="relative aspect-square">
                  {coverPhoto ? (
                    <img
                      src={coverPhoto.thumbnail || coverPhoto.url}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-purple-400" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-white font-semibold text-lg truncate">{album.name}</h4>
                    <p className="text-white/80 text-sm">{albumPhotos.length} photos</p>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAlbum(album)
                        }}
                        className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(album)
                        }}
                        className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAlbum(album.id)
                        }}
                        className="bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-full shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {album.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{album.description}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Created {new Date(album.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Album Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-700">
                  {editingAlbum ? 'Edit Album' : 'Create New Album'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Album Name *
                  </label>
                  <input
                    type="text"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    placeholder="Enter album name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    placeholder="Enter album description (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Photos ({selectedPhotos.size} selected)
                    </label>
                    <button
                      onClick={() => setShowPhotoSelector(true)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Select Photos
                    </button>
                  </div>
                  
                  {selectedPhotos.size > 0 && (
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {Array.from(selectedPhotos).slice(0, 8).map(photoId => {
                        const photo = photos.find(p => p.id === photoId)
                        return photo ? (
                          <div key={photo.id} className="relative aspect-square">
                            <img
                              src={photo.thumbnail || photo.url}
                              alt={photo.filename}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        ) : null
                      })}
                      {selectedPhotos.size > 8 && (
                        <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">+{selectedPhotos.size - 8}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAlbum ? updateAlbum : createAlbum}
                  disabled={!albumName.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {editingAlbum ? 'Update Album' : 'Create Album'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  Select Photos for Album ({selectedPhotos.size} selected)
                </h3>
                <button
                  onClick={() => setShowPhotoSelector(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <PhotoGrid
                photos={photos}
                selectionMode={true}
                selectedPhotos={selectedPhotos}
                onToggleSelection={handlePhotoToggle}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AlbumManager
