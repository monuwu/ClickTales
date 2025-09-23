import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Photo, Album } from '../contexts/PhotoContext'

export interface DownloadProgress {
  total: number
  completed: number
  currentItem: string
  percentage: number
}

export type ProgressCallback = (progress: DownloadProgress) => void

export class BulkDownloadService {
  private static async downloadImageAsBlob(url: string): Promise<{ blob: Blob; filename: string }> {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    // Extract filename from URL or create one
    const urlParts = url.split('/')
    let filename = urlParts[urlParts.length - 1]
    
    // If no file extension, add one based on blob type
    if (!filename.includes('.')) {
      const extension = blob.type.split('/')[1] || 'jpg'
      filename = `photo.${extension}`
    }
    
    return { blob, filename }
  }

  /**
   * Download multiple photos as a ZIP file
   */
  static async downloadPhotosAsZip(
    photos: Photo[], 
    zipName: string = 'photos.zip',
    onProgress?: ProgressCallback
  ): Promise<void> {
    const zip = new JSZip()
    const totalPhotos = photos.length
    let completed = 0

    // Create a folder in the ZIP for better organization
    const photoFolder = zip.folder('photos')
    if (!photoFolder) {
      throw new Error('Failed to create photo folder in ZIP')
    }

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      
      try {
        // Update progress
        onProgress?.({
          total: totalPhotos,
          completed,
          currentItem: photo.filename,
          percentage: Math.round((completed / totalPhotos) * 100)
        })

        // Download the image
        const { blob, filename } = await this.downloadImageAsBlob(photo.url)
        
        // Add timestamp and unique ID to avoid filename conflicts
        const timestamp = photo.timestamp.toISOString().split('T')[0]
        const uniqueFilename = `${timestamp}_${photo.id.slice(0, 8)}_${filename}`
        
        // Add to ZIP
        photoFolder.file(uniqueFilename, blob)
        
        completed++
      } catch (error) {
        console.warn(`Failed to download photo ${photo.filename}:`, error)
        // Continue with other photos even if one fails
      }
    }

    // Final progress update
    onProgress?.({
      total: totalPhotos,
      completed,
      currentItem: 'Generating ZIP file...',
      percentage: 100
    })

    // Generate and download the ZIP
    try {
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })
      
      saveAs(zipBlob, zipName)
    } catch (error) {
      throw new Error(`Failed to generate ZIP file: ${error}`)
    }
  }

  /**
   * Download an entire album as a ZIP file
   */
  static async downloadAlbumAsZip(
    album: Album, 
    photos: Photo[], 
    onProgress?: ProgressCallback
  ): Promise<void> {
    // Filter photos that belong to this album
    const albumPhotos = photos.filter(photo => album.photoIds.includes(photo.id))
    
    if (albumPhotos.length === 0) {
      throw new Error('No photos found in this album')
    }

    const zipName = `${album.title.replace(/[^a-zA-Z0-9]/g, '_')}_album.zip`
    await this.downloadPhotosAsZip(albumPhotos, zipName, onProgress)
  }

  /**
   * Download all favorite photos as a ZIP file
   */
  static async downloadFavoritesAsZip(
    photos: Photo[], 
    favoriteIds: string[], 
    onProgress?: ProgressCallback
  ): Promise<void> {
    const favoritePhotos = photos.filter(photo => favoriteIds.includes(photo.id))
    
    if (favoritePhotos.length === 0) {
      throw new Error('No favorite photos found')
    }

    await this.downloadPhotosAsZip(favoritePhotos, 'favorite_photos.zip', onProgress)
  }

  /**
   * Download selected photos as a ZIP file
   */
  static async downloadSelectedPhotos(
    photos: Photo[], 
    selectedIds: string[], 
    onProgress?: ProgressCallback
  ): Promise<void> {
    const selectedPhotos = photos.filter(photo => selectedIds.includes(photo.id))
    
    if (selectedPhotos.length === 0) {
      throw new Error('No photos selected')
    }

    const timestamp = new Date().toISOString().split('T')[0]
    await this.downloadPhotosAsZip(selectedPhotos, `selected_photos_${timestamp}.zip`, onProgress)
  }

  /**
   * Estimate download size for photos
   */
  static async estimateDownloadSize(photos: Photo[]): Promise<number> {
    let totalSize = 0
    
    // Sample first few photos to estimate average size
    const sampleSize = Math.min(photos.length, 3)
    const samplePhotos = photos.slice(0, sampleSize)
    
    for (const photo of samplePhotos) {
      try {
        const response = await fetch(photo.url, { method: 'HEAD', mode: 'cors' })
        const contentLength = response.headers.get('content-length')
        if (contentLength) {
          totalSize += parseInt(contentLength, 10)
        }
      } catch (error) {
        // If we can't get size, estimate based on typical photo size (2MB)
        totalSize += 2 * 1024 * 1024
      }
    }
    
    // Extrapolate to all photos
    const averageSize = totalSize / sampleSize
    return Math.round(averageSize * photos.length)
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}