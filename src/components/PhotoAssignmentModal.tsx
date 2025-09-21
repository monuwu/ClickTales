import React, { useState, useEffect, useCallback } from 'react';
import type { PhotoAssignmentModalProps, Photo } from '../types/album';
import { albumService } from '../services/albumService';

const PhotoAssignmentModal: React.FC<PhotoAssignmentModalProps> = ({
  isOpen,
  onClose,
  album,
  onPhotosAssigned
}) => {
  const [availablePhotos, setAvailablePhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [currentAlbumPhotos, setCurrentAlbumPhotos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load available photos when modal opens
  const loadPhotos = useCallback(async (resetList = false) => {
    if (!isOpen || loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await albumService.getAvailablePhotos({
        page: resetList ? 1 : page,
        limit: 20,
        search: searchQuery || undefined,
        excludeAlbumId: album.id
      });

      const newPhotos = response.data.photos;
      
      if (resetList) {
        setAvailablePhotos(newPhotos);
        setPage(1);
      } else {
        setAvailablePhotos(prev => [...prev, ...newPhotos]);
      }
      
      setHasMore(response.data.pagination.hasNext);
      setPage(prev => resetList ? 2 : prev + 1);

    } catch (err) {
      console.error('Failed to load photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [isOpen, album.id, page, searchQuery, loading]);

  // Initialize modal state
  useEffect(() => {
    if (isOpen) {
      // Set currently assigned photos
      const currentPhotos = new Set(
        album.photos?.map(ap => ap.photoId) || []
      );
      setCurrentAlbumPhotos(currentPhotos);
      setSelectedPhotos(new Set(currentPhotos));
      
      // Reset state
      setAvailablePhotos([]);
      setPage(1);
      setSearchQuery('');
      setError(null);
      
      // Load initial photos
      loadPhotos(true);
    }
  }, [isOpen, album.photos]);

  // Handle search with debouncing
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      setAvailablePhotos([]);
      setPage(1);
      loadPhotos(true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen]);

  const handlePhotoToggle = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const currentPhotoIds = Array.from(currentAlbumPhotos);
      const selectedPhotoIds = Array.from(selectedPhotos);

      // Find photos to add and remove
      const photosToAdd = selectedPhotoIds.filter(id => !currentAlbumPhotos.has(id));
      const photosToRemove = currentPhotoIds.filter(id => !selectedPhotos.has(id));

      // Add photos
      if (photosToAdd.length > 0) {
        await albumService.addPhotosToAlbum(album.id, photosToAdd);
      }

      // Remove photos
      if (photosToRemove.length > 0) {
        await albumService.removePhotosFromAlbum(album.id, photosToRemove);
      }

      // Get updated album data
      const updatedAlbumResponse = await albumService.getAlbumById(album.id);
      onPhotosAssigned(updatedAlbumResponse.data);
      onClose();

    } catch (err) {
      console.error('Failed to update photo assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to update photo assignments');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAvailablePhotos([]);
    setSelectedPhotos(new Set());
    setCurrentAlbumPhotos(new Set());
    setSearchQuery('');
    setError(null);
    setPage(1);
    onClose();
  };

  const loadMorePhotos = () => {
    if (!loading && hasMore) {
      loadPhotos(false);
    }
  };

  if (!isOpen) return null;

  const selectedCount = selectedPhotos.size;
  const changesCount = Math.abs(selectedCount - currentAlbumPhotos.size);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              📸 Manage Photos for "{album.title}"
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select photos to add or remove from this album
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold transition-colors disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photos by filename..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={submitting}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Selected Count */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">
              {selectedCount} photos selected
            </span>
            {changesCount > 0 && (
              <span className="text-blue-600 dark:text-blue-400 ml-2">
                ({changesCount} changes)
              </span>
            )}
          </p>
        </div>

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {availablePhotos.length === 0 && !loading ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📷</span>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No photos found matching your search' : 'No photos available to assign'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {availablePhotos.map((photo) => {
                  const isSelected = selectedPhotos.has(photo.id);
                  const wasOriginallyAssigned = currentAlbumPhotos.has(photo.id);
                  
                  return (
                    <div
                      key={photo.id}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'ring-4 ring-blue-500 ring-opacity-75'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      onClick={() => handlePhotoToggle(photo.id)}
                    >
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Selection Overlay */}
                      <div className={`absolute inset-0 transition-opacity ${
                        isSelected ? 'bg-blue-500 bg-opacity-20' : 'bg-black bg-opacity-0 hover:bg-opacity-10'
                      }`}>
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 right-2">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'bg-white border-gray-300'
                          }`}>
                            {isSelected && <span className="text-xs">✓</span>}
                          </div>
                        </div>

                        {/* Status Badge */}
                        {wasOriginallyAssigned && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-1.5 py-0.5 rounded text-xs">
                            ✓ In Album
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadMorePhotos}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 inline-block mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More Photos'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting || changesCount === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <span>💾</span>
            )}
            {submitting ? 'Saving...' : `Save Changes${changesCount > 0 ? ` (${changesCount})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoAssignmentModal;