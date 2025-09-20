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
    <div className="absolute inset-0 w-full h-full">
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg">
              <p>Camera Error: {error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CameraPreview
