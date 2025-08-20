import React, { useRef, useState } from 'react'
import { usePhotos } from '../contexts/PhotoContext'
import type { Photo } from '../types'

interface PhotoUploadProps {
  onUploadComplete?: (photos: Photo[]) => void
  className?: string
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUploadComplete, className = '' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addPhoto } = usePhotos()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const maxSize = 150
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const uploadedPhotos: Photo[] = []
    const totalFiles = files.length

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`)
        continue
      }

      try {
        // Create object URL for the image
        const url = URL.createObjectURL(file)
        
        // Generate thumbnail
        const thumbnail = await generateThumbnail(file)
        
        // Create photo object
        const photo: Photo = {
          id: `upload-${Date.now()}-${i}`,
          url,
          thumbnail,
          timestamp: new Date(),
          filename: file.name,
          filter: 'none'
        }

        // Add to context
        addPhoto(photo)
        uploadedPhotos.push(photo)

        // Update progress
        setUploadProgress(((i + 1) / totalFiles) * 100)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }

    setUploading(false)
    setUploadProgress(0)
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Callback with uploaded photos
    if (onUploadComplete) {
      onUploadComplete(uploadedPhotos)
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    
    const files = Array.from(event.dataTransfer.files)
    if (files.length === 0) return

    // Create a fake file input event
    const fakeEvent = {
      target: { files: files as any }
    } as React.ChangeEvent<HTMLInputElement>

    await handleFileSelect(fakeEvent)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`photo-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div 
        className="upload-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-circle">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="#e0e0e0"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="#007bff"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${uploadProgress * 1.57} 157`}
                  strokeLinecap="round"
                  transform="rotate(-90 30 30)"
                />
              </svg>
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
            <p>Uploading photos...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <h3>Upload Photos</h3>
            <p>Click here or drag and drop images to upload</p>
            <p className="file-info">Supports: JPG, PNG, GIF</p>
          </div>
        )}
      </div>

      <style>{`
        .photo-upload {
          margin: 1rem 0;
        }
        
        .upload-zone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }
        
        .upload-zone:hover {
          border-color: #007bff;
          background: #f0f8ff;
        }
        
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .upload-icon {
          color: #666;
        }
        
        .upload-content h3 {
          margin: 0;
          color: #333;
          font-size: 1.25rem;
        }
        
        .upload-content p {
          margin: 0;
          color: #666;
        }
        
        .file-info {
          font-size: 0.875rem;
          color: #999;
        }
        
        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .progress-circle {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .progress-text {
          position: absolute;
          font-size: 0.875rem;
          font-weight: bold;
          color: #007bff;
        }
        
        .upload-progress p {
          margin: 0;
          color: #666;
        }
      `}</style>
    </div>
  )
}

export default PhotoUpload
