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
  clearAllLocalStorage: () => void
  removeAlbumByName: (albumName: string) => void
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined)

export const usePhotos = () => {
  const context = useContext(PhotoContext)
  if (context === undefined) {
    throw new Error('usePhotos must be used within a PhotoProvider')
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

  // Load data from Supabase when user is authenticated, or local data when not
  const loadData = useCallback(async () => {
    if (!user) {
      // Load local photos from localStorage
      try {
        const stored = localStorage.getItem('clicktales_photos')
        let localPhotos: any[] = []
        
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            localPhotos = Array.isArray(parsed) ? parsed : []
          } catch (parseError) {
            console.warn('Invalid localStorage photo data, resetting:', parseError)
            localPhotos = []
            localStorage.setItem('clicktales_photos', '[]')
          }
        }
        
        const formattedPhotos: Photo[] = localPhotos.map((photo: any) => ({
          ...photo,
          timestamp: new Date(photo.timestamp)
        }))
        setPhotos(formattedPhotos)
      } catch (error) {
        console.warn('Error loading local photos:', error)
        setPhotos([])
      }
      
      // Load guest albums metadata
      try {
        const guestAlbums = JSON.parse(localStorage.getItem('guestAlbums') || '[]')
        const formattedAlbums: Album[] = guestAlbums.map((album: any) => ({
          ...album,
          createdAt: new Date(album.createdAt),
          updatedAt: new Date(album.updatedAt)
        }))
        setAlbums(formattedAlbums)
      } catch {
        setAlbums([])
      }
      
      // Load guest favorites
      try {
        const guestFavorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
        setFavoritePhotos(guestFavorites)
      } catch {
        setFavoritePhotos([])
      }
      
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Load photos
      if (!supabase) {
        console.warn('Supabase not available, skipping photo fetch')
        return
      }
      
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (photosError) throw photosError

      const formattedPhotos: Photo[] = photosData.map((photo: any) => ({
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
      if (!supabase) {
        console.warn('Supabase not available, skipping albums fetch')
        return
      }
      
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

      const formattedAlbums: Album[] = albumsData.map((album: any) => ({
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
      if (!supabase) {
        console.warn('Supabase not available, skipping favorites fetch')
        return
      }
      
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('photo_id')

      if (favoritesError) throw favoritesError

      setFavoritePhotos(favoritesData.map((fav: any) => fav.photo_id))

    } catch (error) {
      console.error('Error loading data:', error)
      const message = error instanceof Error ? error.message : 'Failed to load data'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load data when user changes
  useEffect(() => {
    loadData()
  }, [loadData])

  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  // Upload photo to Supabase Storage and save metadata
  const addPhoto = useCallback(async (photoData: Omit<Photo, 'id' | 'timestamp'>): Promise<string> => {
    // Allow guest users to take photos (stored locally until login)
    if (!user) {
      console.warn('Guest mode: Photo will be stored locally until login')
      
      // For guest users, create a temporary photo with local storage
      const photoId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const guestPhoto: Photo = {
        ...photoData,
        id: photoId,
        timestamp: new Date()
      }
      
      // Save to localStorage for persistence
      try {
        const stored = localStorage.getItem('clicktales_photos')
        let localPhotos: Photo[] = []
        
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            localPhotos = Array.isArray(parsed) ? parsed : []
          } catch (parseError) {
            console.warn('Invalid localStorage data, resetting:', parseError)
            localPhotos = []
          }
        }
        
        localPhotos.unshift(guestPhoto)
        localStorage.setItem('clicktales_photos', JSON.stringify(localPhotos))
        console.log('ðŸ“± Guest photo saved to local storage')
      } catch (storageError) {
        console.warn('Failed to save guest photo to localStorage:', storageError)
      }
      
      setPhotos(prev => [guestPhoto, ...prev])
      
      return photoId
    }

    try {
      let uploadPath: string
      let useLocalStorage = false
      
      // If it's a data URL (from canvas/camera), try to upload to Supabase first
      if (photoData.url.startsWith('data:')) {
        try {
          // Convert data URL to blob without fetch to avoid CSP issues
          const base64Data = photoData.url.split(',')[1]
          const mimeType = photoData.url.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: mimeType })
          
          // Generate unique filename
          const fileExtension = blob.type.split('/')[1] || 'jpg'
          const fileName = `${user.id}/${Date.now()}-${photoData.filename || 'photo'}.${fileExtension}`
          
          // Try to upload to Supabase Storage
          if (supabase) {
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('photos')
              .upload(fileName, blob, {
                cacheControl: '3600',
                upsert: false
              })

            if (uploadError) {
              console.warn('Supabase upload failed, using local storage:', uploadError.message)
              useLocalStorage = true
              uploadPath = photoData.url // Keep the original data URL
            } else {
              // Get public URL
              const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(uploadData.path)
              uploadPath = publicUrl
            }
          } else {
            useLocalStorage = true
            uploadPath = photoData.url
          }
        } catch (uploadError) {
          console.warn('Upload process failed, using local storage:', uploadError)
          useLocalStorage = true
          uploadPath = photoData.url
        }
      } else {
        // Use provided URL (for external images)
        uploadPath = photoData.url
      }

      let photoId: string
      let newPhoto: Photo

      // Try to save to Supabase database if not using local storage
      if (!useLocalStorage && supabase) {
        try {
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

          if (error) {
            console.warn('Supabase database save failed, using local storage:', error.message)
            useLocalStorage = true
          } else {
            photoId = data.id
            newPhoto = {
              id: data.id,
              url: uploadPath,
              thumbnail: photoData.thumbnail || uploadPath,
              filename: photoData.filename,
              timestamp: new Date(data.created_at),
              isCollage: photoData.isCollage,
              metadata: photoData.metadata
            }
          }
        } catch (dbError) {
          console.warn('Database operation failed, using local storage:', dbError)
          useLocalStorage = true
        }
      }

      // Fallback to local storage
      if (useLocalStorage) {
        photoId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        newPhoto = {
          id: photoId,
          url: uploadPath,
          thumbnail: photoData.thumbnail || uploadPath,
          filename: photoData.filename,
          timestamp: new Date(),
          isCollage: photoData.isCollage,
          metadata: photoData.metadata
        }

        // Save to localStorage for persistence
        try {
          const stored = localStorage.getItem('clicktales_photos')
          let localPhotos: Photo[] = []
          
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              localPhotos = Array.isArray(parsed) ? parsed : []
            } catch (parseError) {
              console.warn('Invalid localStorage data, resetting:', parseError)
              localPhotos = []
            }
          }
          
          localPhotos.unshift(newPhoto)
          localStorage.setItem('clicktales_photos', JSON.stringify(localPhotos))
          console.log('ðŸ“± Photo saved to local storage')
        } catch (storageError) {
          console.warn('Failed to save to localStorage:', storageError)
        }
      }

      setPhotos(prev => [newPhoto!, ...prev])
      
      return photoId!
    } catch (error) {
      console.error('Error adding photo:', error)
      
      // Even if everything fails, try to save locally
      const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const fallbackPhoto: Photo = {
        id: fallbackId,
        url: photoData.url,
        thumbnail: photoData.thumbnail || photoData.url,
        filename: photoData.filename,
        timestamp: new Date(),
        isCollage: photoData.isCollage,
        metadata: photoData.metadata
      }

      setPhotos(prev => [fallbackPhoto, ...prev])
      
      // Save to localStorage
      try {
        const stored = localStorage.getItem('clicktales_photos')
        let localPhotos: Photo[] = []
        
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            localPhotos = Array.isArray(parsed) ? parsed : []
          } catch (parseError) {
            console.warn('Invalid localStorage data, resetting:', parseError)
            localPhotos = []
          }
        }
        
        localPhotos.unshift(fallbackPhoto)
        localStorage.setItem('clicktales_photos', JSON.stringify(localPhotos))
        console.log('ðŸ“± Photo saved to local storage as fallback')
      } catch (storageError) {
        console.warn('Failed to save to localStorage:', storageError)
      }
      
      return fallbackId
    }
  }, [user])

  const deletePhoto = useCallback(async (photoId: string): Promise<void> => {
    // Handle local storage deletion
    if (!user) {
      console.warn('Guest mode: Deleting photo from local storage')
      
      // Remove from photos array
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      
      // Remove from local storage
      try {
        const stored = localStorage.getItem('clicktales_photos')
        let localPhotos: Photo[] = []
        
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            localPhotos = Array.isArray(parsed) ? parsed : []
          } catch (parseError) {
            console.warn('Invalid localStorage data, resetting:', parseError)
            localPhotos = []
          }
        }
        
        const updatedPhotos = localPhotos.filter((photo: any) => photo.id !== photoId)
        localStorage.setItem('clicktales_photos', JSON.stringify(updatedPhotos))
      } catch (storageError) {
        console.warn('Could not update localStorage:', storageError)
      }
      
      // Remove from favorites if it was favorited
      setFavoritePhotos(prev => prev.filter(id => id !== photoId))
      console.log('ðŸ“± Photo deleted from local storage')
      return
    }

    // Check if it's a local photo (doesn't need Supabase deletion)
    const isLocalPhoto = photoId.startsWith('local-') || photoId.startsWith('guest-') || photoId.startsWith('fallback-')
    
    if (isLocalPhoto) {
      // For local photos, just remove from state and localStorage
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      setFavoritePhotos(prev => prev.filter(id => id !== photoId))
      
      // Remove from localStorage
      try {
        const stored = localStorage.getItem('clicktales_photos')
        let localPhotos: Photo[] = []
        
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            localPhotos = Array.isArray(parsed) ? parsed : []
          } catch (parseError) {
            console.warn('Invalid localStorage data, resetting:', parseError)
            localPhotos = []
          }
        }
        
        const updatedPhotos = localPhotos.filter((photo: any) => photo.id !== photoId)
        localStorage.setItem('clicktales_photos', JSON.stringify(updatedPhotos))
        console.log('ðŸ“± Local photo deleted')
      } catch (storageError) {
        console.warn('Could not update localStorage:', storageError)
      }
      
      return
    }

    try {
      // Find the photo to get its storage path
      const photo = photos.find(p => p.id === photoId)
      
      // Delete from database (cascades to album_photos and favorites)
      if (!supabase) throw new Error('Supabase not available')
      
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (deleteError) throw deleteError

      // Try to delete from storage if it's a Supabase-hosted file
      if (photo?.url.includes('supabase')) {
        if (!supabase) throw new Error('Supabase not available')
        
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

      console.log('âœ… Photo deleted from Supabase')
    } catch (error) {
      console.error('Error deleting photo:', error)
      // Don't throw error for delete operations to prevent UI crashes
      console.warn('Delete operation failed, but continuing...')
    }
  }, [photos, user])

  const clearAllPhotos = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Delete all photos for the current user
      if (!supabase) throw new Error('Supabase not available')
      
      const { error: photosError } = await supabase
        .from('photos')
        .delete()
        .eq('user_id', user.id)

      if (photosError) throw photosError

      // Clear storage folder for user
      if (!supabase) throw new Error('Supabase not available')
      
      const { data: files, error: listError } = await supabase.storage
        .from('photos')
        .list(user.id)

      if (!listError && files) {
        const filePaths = files.map((file: any) => `${user.id}/${file.name}`)
        if (filePaths.length > 0) {
          if (!supabase) throw new Error('Supabase not available')
          
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
      addNotification({
        type: 'error',
        title: 'Failed to clear gallery',
        message: error instanceof Error ? error.message : 'Failed to clear gallery'
      })
      throw error
    }
  }, [user, addNotification])

  // Favorites management
  const toggleFavoritePhoto = useCallback(async (photoId: string): Promise<void> => {
    // Allow guest users to toggle favorites locally
    if (!user) {
      console.warn('Guest mode: Favorites will be stored locally until login')
      
      const isFavorited = favoritePhotos.includes(photoId)
      
      if (isFavorited) {
        // Remove from local favorites
        setFavoritePhotos(prev => prev.filter(id => id !== photoId))
      } else {
        // Add to local favorites
        setFavoritePhotos(prev => [...prev, photoId])
      }
      
      // Store in localStorage for guest users
      try {
        const existingGuestFavorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
        if (isFavorited) {
          const updatedFavorites = existingGuestFavorites.filter((id: string) => id !== photoId)
          localStorage.setItem('guestFavorites', JSON.stringify(updatedFavorites))
        } else {
          localStorage.setItem('guestFavorites', JSON.stringify([...existingGuestFavorites, photoId]))
        }
      } catch (storageError) {
        console.warn('Could not update favorites in localStorage:', storageError)
      }
      
      addNotification({
        type: "info",
        title: "Favorite Updated", 
        message: "Login to sync favorites permanently"
      })
      return
    }

    try {
      const isFavorited = favoritePhotos.includes(photoId)

      if (isFavorited) {
        // Remove from favorites
        if (!supabase) throw new Error('Supabase not available')
        
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('photo_id', photoId)

        if (error) throw error

        setFavoritePhotos(prev => prev.filter(id => id !== photoId))
      } else {
        // Add to favorites
        if (!supabase) throw new Error('Supabase not available')
        
        const { error } = await supabase
          .from('favorites')
          .insert({ photo_id: photoId })

        if (error) throw error

        setFavoritePhotos(prev => [...prev, photoId])
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      addNotification({
        type: "error", 
        title: "Operation failed",
        message: error instanceof Error ? error.message : "Operation failed"
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
    // Allow guest users to create albums locally
    if (!user) {
      console.warn('Guest mode: Album will be stored locally until login')
      
      const albumId = `guest-album-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const guestAlbum: Album = {
        id: albumId,
        title,
        description: description || '',
        coverPhoto: photoIds.length > 0 ? photos.find(p => p.id === photoIds[0])?.url : undefined,
        photoIds: photoIds,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Add to albums state
      setAlbums(prev => [guestAlbum, ...prev])
      
      // Store metadata in localStorage (lightweight)
      try {
        const existingGuestAlbums = JSON.parse(localStorage.getItem('guestAlbums') || '[]')
        const albumMeta = {
          id: albumId,
          title,
          description: description || '',
          photoIds: photoIds,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        localStorage.setItem('guestAlbums', JSON.stringify([albumMeta, ...existingGuestAlbums]))
      } catch (storageError) {
        console.warn('Could not save album metadata to localStorage:', storageError)
      }
      
      addNotification({
        type: "info",
        title: "Favorite Updated", 
        message: "Login to sync favorites permanently"
      })
      return albumId
    }

    try {
      // Create album
      if (!supabase) throw new Error('Supabase not available')
      
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
        if (!supabase) throw new Error('Supabase not available')
        
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
        type: "info",
        title: "Favorite Updated", 
        message: "Login to sync favorites permanently"
      })
      return albumData.id
    } catch (error) {
      console.error('Error creating album:', error)
      // Removed unused message variable
      addNotification({
        type: "error", 
        title: "Operation failed",
        message: error instanceof Error ? error.message : "Operation failed"
      })
      throw error
    }
  }, [user, photos])

  const deleteAlbum = useCallback(async (albumId: string): Promise<void> => {
    // Allow guest users to delete albums from local storage
    if (!user) {
      console.warn('Guest mode: Deleting album from local storage')
      
      // Remove from albums state
      setAlbums(prev => prev.filter(album => album.id !== albumId))
      
      // Remove from localStorage metadata
      try {
        const existingGuestAlbums = JSON.parse(localStorage.getItem('guestAlbums') || '[]')
        const updatedAlbums = existingGuestAlbums.filter((album: any) => album.id !== albumId)
        localStorage.setItem('guestAlbums', JSON.stringify(updatedAlbums))
      } catch (storageError) {
        console.warn('Could not update albums in localStorage:', storageError)
      }
      
      addNotification({
        type: "info",
        title: "Favorite Updated", 
        message: "Login to sync favorites permanently"
      })
      return
    }

    try {
      // Delete album (cascades to album_photos)
      if (!supabase) throw new Error('Supabase not available')
      
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId)

      if (error) throw error

      setAlbums(prev => prev.filter(album => album.id !== albumId))

      // Toast notification removed
    } catch (error) {
      console.error('Error deleting album:', error)
      // Removed unused message variable
      addNotification({
        type: "error", 
        title: "Operation failed",
        message: error instanceof Error ? error.message : "Operation failed"
      })
      throw error
    }
  }, [user])

  const updateAlbum = useCallback(async (albumId: string, updates: Partial<Album>): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const updateData: any = {}
      if (updates.title) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.coverPhoto !== undefined) updateData.cover_photo_url = updates.coverPhoto

      if (!supabase) throw new Error('Supabase not available')
      
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

      // Toast notification removed
    } catch (error) {
      console.error('Error updating album:', error)
      // Removed unused message variable
      addNotification({
        type: "error", 
        title: "Operation failed",
        message: error instanceof Error ? error.message : "Operation failed"
      })
      throw error
    }
  }, [user])

  const addPhotoToAlbum = useCallback(async (photoId: string, albumId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Get current max position
      if (!supabase) throw new Error('Supabase not available')
      
      const { data: positions, error: positionError } = await supabase
        .from('album_photos')
        .select('position')
        .eq('album_id', albumId)
        .order('position', { ascending: false })
        .limit(1)

      if (positionError) throw positionError

      const nextPosition = (positions[0]?.position ?? -1) + 1

      // Add photo to album
      if (!supabase) throw new Error('Supabase not available')
      
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

      // Toast notification removed
    } catch (error) {
      console.error('Error adding photo to album:', error)
      // Removed unused message variable
      addNotification({
        type: "error", 
        title: "Operation failed",
        message: error instanceof Error ? error.message : "Operation failed"
      })
      throw error
    }
  }, [user])

  const removePhotoFromAlbum = useCallback(async (photoId: string, albumId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Remove photo from album
      if (!supabase) throw new Error('Supabase not available')
      
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

      // Toast notification removed
    } catch (error) {
      console.error('Error removing photo from album:', error)
      // Removed unused message variable
      addNotification({
        type: "error", 
        title: "Operation failed",
        message: error instanceof Error ? error.message : "Operation failed"
      })
      throw error
    }
  }, [user])

  const getAlbumPhotos = useCallback((albumId: string): Photo[] => {
    const album = albums.find(a => a.id === albumId)
    if (!album) return []
    
    return album.photoIds
      .map(id => photos.find(photo => photo.id === id))
      .filter((photo): photo is Photo => photo !== undefined)
  }, [albums, photos])

  // Utility function to clear all localStorage data
  const clearAllLocalStorage = useCallback(() => {
    const keysToRemove = [
      'guestAlbums',
      'guestFavorites', 
      'guestPhotosMeta',
      'favorite-albums',
      'clicktales_photos',
      'clicktales_albums',
      'clicktales_favorites'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Reset state
    setAlbums([])
    setPhotos([])
    setFavoritePhotos([])
    
    addNotification({
        type: "success",
        title: "Data Cleared",
        message: "All local data has been cleared."
      })
      
      console.log('🧹 Cleared all localStorage data and reset state')
  }, [])

  // Function to remove specific album by name
  const removeAlbumByName = useCallback((albumName: string) => {
    // Remove from current state
    setAlbums(prev => {
      const filtered = prev.filter(album => album.title !== albumName)
      console.log(`Removed album "${albumName}" from state. Remaining albums:`, filtered.map(a => a.title))
      return filtered
    })
    
    // Remove from localStorage
    try {
      const existingGuestAlbums = JSON.parse(localStorage.getItem('guestAlbums') || '[]')
      const updatedAlbums = existingGuestAlbums.filter((album: any) => album.title !== albumName)
      localStorage.setItem('guestAlbums', JSON.stringify(updatedAlbums))
      
      addNotification({
        type: "success",
        title: "Album Removed",
        message: `Album "${albumName}" has been removed.`
      })
      
      console.log(`ðŸ—‘ï¸ Removed album "${albumName}" from localStorage`)
    } catch (storageError) {
      console.warn('Could not update albums in localStorage:', storageError)
    }
  }, [])

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
    refreshData,
    clearAllLocalStorage,
    removeAlbumByName
  }

  return (
    <PhotoContext.Provider value={contextValue}>
      {children}
    </PhotoContext.Provider>
  )
}


