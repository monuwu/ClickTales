import React, { useState, useEffect, useCallback } from 'react';
import type { Album, CreateAlbumData } from '../types/album';
import { albumService } from '../services/albumService';
import { 
  AlbumCard, 
  AlbumFormModal, 
  AlbumDetailsModal, 
  PhotoAssignmentModal 
} from '../components';

const AlbumsPage: React.FC = () => {
  // State
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPhotoAssignModal, setShowPhotoAssignModal] = useState(false);
  
  // Selected items
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [processingAlbumId, setProcessingAlbumId] = useState<string | null>(null);

  // Load albums function
  const loadAlbums = useCallback(async (page = 1, reset = false) => {
    try {
      setLoading(true);
      if (reset) {
        setError(null);
      }

      const response = await albumService.getAlbums({
        page,
        limit: 12,
        search: searchQuery || undefined,
        isPublic: showPublicOnly ? true : undefined
      });

      const newAlbums = response.data.albums;
      
      if (reset || page === 1) {
        setAlbums(newAlbums);
      } else {
        setAlbums(prev => [...prev, ...newAlbums]);
      }

      setCurrentPage(response.data.pagination.currentPage);
      setHasNext(response.data.pagination.hasNext);

    } catch (err) {
      console.error('Failed to load albums:', err);
      setError(err instanceof Error ? err.message : 'Failed to load albums');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showPublicOnly]);

  // Load albums on mount and when filters change
  useEffect(() => {
    loadAlbums(1, true);
  }, [loadAlbums]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '' || showPublicOnly) {
        loadAlbums(1, true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, showPublicOnly, loadAlbums]);

  // Album operations
  const handleCreateAlbum = async (albumData: CreateAlbumData) => {
    try {
      setError(null);
      const response = await albumService.createAlbum(albumData);
      const newAlbum = response.data;
      setAlbums(prev => [newAlbum, ...prev]);
    } catch (err) {
      console.error('Failed to create album:', err);
      throw err;
    }
  };

  const handleUpdateAlbum = async (albumData: CreateAlbumData) => {
    if (!selectedAlbum) return;

    try {
      setError(null);
      const response = await albumService.updateAlbum(selectedAlbum.id, albumData);
      const updatedAlbum = response.data;

      setAlbums(prev => prev.map(album => 
        album.id === updatedAlbum.id ? updatedAlbum : album
      ));

      setSelectedAlbum(updatedAlbum);
    } catch (err) {
      console.error('Failed to update album:', err);
      throw err;
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      setProcessingAlbumId(albumId);
      setError(null);

      await albumService.deleteAlbum(albumId);
      setAlbums(prev => prev.filter(album => album.id !== albumId));

      // Close modals if the deleted album was selected
      if (selectedAlbum?.id === albumId) {
        setShowDetailsModal(false);
        setShowEditModal(false);
        setShowPhotoAssignModal(false);
        setSelectedAlbum(null);
      }

    } catch (err) {
      console.error('Failed to delete album:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete album');
    } finally {
      setProcessingAlbumId(null);
    }
  };

  const handleViewAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setShowDetailsModal(true);
  };

  const handleEditAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleAssignPhotos = (album: Album) => {
    setSelectedAlbum(album);
    setShowPhotoAssignModal(true);
    setShowDetailsModal(false);
  };

  const handlePhotosAssigned = (updatedAlbum: Album) => {
    setAlbums(prev => prev.map(album => 
      album.id === updatedAlbum.id ? updatedAlbum : album
    ));
    setSelectedAlbum(updatedAlbum);
    setShowDetailsModal(true);
  };

  const loadMoreAlbums = () => {
    if (!loading && hasNext) {
      loadAlbums(currentPage + 1, false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📁 Albums
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Organize and manage your photo collections
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <span>➕</span>
            Create Album
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search albums by title..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showPublicOnly}
                onChange={(e) => setShowPublicOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              🌐 Public only
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Albums Content */}
        {loading && albums.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading albums...</p>
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📁</span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No albums found' : 'No albums yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first album to start organizing your photos'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>➕</span>
                Create Your First Album
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onEdit={handleEditAlbum}
                  onDelete={handleDeleteAlbum}
                  onView={handleViewAlbum}
                  isLoading={processingAlbumId === album.id}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasNext && (
              <div className="text-center">
                <button
                  onClick={loadMoreAlbums}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 inline-block mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Albums'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AlbumFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAlbum}
        isLoading={false}
      />

      <AlbumFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateAlbum}
        album={selectedAlbum || undefined}
        isLoading={false}
      />

      {selectedAlbum && (
        <>
          <AlbumDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            album={selectedAlbum}
            onEdit={handleEditAlbum}
            onDelete={handleDeleteAlbum}
            onAssignPhotos={handleAssignPhotos}
          />

          <PhotoAssignmentModal
            isOpen={showPhotoAssignModal}
            onClose={() => setShowPhotoAssignModal(false)}
            album={selectedAlbum}
            onPhotosAssigned={handlePhotosAssigned}
          />
        </>
      )}
    </div>
  );
};

export default AlbumsPage;