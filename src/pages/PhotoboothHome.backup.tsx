import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import CameraPreview from '../components/CameraPreview'
import { Image, Settings, Home } from '../components/icons'
import { usePhotos } from '../contexts/PhotoContext'
import type { Photo, CameraSettings, CaptureResult } from '../types'

const PhotoboothHome: React.FC = () => {
  const { photos, addPhoto } = usePhotos()
  const [lastPhoto, setLastPhoto] = useState<Photo | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  const cameraSettings: CameraSettings = {
    width: 1280,
    height: 720,
    timerEnabled: false,
    timerDuration: 3
  }

  const handlePhotoCapture = (result: CaptureResult) => {
    if (result.success && result.photo) {
      // Add photo to global state (will automatically save to localStorage)
      addPhoto(result.photo)
      setLastPhoto(result.photo)
      
      // Auto-hide preview after capture for a moment
      setShowPreview(false)
      setTimeout(() => setShowPreview(true), 3000)
    } else {
      alert(`Capture failed: ${result.error}`)
    }
  }

  return (
    <div className="photobooth-home">
      <header className="photobooth-header">
        <h1>📸 React Photobooth</h1>
        <nav className="navigation">
          <Link to="/" className="nav-link">
            <Home size={20} />
            Home
          </Link>
          <Link to="/gallery" className="nav-link">
            <Image size={20} />
            Gallery ({photos.length})
          </Link>
          <Link to="/admin" className="nav-link">
            <Settings size={20} />
            Admin
          </Link>
        </nav>
      </header>

      <main className="photobooth-main">
        {showPreview ? (
          <div className="camera-section">
            <CameraPreview 
              settings={cameraSettings} 
              onCapture={handlePhotoCapture}
            />
          </div>
        ) : (
          <div className="photo-result">
            <h2>📷 Photo Captured!</h2>
            {lastPhoto && (
              <div className="captured-photo">
                <img src={lastPhoto.url} alt="Captured" />
                <p>Saved as: {lastPhoto.filename}</p>
              </div>
            )}
            <button 
              onClick={() => setShowPreview(true)}
              className="back-to-camera-btn"
            >
              Take Another Photo
            </button>
          </div>
        )}

        {photos.length > 0 && (
          <div className="recent-photos">
            <h3>Recent Photos</h3>
            <div className="photo-thumbnails">
              {photos.slice(0, 5).map(photo => (
                <div key={photo.id} className="thumbnail">
                  <img src={photo.thumbnail} alt={photo.filename} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="photobooth-footer">
        <p>Modern React Photobooth • Built with Vite + TypeScript</p>
      </footer>
    </div>
  )
}

export default PhotoboothHome
