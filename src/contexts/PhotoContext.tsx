import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Photo } from '../types'

interface PhotoContextType {
  photos: Photo[]
  addPhoto: (photo: Photo) => void
  deletePhoto: (photoId: string) => void
  clearAllPhotos: () => void
  favoritePhotos: string[]
  toggleFavoritePhoto: (photoId: string) => void
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined)

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [favoritePhotos, setFavoritePhotos] = useState<string[]>([])

  // Load photos from localStorage on mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('photobooth-photos')
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos)
        setPhotos(parsedPhotos)
      } catch (error) {
        console.error('Failed to load saved photos:', error)
      }
    }
    const savedFavorites = localStorage.getItem('photobooth-favorites')
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites)
        setFavoritePhotos(parsedFavorites)
      } catch (error) {
        console.error('Failed to load favorite photos:', error)
      }
    }
  }, [])

  // Save photos to localStorage whenever photos change
  useEffect(() => {
    localStorage.setItem('photobooth-photos', JSON.stringify(photos))
  }, [photos])

  // Save favorites to localStorage whenever favoritePhotos change
  useEffect(() => {
    localStorage.setItem('photobooth-favorites', JSON.stringify(favoritePhotos))
  }, [favoritePhotos])

  const addPhoto = (photo: Photo) => {
    setPhotos(prev => [photo, ...prev])
  }

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
    setFavoritePhotos(prev => prev.filter(id => id !== photoId))
  }

  const clearAllPhotos = () => {
    setPhotos([])
    setFavoritePhotos([])
    localStorage.removeItem('photobooth-photos')
    localStorage.removeItem('photobooth-favorites')
  }

  const toggleFavoritePhoto = (photoId: string) => {
    setFavoritePhotos(prev =>
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    )
  }

  return (
    <PhotoContext.Provider value={{ photos, addPhoto, deletePhoto, clearAllPhotos, favoritePhotos, toggleFavoritePhoto }}>
      {children}
    </PhotoContext.Provider>
  )
}

export const usePhotos = () => {
  const context = useContext(PhotoContext)
  if (context === undefined) {
    throw new Error('usePhotos must be used within a PhotoProvider')
  }
  return context
}
