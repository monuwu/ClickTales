import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Photo } from '../types'

interface PhotoContextType {
  photos: Photo[]
  addPhoto: (photo: Photo) => void
  deletePhoto: (photoId: string) => void
  clearAllPhotos: () => void
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined)

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([])

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
  }, [])

  // Save photos to localStorage whenever photos change
  useEffect(() => {
    localStorage.setItem('photobooth-photos', JSON.stringify(photos))
  }, [photos])

  const addPhoto = (photo: Photo) => {
    setPhotos(prev => [photo, ...prev])
  }

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
  }

  const clearAllPhotos = () => {
    setPhotos([])
    localStorage.removeItem('photobooth-photos')
  }

  return (
    <PhotoContext.Provider value={{ photos, addPhoto, deletePhoto, clearAllPhotos }}>
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
