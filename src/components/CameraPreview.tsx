import React from 'react'
import { useCamera } from '../hooks/useCamera'
import type { CameraSettings } from '../types'

interface CameraPreviewProps {
  settings: CameraSettings
  onCapture?: (result: any) => void
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ settings, onCapture }) => {
  const {
    videoRef,
    isStreaming,
    error,
    startStream,
    stopStream,
    capturePhoto
  } = useCamera(settings)

  const handleCapture = () => {
    const result = capturePhoto()
    if (onCapture) {
      onCapture(result)
    }
  }

  return (
    <div className="camera-preview">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        {error && (
          <div className="error-overlay">
            <p>Camera Error: {error}</p>
          </div>
        )}
      </div>
      
      <div className="camera-controls">
        {!isStreaming ? (
          <button 
            onClick={startStream}
            className="control-btn start-btn"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button 
              onClick={handleCapture}
              className="control-btn capture-btn"
            >
              📸 Take Photo
            </button>
            <button 
              onClick={stopStream}
              className="control-btn stop-btn"
            >
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CameraPreview
