import React, { useEffect } from 'react'
import { useCamera } from '../hooks/useCamera'
import type { CameraSettings } from '../types'

interface CameraPreviewProps {
  settings: CameraSettings
  onCapture?: (result: any) => void
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ settings, onCapture }) => {
  const {
    videoRef,
    error,
    startStream
  } = useCamera(settings)

  // Auto-start camera when component mounts
  useEffect(() => {
    startStream()
  }, [startStream])

  // Handle capture callback
  React.useEffect(() => {
    if (onCapture) {
      // This component now just displays the camera
      // Capture functionality is handled by PhotoboothHome
    }
  }, [onCapture])

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
    </div>
  )
}

export default CameraPreview
