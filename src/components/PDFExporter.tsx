import jsPDF from 'jspdf'
import type { Photo, Album } from '../types'

export interface PDFExportOptions {
  pageSize?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  quality?: number
  includeMetadata?: boolean
  photosPerPage?: number
}

const defaultOptions: PDFExportOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  quality: 0.8,
  includeMetadata: true,
  photosPerPage: 4
}

export class PDFExporter {
  private pdf: jsPDF
  private options: PDFExportOptions

  constructor(options: PDFExportOptions = {}) {
    this.options = { ...defaultOptions, ...options }
    this.pdf = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: this.options.pageSize
    })
  }

  async exportAlbumToPDF(album: Album, photos: Photo[]): Promise<void> {
    const albumPhotos = photos.filter(photo => 
      album.photos?.some(albumPhoto => albumPhoto.photoId === photo.id)
    )
    
    if (albumPhotos.length === 0) {
      throw new Error('No photos found in album')
    }

    // Add title page
    this.addTitlePage(album)

    // Add photos
    await this.addPhotosToPDF(albumPhotos)

    // Save the PDF
    this.pdf.save(`${this.sanitizeFilename(album.title)}.pdf`)
  }

  async exportPhotosToPDF(photos: Photo[], title: string = 'Photo Collection'): Promise<void> {
    if (photos.length === 0) {
      throw new Error('No photos to export')
    }

    // Add title page
    this.addTitlePage({ 
      id: 'temp', 
      title: title, 
      description: `${photos.length} photos`,
      isPublic: false,
      userId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Add photos
    await this.addPhotosToPDF(photos)

    // Save the PDF
    this.pdf.save(`${this.sanitizeFilename(title)}.pdf`)
  }

  private addTitlePage(album: Album): void {
    const pageWidth = this.pdf.internal.pageSize.getWidth()
    const pageHeight = this.pdf.internal.pageSize.getHeight()

    // Add background gradient (simulated with rectangles)
    this.pdf.setFillColor(147, 51, 234) // Purple
    this.pdf.rect(0, 0, pageWidth, pageHeight / 3, 'F')
    
    this.pdf.setFillColor(219, 39, 119) // Pink
    this.pdf.rect(0, pageHeight / 3, pageWidth, pageHeight / 3, 'F')
    
    this.pdf.setFillColor(59, 130, 246) // Blue
    this.pdf.rect(0, (pageHeight / 3) * 2, pageWidth, pageHeight / 3, 'F')

    // Add title
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(32)
    this.pdf.setFont('helvetica', 'bold')
    
    const titleLines = this.pdf.splitTextToSize(album.title, pageWidth - 40)
    const titleHeight = titleLines.length * 12
    const titleY = (pageHeight - titleHeight) / 2
    
    this.pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center' })

    // Add description if available
    if (album.description) {
      this.pdf.setFontSize(14)
      this.pdf.setFont('helvetica', 'normal')
      const descLines = this.pdf.splitTextToSize(album.description, pageWidth - 60)
      this.pdf.text(descLines, pageWidth / 2, titleY + titleHeight + 15, { align: 'center' })
    }

    // Add metadata
    if (this.options.includeMetadata) {
      this.pdf.setFontSize(10)
      const createdDate = album.createdAt ? new Date(album.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
      const photoCount = album.photos?.length || album._count?.photos || 0
      this.pdf.text(`Created: ${createdDate} • ${photoCount} photos`, pageWidth / 2, pageHeight - 30, { align: 'center' })
    }

    // Add watermark
    this.pdf.setFontSize(8)
    this.pdf.setTextColor(255, 255, 255, 0.5)
    this.pdf.text('Created with ClickTales Photobooth', pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  private async addPhotosToPage(photos: Photo[], startIndex: number): Promise<number> {
    const pageWidth = this.pdf.internal.pageSize.getWidth()
    const pageHeight = this.pdf.internal.pageSize.getHeight()
    const margin = 20
    const photosPerRow = this.options.photosPerPage === 4 ? 2 : Math.ceil(Math.sqrt(this.options.photosPerPage!))
    const photosPerCol = Math.ceil(this.options.photosPerPage! / photosPerRow)
    
    const availableWidth = pageWidth - (2 * margin)
    const availableHeight = pageHeight - (2 * margin)
    const photoWidth = (availableWidth - ((photosPerRow - 1) * 10)) / photosPerRow
    const photoHeight = (availableHeight - ((photosPerCol - 1) * 10)) / photosPerCol
    
    let photosAdded = 0
    
    for (let row = 0; row < photosPerCol && startIndex + photosAdded < photos.length; row++) {
      for (let col = 0; col < photosPerRow && startIndex + photosAdded < photos.length; col++) {
        const photo = photos[startIndex + photosAdded]
        const x = margin + col * (photoWidth + 10)
        const y = margin + row * (photoHeight + 10)
        
        try {
          await this.addPhotoToPosition(photo, x, y, photoWidth, photoHeight)
          photosAdded++
        } catch (error) {
          console.warn(`Failed to add photo ${photo.filename}:`, error)
          // Skip this photo and continue
          photosAdded++
        }
      }
    }
    
    return photosAdded
  }

  private async addPhotosToPDF(photos: Photo[]): Promise<void> {
    let currentIndex = 0
    
    while (currentIndex < photos.length) {
      if (currentIndex > 0) {
        this.pdf.addPage()
      }
      
      const photosAdded = await this.addPhotosToPage(photos, currentIndex)
      currentIndex += photosAdded
      
      // If no photos were added, break to avoid infinite loop
      if (photosAdded === 0) {
        break
      }
    }
  }

  private async addPhotoToPosition(photo: Photo, x: number, y: number, width: number, height: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          // Create canvas to get image data
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          // Calculate aspect ratio
          const imgAspect = img.width / img.height
          const targetAspect = width / height
          
          let drawWidth = width
          let drawHeight = height
          let offsetX = 0
          let offsetY = 0
          
          if (imgAspect > targetAspect) {
            // Image is wider than target - fit by height
            drawWidth = height * imgAspect
            offsetX = (width - drawWidth) / 2
          } else {
            // Image is taller than target - fit by width
            drawHeight = width / imgAspect
            offsetY = (height - drawHeight) / 2
          }
          
          // Set canvas size
          canvas.width = width * 2 // Higher resolution
          canvas.height = height * 2
          
          // Draw image centered and scaled
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          ctx.drawImage(
            img,
            offsetX * 2,
            offsetY * 2,
            drawWidth * 2,
            drawHeight * 2
          )
          
          // Convert to JPEG data URL
          const dataUrl = canvas.toDataURL('image/jpeg', this.options.quality)
          
          // Add to PDF
          this.pdf.addImage(dataUrl, 'JPEG', x, y, width, height)
          
          // Add photo border
          this.pdf.setDrawColor(200, 200, 200)
          this.pdf.setLineWidth(0.1)
          this.pdf.rect(x, y, width, height)
          
          // Add photo caption if there's space
          if (height > 40) {
            this.pdf.setFontSize(8)
            this.pdf.setTextColor(100, 100, 100)
            const caption = this.truncateText(photo.filename, width - 4)
            this.pdf.text(caption, x + 2, y + height - 2)
          }
          
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${photo.url}`))
      }
      
      img.src = photo.url
    })
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  }

  private truncateText(text: string, maxWidth: number): string {
    // Simple text truncation - could be improved with actual text measurement
    const maxChars = Math.floor(maxWidth / 2) // Rough estimate
    return text.length > maxChars ? text.substring(0, maxChars - 3) + '...' : text
  }
}

// Utility functions for easy use
export const exportAlbumToPDF = async (
  album: Album, 
  photos: Photo[], 
  options?: PDFExportOptions
): Promise<void> => {
  const exporter = new PDFExporter(options)
  await exporter.exportAlbumToPDF(album, photos)
}

export const exportPhotosToPDF = async (
  photos: Photo[], 
  title?: string, 
  options?: PDFExportOptions
): Promise<void> => {
  const exporter = new PDFExporter(options)
  await exporter.exportPhotosToPDF(photos, title)
}

export default PDFExporter
