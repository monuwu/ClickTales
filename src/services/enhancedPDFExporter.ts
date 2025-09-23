import jsPDF from 'jspdf'
import type { Photo, Album } from '../contexts/PhotoContext'

export interface EnhancedPDFOptions {
  pageSize?: 'a4' | 'letter' | 'a3'
  orientation?: 'portrait' | 'landscape'
  quality?: number
  includeMetadata?: boolean
  layout?: 'grid' | 'collage' | 'magazine' | 'polaroid'
  photosPerPage?: number
  includeTitle?: boolean
  includeCoverPage?: boolean
  includeIndex?: boolean
  margins?: { top: number; right: number; bottom: number; left: number }
  theme?: 'modern' | 'classic' | 'minimal' | 'vintage'
  watermark?: string
}

const defaultOptions: EnhancedPDFOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  quality: 0.85,
  includeMetadata: true,
  layout: 'grid',
  photosPerPage: 6,
  includeTitle: true,
  includeCoverPage: true,
  includeIndex: false,
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
  theme: 'modern'
}

export class EnhancedPDFExporter {
  private pdf: jsPDF
  private options: EnhancedPDFOptions
  private pageWidth: number
  private pageHeight: number
  private contentWidth: number
  private contentHeight: number

  constructor(options: EnhancedPDFOptions = {}) {
    this.options = { ...defaultOptions, ...options }
    
    // Initialize PDF
    this.pdf = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: this.options.pageSize
    })

    // Calculate dimensions
    this.pageWidth = this.pdf.internal.pageSize.getWidth()
    this.pageHeight = this.pdf.internal.pageSize.getHeight()
    this.contentWidth = this.pageWidth - this.options.margins!.left - this.options.margins!.right
    this.contentHeight = this.pageHeight - this.options.margins!.top - this.options.margins!.bottom
  }

  async exportAlbumToPDF(album: Album, photos: Photo[]): Promise<Blob> {
    const albumPhotos = photos.filter(photo => album.photoIds.includes(photo.id))
    
    if (albumPhotos.length === 0) {
      throw new Error('No photos found in album')
    }

    // Add cover page
    if (this.options.includeCoverPage) {
      await this.addCoverPage(album, albumPhotos[0]) // Use first photo as cover
    }

    // Add index/contents if requested
    if (this.options.includeIndex) {
      this.addIndexPage(albumPhotos)
    }

    // Add photos based on layout
    await this.addPhotosWithLayout(albumPhotos)

    // Add metadata page if requested
    if (this.options.includeMetadata) {
      this.addMetadataPage(album, albumPhotos)
    }

    return this.pdf.output('blob')
  }

  async exportPhotosToPDF(photos: Photo[], title: string = 'Photo Collection'): Promise<Blob> {
    if (photos.length === 0) {
      throw new Error('No photos to export')
    }

    const mockAlbum = {
      id: 'temp',
      title,
      description: `${photos.length} photos`,
      photoIds: photos.map(p => p.id),
      createdAt: new Date(),
      updatedAt: new Date()
    } as Album

    return this.exportAlbumToPDF(mockAlbum, photos)
  }

  private async addCoverPage(album: Album, coverPhoto?: Photo): Promise<void> {
    // Add themed background
    this.addThemedBackground()

    // Add cover photo if available
    if (coverPhoto) {
      try {
        const imageData = await this.loadImage(coverPhoto.url)
        const { width, height } = this.calculateImageDimensions(
          imageData.width, 
          imageData.height, 
          this.contentWidth * 0.8, 
          this.contentHeight * 0.5
        )
        
        const x = this.options.margins!.left + (this.contentWidth - width) / 2
        const y = this.options.margins!.top + 20

        // Add subtle shadow effect
        this.pdf.setFillColor(0, 0, 0, 0.1)
        this.pdf.roundedRect(x + 2, y + 2, width, height, 3, 3, 'F')
        
        // Add image with rounded corners effect
        this.pdf.addImage(imageData.data, 'JPEG', x, y, width, height)
      } catch (error) {
        console.warn('Failed to add cover photo:', error)
      }
    }

    // Add album title
    const [r, g, b] = this.getThemeColors().primary
    this.pdf.setTextColor(r, g, b)
    this.pdf.setFontSize(28)
    this.pdf.setFont('helvetica', 'bold')
    
    const titleY = coverPhoto ? this.pageHeight * 0.75 : this.pageHeight * 0.4
    this.addCenteredText(album.title, titleY)

    // Add description if available
    if (album.description) {
      this.pdf.setFontSize(14)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.setTextColor(...this.getThemeColors().secondary)
      this.addCenteredText(album.description, titleY + 15)
    }

    // Add photo count and creation date
    this.pdf.setFontSize(12)
    this.pdf.setTextColor(...this.getThemeColors().tertiary)
    this.addCenteredText(
      `${album.photoIds.length} photos • Created ${album.createdAt.toLocaleDateString()}`,
      titleY + 30
    )

    // Add watermark if specified
    if (this.options.watermark) {
      this.addWatermark()
    }

    this.pdf.addPage()
  }

  private addIndexPage(photos: Photo[]): void {
    this.addThemedHeader('Table of Contents')

    let y = this.options.margins!.top + 40
    const itemHeight = 8

    // Group photos by date for better organization
    const photosByDate = this.groupPhotosByDate(photos)

    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')

    let pageNumber = this.options.includeCoverPage ? 3 : 2 // Start after cover and index

    Object.entries(photosByDate).forEach(([date, datePhotos]) => {
      if (y > this.pageHeight - 40) {
        this.pdf.addPage()
        y = this.options.margins!.top + 20
      }

      // Date header
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.setTextColor(...this.getThemeColors().primary)
      this.pdf.text(date, this.options.margins!.left, y)
      y += itemHeight

      // Photos for this date
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.setTextColor(...this.getThemeColors().secondary)
      
      datePhotos.forEach(photo => {
        const dots = '.'.repeat(
          Math.floor((this.contentWidth - this.pdf.getTextWidth(photo.filename) - 20) / 2)
        )
        this.pdf.text(
          `  ${photo.filename} ${dots} ${pageNumber}`,
          this.options.margins!.left,
          y
        )
        y += itemHeight - 2
        pageNumber++
      })

      y += 5 // Extra space between dates
    })

    this.pdf.addPage()
  }

  private async addPhotosWithLayout(photos: Photo[]): Promise<void> {
    switch (this.options.layout) {
      case 'grid':
        await this.addPhotosInGrid(photos)
        break
      case 'collage':
        await this.addPhotosInGrid(photos)
        break
      case 'magazine':
        await this.addPhotosInGrid(photos)
        break
      case 'polaroid':
        await this.addPhotosAsPolaroids(photos)
        break
      default:
        await this.addPhotosInGrid(photos)
    }
  }

  private async addPhotosInGrid(photos: Photo[]): Promise<void> {
    const photosPerPage = this.options.photosPerPage!
    const cols = Math.ceil(Math.sqrt(photosPerPage))
    const rows = Math.ceil(photosPerPage / cols)
    
    const photoWidth = this.contentWidth / cols - 5
    const photoHeight = this.contentHeight / rows - 10
    
    for (let i = 0; i < photos.length; i += photosPerPage) {
      const pagePhotos = photos.slice(i, i + photosPerPage)
      
      if (i > 0) this.pdf.addPage()

      // Add page header
      this.addPageHeader(`Photos ${i + 1} - ${Math.min(i + pagePhotos.length, photos.length)}`)

      // Add photos in grid
      for (let j = 0; j < pagePhotos.length; j++) {
        const row = Math.floor(j / cols)
        const col = j % cols
        
        const x = this.options.margins!.left + col * (photoWidth + 5)
        const y = this.options.margins!.top + 30 + row * (photoHeight + 10)

        await this.addPhotoWithFrame(pagePhotos[j], x, y, photoWidth, photoHeight)
      }

      // Add page number
      this.addPageNumber()
    }
  }

  private async addPhotosAsPolaroids(photos: Photo[]): Promise<void> {
    const polaroidWidth = 60
    const polaroidHeight = 75
    const photosPerPage = 6
    const spacing = 10

    for (let i = 0; i < photos.length; i += photosPerPage) {
      const pagePhotos = photos.slice(i, i + photosPerPage)
      
      if (i > 0) this.pdf.addPage()

      this.addPageHeader('Polaroid Collection')

      for (let j = 0; j < pagePhotos.length; j++) {
        const row = Math.floor(j / 2)
        const col = j % 2
        
        // Add some random positioning for natural look
        const x = this.options.margins!.left + col * (polaroidWidth + spacing * 2) + Math.random() * 20
        const y = this.options.margins!.top + 30 + row * (polaroidHeight + spacing * 2) + Math.random() * 10

        await this.addPolaroidPhoto(pagePhotos[j], x, y, polaroidWidth, polaroidHeight)
      }

      this.addPageNumber()
    }
  }

  private async addPolaroidPhoto(
    photo: Photo, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): Promise<void> {
    // Save state for consistent styling
    this.pdf.saveGraphicsState()
    // TODO: Implement proper rotation support

    // Add polaroid background (white with shadow)
    this.pdf.setFillColor(255, 255, 255)
    this.pdf.roundedRect(x, y, width, height, 2, 2, 'F')
    
    // Add shadow
    this.pdf.setFillColor(0, 0, 0, 0.2)
    this.pdf.roundedRect(x + 2, y + 2, width, height, 2, 2, 'F')

    // Add photo
    try {
      const imageData = await this.loadImage(photo.url)
      const photoMargin = 3
      const photoWidth = width - photoMargin * 2
      const photoHeight = height * 0.75 - photoMargin

      const { width: scaledWidth, height: scaledHeight } = this.calculateImageDimensions(
        imageData.width, 
        imageData.height, 
        photoWidth, 
        photoHeight
      )

      const photoX = x + photoMargin + (photoWidth - scaledWidth) / 2
      const photoY = y + photoMargin

      this.pdf.addImage(imageData.data, 'JPEG', photoX, photoY, scaledWidth, scaledHeight)

      // Add caption
      this.pdf.setFontSize(6)
      this.pdf.setTextColor(100, 100, 100)
      this.pdf.setFont('helvetica', 'normal')
      
      const captionY = y + height * 0.85
      const caption = photo.filename.length > 20 ? 
        photo.filename.substring(0, 17) + '...' : 
        photo.filename
      
      this.pdf.text(caption, x + width / 2, captionY, { align: 'center' })

    } catch (error) {
      console.warn('Failed to add polaroid photo:', error)
    }

    this.pdf.restoreGraphicsState()
  }

  private async addPhotoWithFrame(
    photo: Photo, 
    x: number, 
    y: number, 
    maxWidth: number, 
    maxHeight: number
  ): Promise<void> {
    try {
      const imageData = await this.loadImage(photo.url)
      const { width, height } = this.calculateImageDimensions(
        imageData.width, 
        imageData.height, 
        maxWidth - 4, 
        maxHeight - 15
      )

      // Add frame background
      this.pdf.setFillColor(255, 255, 255)
      this.pdf.roundedRect(x, y, maxWidth, maxHeight, 2, 2, 'F')
      
      // Add frame border
      this.pdf.setDrawColor(...this.getThemeColors().border)
      this.pdf.setLineWidth(0.5)
      this.pdf.roundedRect(x, y, maxWidth, maxHeight, 2, 2, 'S')

      // Center image in frame
      const imageX = x + (maxWidth - width) / 2
      const imageY = y + 2

      this.pdf.addImage(imageData.data, 'JPEG', imageX, imageY, width, height)

      // Add photo caption
      this.pdf.setFontSize(7)
      this.pdf.setTextColor(...this.getThemeColors().tertiary)
      this.pdf.setFont('helvetica', 'normal')
      
      const caption = photo.filename.length > 25 ? 
        photo.filename.substring(0, 22) + '...' : 
        photo.filename
      
      this.pdf.text(caption, x + maxWidth / 2, y + maxHeight - 3, { align: 'center' })

    } catch (error) {
      console.warn('Failed to add framed photo:', error)
      
      // Add placeholder
      this.pdf.setFillColor(240, 240, 240)
      this.pdf.roundedRect(x + 2, y + 2, maxWidth - 4, maxHeight - 15, 2, 2, 'F')
      
      this.pdf.setFontSize(8)
      this.pdf.setTextColor(150, 150, 150)
      this.pdf.text('Image not available', x + maxWidth / 2, y + maxHeight / 2, { align: 'center' })
    }
  }

  private addMetadataPage(album: Album, photos: Photo[]): void {
    this.pdf.addPage()
    this.addThemedHeader('Album Information')

    let y = this.options.margins!.top + 40

    // Album metadata
    const metadata = [
      ['Album Name', album.title],
      ['Description', album.description || 'No description'],
      ['Total Photos', photos.length.toString()],
      ['Created Date', album.createdAt.toLocaleDateString()],
      ['Last Updated', album.updatedAt.toLocaleDateString()],
      ['Export Date', new Date().toLocaleDateString()],
      ['Export Quality', `${Math.round(this.options.quality! * 100)}%`],
      ['Layout Style', this.options.layout!.charAt(0).toUpperCase() + this.options.layout!.slice(1)]
    ]

    this.pdf.setFontSize(10)
    
    metadata.forEach(([label, value]) => {
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.setTextColor(...this.getThemeColors().primary)
      this.pdf.text(`${label}:`, this.options.margins!.left, y)
      
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.setTextColor(...this.getThemeColors().secondary)
      this.pdf.text(value, this.options.margins!.left + 40, y)
      
      y += 8
    })

    // Photo statistics
    y += 10
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(12)
    this.pdf.setTextColor(...this.getThemeColors().primary)
    this.pdf.text('Photo Statistics', this.options.margins!.left, y)
    y += 15

    const stats = this.calculatePhotoStatistics(photos)
    Object.entries(stats).forEach(([label, value]) => {
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.setFontSize(9)
      this.pdf.text(`${label}:`, this.options.margins!.left, y)
      
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text(value, this.options.margins!.left + 40, y)
      
      y += 7
    })
  }

  private calculatePhotoStatistics(photos: Photo[]): Record<string, string> {
    const totalSize = photos.reduce((sum, photo) => sum + (photo.metadata?.size || 0), 0)
    const avgSize = totalSize / photos.length
    
    const dates = photos.map(p => p.timestamp).sort()
    const dateRange = dates.length > 1 ? 
      `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}` :
      dates[0]?.toLocaleDateString() || 'Unknown'

    return {
      'Total Size': this.formatFileSize(totalSize),
      'Average Size': this.formatFileSize(avgSize),
      'Date Range': dateRange,
      'Collages': photos.filter(p => p.isCollage).length.toString(),
      'Regular Photos': photos.filter(p => !p.isCollage).length.toString()
    }
  }

  // Utility methods
  private async loadImage(url: string): Promise<{ data: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        resolve({
          data: canvas.toDataURL('image/jpeg', this.options.quality),
          width: img.width,
          height: img.height
        })
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = url
    })
  }

  private calculateImageDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight
    
    let width = maxWidth
    let height = maxWidth / aspectRatio
    
    if (height > maxHeight) {
      height = maxHeight
      width = maxHeight * aspectRatio
    }
    
    return { width, height }
  }

  private addThemedBackground(): void {
    const colors = this.getThemeColors()
    
    switch (this.options.theme) {
      case 'modern':
        // Gradient background
        this.pdf.setFillColor(...colors.background)
        this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F')
        break
      case 'classic':
        // Simple border
        this.pdf.setDrawColor(...colors.border)
        this.pdf.setLineWidth(1)
        this.pdf.rect(5, 5, this.pageWidth - 10, this.pageHeight - 10, 'S')
        break
      case 'minimal':
        // Clean white background
        this.pdf.setFillColor(255, 255, 255)
        this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F')
        break
      case 'vintage':
        // Textured background effect
        this.pdf.setFillColor(252, 248, 227)
        this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F')
        break
    }
  }

  private getThemeColors(): Record<string, [number, number, number]> {
    switch (this.options.theme) {
      case 'modern':
        return {
          primary: [37, 99, 235],
          secondary: [75, 85, 99],
          tertiary: [156, 163, 175],
          background: [248, 250, 252],
          border: [229, 231, 235]
        }
      case 'classic':
        return {
          primary: [0, 0, 0],
          secondary: [75, 75, 75],
          tertiary: [125, 125, 125],
          background: [255, 255, 255],
          border: [0, 0, 0]
        }
      case 'minimal':
        return {
          primary: [64, 64, 64],
          secondary: [96, 96, 96],
          tertiary: [128, 128, 128],
          background: [255, 255, 255],
          border: [240, 240, 240]
        }
      case 'vintage':
        return {
          primary: [101, 67, 33],
          secondary: [139, 102, 66],
          tertiary: [160, 132, 104],
          background: [252, 248, 227],
          border: [194, 154, 108]
        }
      default:
        return this.getThemeColors()
    }
  }

  private addThemedHeader(text: string): void {
    const colors = this.getThemeColors()
    
    this.pdf.setFillColor(...colors.primary)
    this.pdf.rect(
      this.options.margins!.left, 
      this.options.margins!.top, 
      this.contentWidth, 
      15, 
      'F'
    )
    
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(text, this.options.margins!.left + 5, this.options.margins!.top + 10)
  }

  private addPageHeader(text: string): void {
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setTextColor(...this.getThemeColors().primary)
    this.pdf.text(text, this.options.margins!.left, this.options.margins!.top + 10)
  }

  private addPageNumber(): void {
    const pageNumber = this.pdf.getCurrentPageInfo().pageNumber
    this.pdf.setFontSize(8)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setTextColor(...this.getThemeColors().tertiary)
    this.pdf.text(
      `Page ${pageNumber}`, 
      this.pageWidth - this.options.margins!.right, 
      this.pageHeight - 10, 
      { align: 'right' }
    )
  }

  private addCenteredText(text: string, y: number): void {
    this.pdf.text(text, this.pageWidth / 2, y, { align: 'center' })
  }

  private addWatermark(): void {
    if (!this.options.watermark) return
    
    this.pdf.saveGraphicsState()
    this.pdf.setGState(this.pdf.GState({ opacity: 0.1 }))
    this.pdf.setFontSize(50)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setTextColor(128, 128, 128)
    
    // Rotate and center the watermark
    const centerX = this.pageWidth / 2
    const centerY = this.pageHeight / 2
    
    this.pdf.text(this.options.watermark, centerX, centerY, { 
      align: 'center',
      angle: 45
    })
    
    this.pdf.restoreGraphicsState()
  }

  private groupPhotosByDate(photos: Photo[]): Record<string, Photo[]> {
    return photos.reduce((groups, photo) => {
      const date = photo.timestamp.toLocaleDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(photo)
      return groups
    }, {} as Record<string, Photo[]>)
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  }

  // Public save method that returns filename for user feedback
  async save(filename: string): Promise<string> {
    const sanitizedName = this.sanitizeFilename(filename)
    this.pdf.save(sanitizedName)
    return sanitizedName
  }

  // Public method to get PDF as blob for further processing
  getBlob(): Blob {
    return new Blob([this.pdf.output('arraybuffer')], { type: 'application/pdf' })
  }
}

// Legacy export functions for backward compatibility
export const exportAlbumToPDF = async (
  album: Album, 
  photos: Photo[], 
  options?: EnhancedPDFOptions
): Promise<void> => {
  const exporter = new EnhancedPDFExporter(options)
  const blob = await exporter.exportAlbumToPDF(album, photos)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${album.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export const exportPhotosToPDF = async (
  photos: Photo[], 
  title?: string, 
  options?: EnhancedPDFOptions
): Promise<void> => {
  const exporter = new EnhancedPDFExporter(options)
  const blob = await exporter.exportPhotosToPDF(photos, title)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title || 'photos'}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}