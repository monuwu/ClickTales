import React from 'react';
import type { AlbumCardProps } from '../types/album';

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCoverImage = () => {
    // If there's a cover photo, use it, otherwise use first photo if available
    if (album.photos && album.photos.length > 0) {
      const coverPhoto = album.coverPhotoId 
        ? album.photos.find(p => p.photo?.id === album.coverPhotoId)?.photo
        : album.photos[0]?.photo;
      
      return coverPhoto?.thumbnailUrl || coverPhoto?.url;
    }
    return null;
  };

  const photoCount = album._count?.photos || album.photos?.length || 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg ${isLoading ? 'opacity-50' : ''}`}>
      {/* Album Cover */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => onView(album)}>
        {getCoverImage() ? (
          <img
            src={getCoverImage()!}
            alt={album.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <span className="text-4xl mb-2 block">📁</span>
              <p className="text-sm">No photos</p>
            </div>
          </div>
        )}
        
        {/* Photo Count Badge */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
          📸 {photoCount}
        </div>

        {/* Public Badge */}
        {album.isPublic && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            🌐 Public
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
            onClick={() => onView(album)}
            title={album.title}
          >
            {album.title}
          </h3>
        </div>

        {album.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2" title={album.description}>
            {album.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span>📅 {formatDate(album.createdAt)}</span>
          <span>🔄 {formatDate(album.updatedAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onView(album)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
          >
            <span>👁️</span>
            View
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(album)}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors disabled:opacity-50"
            >
              <span>✏️</span>
              Edit
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${album.title}"? This action cannot be undone.`)) {
                  onDelete(album.id);
                }
              }}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50"
            >
              <span>🗑️</span>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default AlbumCard;