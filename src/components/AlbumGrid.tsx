import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Trash2, Calendar, ImageIcon, X } from '../components/icons'
import { usePhotos } from '../contexts/PhotoContext'
import { useNotifications } from '../contexts/NotificationContext'
import type { Album, Photo } from '../contexts/PhotoContext'

interface AlbumGridProps {
  albums: Album[]
  onAlbumSelect?: (album: Album) => void
  onAlbumDelete?: (albumId: string) => void
  showActions?: boolean
}

interface AlbumViewerProps {
  album: Album
  photos: Photo[]
  isOpen: boolean
  onClose: () => void
}

const AlbumViewer: React.FC<AlbumViewerProps> = ({ album, photos, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{album.title}</h2>
              {album.description && (
                <p className="text-gray-600 mt-1">{album.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  {photos.length} photos
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(album.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Photos Grid */}
          <div className="p-6 overflow-auto max-h-[70vh]">
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-square bg-gray-200 rounded-xl overflow-hidden cursor-pointer"
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No photos in this album</h3>
                <p className="text-gray-500">This album is empty.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums,
  onAlbumSelect,
  onAlbumDelete,
  showActions = true
}) => {
  const { photos, deleteAlbum, isLoading } = usePhotos()
  const { addNotification } = useNotifications()
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handleAlbumClick = useCallback((album: Album) => {
    setSelectedAlbum(album)
    setIsViewerOpen(true)
    if (onAlbumSelect) {
      onAlbumSelect(album)
    }
  }, [onAlbumSelect])

  const handleViewerClose = useCallback(() => {
    setIsViewerOpen(false)
    setSelectedAlbum(null)
  }, [])

  const handleDeleteAlbum = useCallback(async (albumId: string, albumTitle: string) => {
    if (!confirm(`Are you sure you want to delete the album "${albumTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteAlbum(albumId)
      addNotification({
        type: 'success',
        title: 'Album deleted',
        message: `Album "${albumTitle}" has been deleted successfully.`
      })
      
      if (onAlbumDelete) {
        onAlbumDelete(albumId)
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to delete album',
        message: 'There was an error deleting the album. Please try again.'
      })
    }
  }, [deleteAlbum, addNotification, onAlbumDelete])

  const getAlbumPhotos = useCallback((album: Album): Photo[] => {
    return photos.filter((photo: Photo) => album.photoIds.includes(photo.id))
  }, [photos])

  const getAlbumCoverPhoto = useCallback((album: Album): Photo | null => {
    const albumPhotos = getAlbumPhotos(album)
    return albumPhotos.length > 0 ? albumPhotos[0] : null
  }, [getAlbumPhotos])

  if (albums.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Albums Yet</h3>
        <p className="text-gray-600">Create your first album to organize your photos.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => {
          const albumPhotos = getAlbumPhotos(album)
          const coverPhoto = getAlbumCoverPhoto(album)
          
          return (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => handleAlbumClick(album)}
            >
              {/* Cover Photo */}
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                {coverPhoto ? (
                  <img
                    src={coverPhoto.thumbnail || coverPhoto.url}
                    alt={`${album.title} cover`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-purple-300" />
                  </div>
                )}

                {/* Photo count overlay */}
                <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
                  {albumPhotos.length} photo{albumPhotos.length !== 1 ? 's' : ''}
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAlbumClick(album)
                      }}
                      className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/70 transition-colors backdrop-blur-sm"
                      title="View album"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteAlbum(album.id, album.title)
                      }}
                      disabled={isLoading}
                      className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600/80 transition-colors backdrop-blur-sm disabled:opacity-50"
                      title="Delete album"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Album info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {album.title}
                </h3>
                
                {album.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {album.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(album.createdAt).toLocaleDateString()}
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {albumPhotos.length}
                  </span>
                </div>
              </div>

              {/* Selection indicator for multi-select mode */}
              <motion.div
                className="absolute inset-0 border-4 border-purple-500 rounded-2xl opacity-0 pointer-events-none"
                animate={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Album Viewer Modal */}
      {selectedAlbum && (
        <AlbumViewer
          album={selectedAlbum}
          photos={getAlbumPhotos(selectedAlbum)}
          isOpen={isViewerOpen}
          onClose={handleViewerClose}
        />
      )}
    </>
  )
}

export default AlbumGrid