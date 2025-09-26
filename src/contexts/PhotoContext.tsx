import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNotifications } from './NotificationContext'
import { useAuth } from './AuthContext'
import { supabase } from '../services/supabase'

// Types
export interface Photo {
  id: string
  url: string
  thumbnail?: string
  filename: string
  timestamp: Date
  isCollage?: boolean
  albumIds?: string[]
  metadata?: {
    width?: number
    height?: number
    size?: number
  }
}

export interface Album {
  id: string
  title: string
  description?: string
  coverPhoto?: string
  photoIds: string[]
  createdAt: Date
  updatedAt: Date
}

// Context Interface
interface PhotoContextType {
  photos: Photo[]
  favoritePhotos: string[]
  albums: Album[]
  isLoading: boolean
  error: string | null
  
  // Photo operations
  addPhoto: (photo: Omit<Photo, 'id' | 'timestamp'>) => Promise<string>
  deletePhoto: (photoId: string) => Promise<void>
  clearAllPhotos: () => Promise<void>
  
  // Favorites operations
  toggleFavoritePhoto: (photoId: string) => Promise<void>
  isFavorite: (photoId: string) => boolean
  getFavoritePhotos: () => Photo[]
  
  // Albums operations
  createAlbum: (title: string, description?: string, photoIds?: string[]) => Promise<string>
  deleteAlbum: (albumId: string) => Promise<void>
  updateAlbum: (albumId: string, updates: Partial<Album>) => Promise<void>
  addPhotoToAlbum: (photoId: string, albumId: string) => Promise<void>
  removePhotoFromAlbum: (photoId: string, albumId: string) => Promise<void>
  getAlbumPhotos: (albumId: string) => Photo[]
  
  // Utility functions
  refreshData: () => Promise<void>
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined)

export const usePhoto = () => {
  const context = useContext(PhotoContext)
  if (context === undefined) {
    throw new Error('usePhoto must be used within a PhotoProvider')
  }
  return context
}

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [favoritePhotos, setFavoritePhotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  // Load data from Supabase when user is authenticated
  const loadData = useCallback(async () => {
    if (!user) {
      setPhotos([])
      setAlbums([])
      setFavoritePhotos([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Load photos
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (photosError) throw photosError

      const formattedPhotos: Photo[] = photosData.map(photo => ({
        id: photo.id,
        url: photo.url,
        thumbnail: photo.thumbnail_url,
        filename: photo.filename,
        timestamp: new Date(photo.created_at),
        isCollage: photo.is_collage,
        metadata: photo.metadata
      }))

      setPhotos(formattedPhotos)

      // Load albums with photo relationships
      const { data: albumsData, error: albumsError } = await supabase
        .from('albums')
        .select(`
          *,
          album_photos (
            photo_id,
            position
          )
        `)
        .order('created_at', { ascending: false })

      if (albumsError) throw albumsError

      const formattedAlbums: Album[] = albumsData.map(album => ({
        id: album.id,
        title: album.title,
        description: album.description,
        coverPhoto: album.cover_photo_url,
        photoIds: album.album_photos
          .sort((a: any, b: any) => a.position - b.position)
          .map((ap: any) => ap.photo_id),
        createdAt: new Date(album.created_at),
        updatedAt: new Date(album.updated_at)
      }))

      setAlbums(formattedAlbums)

      // Load favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('photo_id')

      if (favoritesError) throw favoritesError

      setFavoritePhotos(favoritesData.map(fav => fav.photo_id))

    } catch (error) {
      console.error('Error loading data:', error)
      const message = error instanceof Error ? error.message : 'Failed to load data'
      setError(message)
      addNotification({
        type: 'error',
        title: 'Failed to load data',
        message
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, addNotification])

  // Load data when user changes
  useEffect(() => {
    loadData()
  }, [loadData])

  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  // Upload photo to Supabase Storage and save metadata
  const addPhoto = useCallback(async (photoData: Omit<Photo, 'id' | 'timestamp'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    try {
      let uploadPath: string
      
      // If it's a data URL (from canvas/camera), convert to file and upload
      if (photoData.url.startsWith('data:')) {
        // Convert data URL to blob
        const response = await fetch(photoData.url)
        const blob = await response.blob()
        
        // Generate unique filename
        const fileExtension = blob.type.split('/')[1] || 'jpg'
        const fileName = `${user.id}/${Date.now()}-${photoData.filename || 'photo'}.${fileExtension}`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(uploadData.path)
          
        uploadPath = publicUrl
      } else {
        // Use provided URL (for external images)
        uploadPath = photoData.url
      }

      // Save photo metadata to database
      const { data, error } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          filename: photoData.filename,
          url: uploadPath,
          thumbnail_url: photoData.thumbnail || uploadPath,
          metadata: photoData.metadata || {},
          is_collage: photoData.isCollage || false
        })
        .select()
        .single()

      if (error) throw error

      const newPhoto: Photo = {
        id: data.id,
        url: uploadPath,
        thumbnail: photoData.thumbnail || uploadPath,
        filename: photoData.filename,
        timestamp: new Date(data.created_at),
        isCollage: photoData.isCollage,
        metadata: photoData.metadata
      }

      setPhotos(prev => [newPhoto, ...prev])
      
      addNotification({
        type: 'success',
        title: 'Photo added',
        message: 'Photo has been added to your gallery!'
      })
      
      return data.id
    } catch (error) {
      console.error('Error adding photo:', error)
      const message = error instanceof Error ? error.message : 'Failed to add photo'
      addNotification({
        type: 'error',
        title: 'Failed to add photo',
        message
      })
      throw error
    }
  }, [user, addNotification])

  const deletePhoto = useCallback(async (photoId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Find the photo to get its storage path
      const photo = photos.find(p => p.id === photoId)
      
      // Delete from database (cascades to album_photos and favorites)
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (deleteError) throw deleteError

      // Try to delete from storage if it's a Supabase-hosted file
      if (photo?.url.includes('supabase')) {
        const urlParts = photo.url.split('/')
        const fileName = urlParts.slice(-2).join('/')
        const { error: storageError } = await supabase.storage
          .from('photos')
          .remove([fileName])
        
        if (storageError) {
          console.warn('Failed to delete from storage:', storageError)
        }
      }

      // Update local state
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      setFavoritePhotos(prev => prev.filter(fId => fId !== photoId))
      setAlbums(prev => prev.map(album => ({
        ...album,
        photoIds: album.photoIds.filter(pId => pId !== photoId)
      })))

      addNotification({
        type: 'success',
        title: 'Photo deleted',
        message: 'Photo has been removed from your gallery.'
      })
    } catch (error) {
      console.error('Error deleting photo:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete photo'
      addNotification({
        type: 'error',
        title: 'Failed to delete photo',
        message
      })
      throw error
    }
  }, [photos, user, addNotification])

  const clearAllPhotos = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Delete all photos for the current user
      const { error: photosError } = await supabase
        .from('photos')
        .delete()
        .eq('user_id', user.id)

      if (photosError) throw photosError

      // Clear storage folder for user
      const { data: files, error: listError } = await supabase.storage
        .from('photos')
        .list(user.id)

      if (!listError && files) {
        const filePaths = files.map(file => `${user.id}/${file.name}`)
        if (filePaths.length > 0) {
          await supabase.storage
            .from('photos')
            .remove(filePaths)
        }
      }

      // Update local state
      setPhotos([])
      setFavoritePhotos([])
      setAlbums([])

      addNotification({
        type: 'success',
        title: 'Gallery cleared',
        message: 'All photos have been deleted from your gallery.'
      })
    } catch (error) {
      console.error('Error clearing photos:', error)
      const message = error instanceof Error ? error.message : 'Failed to clear gallery'
      addNotification({
        type: 'error',
        title: 'Failed to clear gallery',
        message
      })
      throw error
    }
  }, [user, addNotification])

  // Favorites management
  const toggleFavoritePhoto = useCallback(async (photoId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const isFavorited = favoritePhotos.includes(photoId)

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('photo_id', photoId)

        if (error) throw error

        setFavoritePhotos(prev => prev.filter(id => id !== photoId))
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ photo_id: photoId })

        if (error) throw error

        setFavoritePhotos(prev => [...prev, photoId])
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      const message = error instanceof Error ? error.message : 'Failed to update favorites'
      addNotification({
        type: 'error',
        title: 'Failed to update favorites',
        message
      })
      throw error
    }
  }, [favoritePhotos, user, addNotification])

  const isFavorite = useCallback((photoId: string): boolean => {
    return favoritePhotos.includes(photoId)
  }, [favoritePhotos])

  const getFavoritePhotos = useCallback((): Photo[] => {
    return photos.filter(photo => favoritePhotos.includes(photo.id))
  }, [photos, favoritePhotos])

  // Album operations
  const createAlbum = useCallback(async (title: string, description?: string, photoIds: string[] = []): Promise<string> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Create album
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert({
          title,
          description,
          cover_photo_url: photoIds.length > 0 ? photos.find(p => p.id === photoIds[0])?.url : null
        })
        .select()
        .single()

      if (albumError) throw albumError

      // Add photos to album if provided
      if (photoIds.length > 0) {
        const albumPhotos = photoIds.map((photoId, index) => ({
          album_id: albumData.id,
          photo_id: photoId,
          position: index
        }))

        const { error: photosError } = await supabase
          .from('album_photos')
          .insert(albumPhotos)

        if (photosError) throw photosError
      }

      const newAlbum: Album = {
        id: albumData.id,
        title: albumData.title,
        description: albumData.description,
        coverPhoto: albumData.cover_photo_url,
        photoIds,
        createdAt: new Date(albumData.created_at),
        updatedAt: new Date(albumData.updated_at)
      }

      setAlbums(prev => [newAlbum, ...prev])

      addNotification({
        type: 'success',
        title: 'Album created',
        message: `Album "${title}" has been created successfully!`
      })

      return albumData.id
    } catch (error) {
      console.error('Error creating album:', error)
      const message = error instanceof Error ? error.message : 'Failed to create album'
      addNotification({
        type: 'error',
        title: 'Failed to create album',
        message
      })
      throw error
    }
  }, [user, photos, addNotification])

  const deleteAlbum = useCallback(async (albumId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Delete album (cascades to album_photos)
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId)

      if (error) throw error

      setAlbums(prev => prev.filter(album => album.id !== albumId))

      addNotification({
        type: 'success',
        title: 'Album deleted',
        message: 'Album has been deleted successfully.'
      })
    } catch (error) {
      console.error('Error deleting album:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete album'
      addNotification({
        type: 'error',
        title: 'Failed to delete album',
        message
      })
      throw error
    }
  }, [user, addNotification])

  const updateAlbum = useCallback(async (albumId: string, updates: Partial<Album>): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const updateData: any = {}
      if (updates.title) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.coverPhoto !== undefined) updateData.cover_photo_url = updates.coverPhoto

      const { error } = await supabase
        .from('albums')
        .update(updateData)
        .eq('id', albumId)

      if (error) throw error

      setAlbums(prev => prev.map(album => 
        album.id === albumId 
          ? { ...album, ...updates, updatedAt: new Date() }
          : album
      ))

      addNotification({
        type: 'success',
        title: 'Album updated',
        message: 'Album has been updated successfully.'
      })
    } catch (error) {
      console.error('Error updating album:', error)
      const message = error instanceof Error ? error.message : 'Failed to update album'
      addNotification({
        type: 'error',
        title: 'Failed to update album',
        message
      })
      throw error
    }
  }, [user, addNotification])

  const addPhotoToAlbum = useCallback(async (photoId: string, albumId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Get current max position
      const { data: positions, error: positionError } = await supabase
        .from('album_photos')
        .select('position')
        .eq('album_id', albumId)
        .order('position', { ascending: false })
        .limit(1)

      if (positionError) throw positionError

      const nextPosition = (positions[0]?.position ?? -1) + 1

      // Add photo to album
      const { error } = await supabase
        .from('album_photos')
        .insert({
          album_id: albumId,
          photo_id: photoId,
          position: nextPosition
        })

      if (error) throw error

      setAlbums(prev => prev.map(album => 
        album.id === albumId 
          ? { ...album, photoIds: [...album.photoIds, photoId], updatedAt: new Date() }
          : album
      ))

      addNotification({
        type: 'success',
        title: 'Photo added',
        message: 'Photo has been added to the album.'
      })
    } catch (error) {
      console.error('Error adding photo to album:', error)
      const message = error instanceof Error ? error.message : 'Failed to add photo to album'
      addNotification({
        type: 'error',
        title: 'Failed to add photo',
        message
      })
      throw error
    }
  }, [user, addNotification])

  const removePhotoFromAlbum = useCallback(async (photoId: string, albumId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Remove photo from album
      const { error } = await supabase
        .from('album_photos')
        .delete()
        .eq('album_id', albumId)
        .eq('photo_id', photoId)

      if (error) throw error

      setAlbums(prev => prev.map(album => 
        album.id === albumId 
          ? { 
              ...album, 
              photoIds: album.photoIds.filter(id => id !== photoId),
              updatedAt: new Date() 
            }
          : album
      ))

      addNotification({
        type: 'success',
        title: 'Photo removed',
        message: 'Photo has been removed from the album.'
      })
    } catch (error) {
      console.error('Error removing photo from album:', error)
      const message = error instanceof Error ? error.message : 'Failed to remove photo from album'
      addNotification({
        type: 'error',
        title: 'Failed to remove photo',
        message
      })
      throw error
    }
  }, [user, addNotification])

  const getAlbumPhotos = useCallback((albumId: string): Photo[] => {
    const album = albums.find(a => a.id === albumId)
    if (!album) return []
    
    return album.photoIds
      .map(id => photos.find(photo => photo.id === id))
      .filter((photo): photo is Photo => photo !== undefined)
  }, [albums, photos])

  const contextValue: PhotoContextType = {
    photos,
    favoritePhotos,
    albums,
    isLoading,
    error,
    addPhoto,
    deletePhoto,
    clearAllPhotos,
    toggleFavoritePhoto,
    isFavorite,
    getFavoritePhotos,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    addPhotoToAlbum,
    removePhotoFromAlbum,
    getAlbumPhotos,
    refreshData
  }

  return (
    <PhotoContext.Provider value={contextValue}>
      {children}
    </PhotoContext.Provider>
  )
}