import { useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Album, Photo } from '../contexts/PhotoContext'

interface PDFGenerationOptions {
  layout: 'single' | 'grid' | 'collage'
  quality: number
  includeMetadata: boolean
  pageSize: 'a4' | 'letter' | 'a3'
}

interface PDFGenerationProgress {
  stage: 'loading' | 'processing' | 'generating' | 'downloading' | 'completed' | 'error'
  progress: number
  currentPhoto?: number
  totalPhotos?: number
  message?: string
}

export const usePDFDownload = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<PDFGenerationProgress>({
    stage: 'completed',
    progress: 0
  })
  const [error, setError] = useState<string | null>(null)

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = (error) => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
  }, [])

  const downloadPhotosAsZip = useCallback(async (
    photos: Photo[],
    zipName: string = 'photos.zip'
  ) => {
    if (photos.length === 0) {
      throw new Error('No photos to download')
    }

    setIsGenerating(true)
    setError(null)
    setProgress({
      stage: 'loading',
      progress: 0,
      totalPhotos: photos.length,
      currentPhoto: 0,
      message: 'Preparing download...'
    })

    try {
      const zip = new JSZip()
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        setProgress(prev => ({
          ...prev,
          stage: 'processing',
          progress: (i / photos.length) * 80,
          currentPhoto: i + 1,
          message: `Processing photo ${i + 1} of ${photos.length}...`
        }))

        try {
          // Fetch the image as blob
          const response = await fetch(photo.url)
          if (!response.ok) {
            console.warn(`Failed to fetch photo ${photo.filename}:`, response.statusText)
            continue
          }
          
          const blob = await response.blob()
          const extension = photo.filename.split('.').pop() || 'jpg'
          const filename = `${photo.filename.replace(/\.[^/.]+$/, '')}.${extension}`
          
          zip.file(filename, blob)
        } catch (error) {
          console.warn(`Failed to process photo ${photo.filename}:`, error)
          // Continue with other photos
        }
      }

      setProgress(prev => ({
        ...prev,
        stage: 'generating',
        progress: 90,
        message: 'Creating ZIP file...'
      }))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      setProgress(prev => ({
        ...prev,
        stage: 'downloading',
        progress: 100,
        message: 'Starting download...'
      }))

      saveAs(zipBlob, zipName)
      
      setProgress({
        stage: 'completed',
        progress: 100,
        message: 'Download completed successfully!'
      })
      
    } catch (error) {
      console.error('Error creating ZIP:', error)
      setError(error instanceof Error ? error.message : 'Failed to create ZIP file')
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Download failed'
      })
      throw error
    } finally {
      setIsGenerating(false)
      // Reset progress after 3 seconds
      setTimeout(() => {
        setProgress({ stage: 'completed', progress: 0 })
        setError(null)
      }, 3000)
    }
  }, [])

  const generateAlbumPDF = useCallback(async (
    album: Album,
    photos: Photo[],
    options: Partial<PDFGenerationOptions> = {}
  ) => {
    if (photos.length === 0) {
      throw new Error('No photos in album to generate PDF')
    }

    const {
      layout = 'single',
      quality = 0.8,
      includeMetadata = true,
      pageSize = 'a4'
    } = options

    setIsGenerating(true)
    setError(null)
    setProgress({
      stage: 'loading',
      progress: 0,
      totalPhotos: photos.length,
      currentPhoto: 0,
      message: 'Initializing PDF generation...'
    })

    try {
      // PDF dimensions for A4
      const pageWidth = pageSize === 'a4' ? 210 : pageSize === 'letter' ? 216 : 297
      const pageHeight = pageSize === 'a4' ? 297 : pageSize === 'letter' ? 279 : 420
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      const contentHeight = pageHeight - (margin * 2)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize
      })

      // Add title page
      if (includeMetadata) {
        pdf.setFontSize(24)
        pdf.setFont('helvetica', 'bold')
        pdf.text(album.title, pageWidth / 2, 50, { align: 'center' })

        if (album.description) {
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'normal')
          const splitDescription = pdf.splitTextToSize(album.description, contentWidth)
          pdf.text(splitDescription, margin, 80)
        }

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Created: ${new Date(album.createdAt).toLocaleDateString()}`, margin, 120)
        pdf.text(`Photos: ${photos.length}`, margin, 135)

        pdf.addPage()
      }

      // Process photos based on layout
      if (layout === 'single') {
        // One photo per page
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i]
          setProgress(prev => ({
            ...prev,
            stage: 'processing',
            progress: (i / photos.length) * 80,
            currentPhoto: i + 1,
            message: `Processing photo ${i + 1} of ${photos.length}...`
          }))

          try {
            const img = await loadImage(photo.url)
            
            // Calculate dimensions to fit page while maintaining aspect ratio
            const imgAspectRatio = img.width / img.height
            const pageAspectRatio = contentWidth / contentHeight
            
            let imgWidth, imgHeight
            if (imgAspectRatio > pageAspectRatio) {
              // Image is wider than page
              imgWidth = contentWidth
              imgHeight = contentWidth / imgAspectRatio
            } else {
              // Image is taller than page
              imgHeight = contentHeight
              imgWidth = contentHeight * imgAspectRatio
            }

            const x = (pageWidth - imgWidth) / 2
            const y = (pageHeight - imgHeight) / 2

            pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'MEDIUM')

            if (i < photos.length - 1) {
              pdf.addPage()
            }
          } catch (error) {
            console.warn(`Failed to process photo ${photo.filename}:`, error)
            // Add a placeholder text instead
            pdf.setFontSize(12)
            pdf.text(`Failed to load: ${photo.filename}`, margin, pageHeight / 2)
            if (i < photos.length - 1) {
              pdf.addPage()
            }
          }
        }
      } else if (layout === 'grid') {
        // Grid layout - 2x2 photos per page
        const photosPerPage = 4
        const photoWidth = (contentWidth - 10) / 2
        const photoHeight = (contentHeight - 10) / 2

        for (let pageIndex = 0; pageIndex < Math.ceil(photos.length / photosPerPage); pageIndex++) {
          const startIndex = pageIndex * photosPerPage
          const endIndex = Math.min(startIndex + photosPerPage, photos.length)
          
          for (let i = startIndex; i < endIndex; i++) {
            const photo = photos[i]
            const positionOnPage = i - startIndex
            const row = Math.floor(positionOnPage / 2)
            const col = positionOnPage % 2
            
            setProgress(prev => ({
              ...prev,
              stage: 'processing',
              progress: (i / photos.length) * 80,
              currentPhoto: i + 1,
              message: `Processing photo ${i + 1} of ${photos.length}...`
            }))

            try {
              const img = await loadImage(photo.url)
              
              const x = margin + (col * (photoWidth + 5))
              const y = margin + (row * (photoHeight + 5))

              pdf.addImage(img, 'JPEG', x, y, photoWidth, photoHeight, undefined, 'MEDIUM')
            } catch (error) {
              console.warn(`Failed to process photo ${photo.filename}:`, error)
            }
          }

          if (pageIndex < Math.ceil(photos.length / photosPerPage) - 1) {
            pdf.addPage()
          }
        }
      }

      setProgress(prev => ({
        ...prev,
        stage: 'generating',
        progress: 90,
        message: 'Generating PDF file...'
      }))

      // Generate and download PDF
      const pdfBlob = pdf.output('blob')
      const filename = `${album.title.replace(/[^a-zA-Z0-9]/g, '_')}_Album.pdf`
      
      setProgress(prev => ({
        ...prev,
        stage: 'downloading',
        progress: 100,
        message: 'Starting download...'
      }))

      saveAs(pdfBlob, filename)
      
      setProgress({
        stage: 'completed',
        progress: 100,
        message: 'PDF generated successfully!'
      })

    } catch (error) {
      console.error('Error generating PDF:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate PDF')
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'PDF generation failed'
      })
      throw error
    } finally {
      setIsGenerating(false)
      // Reset progress after 3 seconds
      setTimeout(() => {
        setProgress({ stage: 'completed', progress: 0 })
        setError(null)
      }, 3000)
    }
  }, [loadImage])

  return {
    generateAlbumPDF,
    downloadPhotosAsZip,
    isGenerating,
    progress,
    error,
    reset: () => {
      setProgress({ stage: 'completed', progress: 0 })
      setError(null)
      setIsGenerating(false)
    }
  }
}