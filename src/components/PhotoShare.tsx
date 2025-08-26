import React, { useState } from 'react'
import type { Photo } from '../types'

interface PhotoShareProps {
  photo: Photo
  onClose?: () => void
}

const PhotoShare: React.FC<PhotoShareProps> = ({ photo, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [shareMethod, setShareMethod] = useState<string>('')

  const downloadPhoto = async () => {
    setIsDownloading(true)
    
    try {
      // Create a link element and trigger download
      const link = document.createElement('a')
      link.href = photo.url
      link.download = photo.filename || `photo-${photo.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download photo:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const shareToSocialMedia = (platform: string) => {
    setShareMethod(platform)
    
    // Convert image to data URL for sharing
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      
      switch (platform) {
        case 'facebook':
          shareToFacebook(dataUrl)
          break
        case 'twitter':
          shareToTwitter(dataUrl)
          break
        case 'instagram':
          shareToInstagram(dataUrl)
          break
        case 'email':
          shareViaEmail(dataUrl)
          break
        default:
          console.warn('Unknown sharing platform:', platform)
      }
      
      setShareMethod('')
    }
    
    img.crossOrigin = 'anonymous'
    img.src = photo.url
  }

  const shareToFacebook = (_dataUrl: string) => {
    const text = encodeURIComponent('Check out this photo from our photobooth!')
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`
    openShareWindow(url)
  }

  const shareToTwitter = (_dataUrl: string) => {
    const text = encodeURIComponent('Check out this awesome photobooth photo! 📸')
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`
    openShareWindow(url)
  }

  const shareToInstagram = (dataUrl: string) => {
    // Instagram doesn't support direct web sharing, so we'll copy the image and show instructions
    copyImageToClipboard(dataUrl)
    alert('Image copied to clipboard! You can now paste it into Instagram.')
  }

  const shareViaEmail = (_dataUrl: string) => {
    const subject = encodeURIComponent('Check out this photobooth photo!')
    const body = encodeURIComponent(`Hi! I wanted to share this fun photo from our photobooth session. Check it out!\n\nTaken on: ${photo.timestamp.toLocaleDateString()}`)
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    window.location.href = mailtoUrl
  }

  const copyImageToClipboard = async (dataUrl: string) => {
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error)
    }
  }

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const openShareWindow = (url: string) => {
    window.open(url, 'share', 'width=600,height=400,scrollbars=yes,resizable=yes')
  }

  const getPhotoInfo = () => {
    return {
      filename: photo.filename,
      timestamp: photo.timestamp.toLocaleString(),
      filter: photo.filter || 'None',
      id: photo.id
    }
  }

  const photoInfo = getPhotoInfo()

  return (
    <div className="photo-share-overlay">
      <div className="photo-share-modal">
        <div className="photo-share-header">
          <h3>Share Photo</h3>
          {onClose && (
            <button onClick={onClose} className="close-btn">×</button>
          )}
        </div>
        
        <div className="photo-share-content">
          <div className="photo-preview">
            <img src={photo.thumbnail || photo.url} alt="Photo to share" />
            <div className="photo-info">
              <p><strong>Filename:</strong> {photoInfo.filename}</p>
              <p><strong>Taken:</strong> {photoInfo.timestamp}</p>
              <p><strong>Filter:</strong> {photoInfo.filter}</p>
            </div>
          </div>
          
          <div className="share-options">
            <div className="option-group">
              <h4>Download</h4>
              <button 
                onClick={downloadPhoto} 
                disabled={isDownloading}
                className="download-btn"
              >
                {isDownloading ? (
                  <>
                    <span className="spinner"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Photo
                  </>
                )}
              </button>
            </div>
            
            <div className="option-group">
              <h4>Share on Social Media</h4>
              <div className="social-buttons">
                <button 
                  onClick={() => shareToSocialMedia('facebook')}
                  className="social-btn facebook"
                  disabled={shareMethod === 'facebook'}
                >
                  📘 Facebook
                </button>
                <button 
                  onClick={() => shareToSocialMedia('twitter')}
                  className="social-btn twitter"
                  disabled={shareMethod === 'twitter'}
                >
                  🐦 Twitter
                </button>
                <button 
                  onClick={() => shareToSocialMedia('instagram')}
                  className="social-btn instagram"
                  disabled={shareMethod === 'instagram'}
                >
                  📷 Instagram
                </button>
              </div>
            </div>
            
            <div className="option-group">
              <h4>Other Options</h4>
              <div className="other-buttons">
                <button 
                  onClick={() => shareToSocialMedia('email')}
                  className="other-btn"
                >
                  📧 Email
                </button>
                <button 
                  onClick={copyLinkToClipboard}
                  className="other-btn"
                >
                  🔗 Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .photo-share-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .photo-share-modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .photo-share-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .photo-share-header h3 {
          margin: 0;
          color: #333;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          color: #666;
        }
        
        .close-btn:hover {
          color: #333;
        }
        
        .photo-share-content {
          padding: 1.5rem;
        }
        
        .photo-preview {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .photo-preview img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        
        .photo-info {
          flex: 1;
        }
        
        .photo-info p {
          margin: 0.5rem 0;
          font-size: 0.875rem;
          color: #666;
        }
        
        .option-group {
          margin-bottom: 2rem;
        }
        
        .option-group h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }
        
        .download-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .download-btn:hover:not(:disabled) {
          background: #0056b3;
        }
        
        .download-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .social-buttons, .other-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .social-btn, .other-btn {
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        
        .social-btn:hover:not(:disabled), .other-btn:hover {
          border-color: #007bff;
          color: #007bff;
        }
        
        .social-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .facebook:hover:not(:disabled) {
          border-color: #1877f2;
          color: #1877f2;
        }
        
        .twitter:hover:not(:disabled) {
          border-color: #1da1f2;
          color: #1da1f2;
        }
        
        .instagram:hover:not(:disabled) {
          border-color: #e4405f;
          color: #e4405f;
        }
      `}</style>
    </div>
  )
}

export default PhotoShare
