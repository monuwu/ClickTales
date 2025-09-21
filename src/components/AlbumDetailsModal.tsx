import React, { useState } from 'react';
import type { AlbumDetailsModalProps } from '../types/album';

const AlbumDetailsModal: React.FC<AlbumDetailsModalProps> = ({
  isOpen,
  onClose,
  album,
  onEdit,
  onDelete,
  onAssignPhotos
}) => {
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleImageError = (photoId: string) => {
    setImageLoadErrors(prev => new Set(prev).add(photoId));
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${album.title}"? This action cannot be undone.`)) {
      onDelete(album.id);
      onClose();
    }
  };

  const photoCount = album._count?.photos || album.photos?.length || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                📁 {album.title}
              </h2>
              {album.isPublic && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium rounded">
                  🌐 Public
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {photoCount} {photoCount === 1 ? 'photo' : 'photos'} • Created {formatDate(album.createdAt)}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold transition-colors ml-4"
          >
            ×
          </button>
        </div>

        {/* Description */}
        {album.description && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300">
              {album.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onEdit(album)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg font-medium transition-colors"
          >
            <span>✏️</span>
            Edit Album
          </button>

          <button
            onClick={() => onAssignPhotos(album)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg font-medium transition-colors"
          >
            <span>📸</span>
            Manage Photos
          </button>

          <div className="flex-1"></div>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-medium transition-colors"
          >
            <span>🗑️</span>
            Delete Album
          </button>
        </div>

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {photoCount === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📷</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No photos in this album yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start adding photos to build your collection
              </p>
              <button
                onClick={() => onAssignPhotos(album)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>➕</span>
                Add Photos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Photos ({photoCount})
                </h3>
                <button
                  onClick={() => onAssignPhotos(album)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  ➕ Add More
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {album.photos?.map((albumPhoto, index) => {
                  const photo = albumPhoto.photo;
                  if (!photo) return null;

                  const hasError = imageLoadErrors.has(photo.id);

                  return (
                    <div
                      key={`${albumPhoto.id}-${index}`}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group"
                    >
                      {hasError ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-gray-400 dark:text-gray-500">
                            <span className="text-2xl block mb-1">🖼️</span>
                            <p className="text-xs">Failed to load</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.originalName}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                          onError={() => handleImageError(photo.id)}
                        />
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3">
                          <p className="text-white text-xs truncate" title={photo.originalName}>
                            {photo.originalName}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {formatDate(photo.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Cover Photo Badge */}
                      {album.coverPhotoId === photo.id && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          ⭐ Cover
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {formatDate(album.updatedAt)}
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailsModal;