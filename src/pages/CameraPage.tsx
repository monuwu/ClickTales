import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, ArrowLeft, RotateCcw, Timer as TimerIcon, Palette } from '../components/icons'
import Timer from '../components/Timer'
import Filters, { type Filter, filters } from '../components/Filters'
import CameraPermissionHelper from '../components/CameraPermissionHelper'
import { usePhotos } from '../contexts/PhotoContext'

const CameraPage: React.FC = () => {
  const navigate = useNavigate()
  const { addPhoto } = usePhotos()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  
  // New state for features
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<Filter>(filters[0])
  const [timerDuration] = useState(3)
  const [showPermissionHelper, setShowPermissionHelper] = useState(false)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsLoading(false)
      }
    } catch (err) {
      const error = err as Error
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Camera access denied. Click below to enable camera permissions.')
        setShowPermissionHelper(true)
      } else {
        setError('Unable to access camera. Please check your camera and try again.')
      }
      setIsLoading(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Apply filter to canvas context
    ctx.filter = selectedFilter.cssFilter || 'none'

    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Reset filter
    ctx.filter = 'none'

    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    
    // Create photo object and add to gallery
    const photo = {
      id: Date.now().toString(),
      url: imageData,
      thumbnail: imageData,
      timestamp: new Date(),
      filename: `photo-${Date.now()}.jpg`,
      filter: selectedFilter.id
    }
    
    addPhoto(photo)
    
    // Navigate to preview with image data
    navigate('/preview', { state: { imageData, filter: selectedFilter.id } })
  }

  const handleCaptureClick = () => {
    if (timerEnabled) {
      setShowTimer(true)
    } else {
      capturePhoto()
    }
  }

  const handleTimerComplete = () => {
    setShowTimer(false)
    capturePhoto()
  }

  const handleTimerCancel = () => {
    setShowTimer(false)
  }

  const handleFilterSelect = (filter: Filter) => {
    setSelectedFilter(filter)
  }

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
  }

  const handlePermissionRequest = () => {
    setShowPermissionHelper(false)
    setError(null)
    startCamera()
  }

  const handleEnableCameraClick = () => {
    if (error && error.includes('denied')) {
      setShowPermissionHelper(true)
    } else {
      startCamera()
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-lg border-b border-purple-200/30 shadow-lg flex-shrink-0"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Back</span>
        </button>
        
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          ClickTales Camera
        </h1>
        
        <button
          onClick={toggleCamera}
          className="p-2 text-gray-700 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-100/50"
          title="Switch Camera"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Camera Container */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-4xl aspect-video bg-white/70 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-700 text-lg font-medium">Starting camera...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm">
              <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-red-200 shadow-xl max-w-md mx-4">
                <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 text-lg mb-6 font-medium">{error}</p>
                <div className="space-y-3">
                  {error.includes('denied') || error.includes('permissions') ? (
                    <button
                      onClick={handleEnableCameraClick}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Enable Camera Access
                    </button>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ filter: selectedFilter.cssFilter || 'none' }}
          />

          {/* Camera overlay effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-400/70"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-400/70"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-400/70"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-400/70"></div>
            
            {/* Center focus indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 border-2 border-purple-500/80 rounded-full animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center p-8 bg-white/80 backdrop-blur-lg border-t border-purple-200/30 shadow-lg flex-shrink-0"
      >
        <div className="flex items-center gap-8">
          {/* Timer Button */}
          <button 
            onClick={() => setTimerEnabled(!timerEnabled)}
            className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
              timerEnabled 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/30' 
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-purple-100/70 border border-purple-200/30'
            }`}
            title={timerEnabled ? `Timer: ${timerDuration}s` : 'Enable Timer'}
          >
            <TimerIcon className="w-6 h-6" />
          </button>

          {/* Filters Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
              showFilters 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/30' 
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-purple-100/70 border border-purple-200/30'
            }`}
          >
            <Palette className="w-6 h-6" />
          </button>

          {/* Capture Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCaptureClick}
            disabled={isLoading || !!error}
            className="relative w-20 h-20 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 rounded-full shadow-2xl transition-all duration-300 disabled:cursor-not-allowed group"
          >
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center group-hover:bg-gray-50 transition-colors shadow-inner">
              <Camera className="w-8 h-8 text-gray-700" />
            </div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-30"></div>
          </motion.button>

          {/* Gallery Button */}
          <button 
            onClick={() => navigate('/gallery')}
            className="p-4 bg-white/70 backdrop-blur-sm hover:bg-purple-100/70 rounded-2xl transition-all duration-300 shadow-lg border border-purple-200/30 text-gray-700 hover:text-purple-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Filters Component */}
      <Filters 
        selectedFilter={selectedFilter.id}
        onFilterSelect={handleFilterSelect}
        isVisible={showFilters}
      />

      {/* Timer Component */}
      <Timer 
        duration={timerDuration}
        onComplete={handleTimerComplete}
        isActive={showTimer}
        onCancel={handleTimerCancel}
      />

      {/* Camera Permission Helper */}
      <CameraPermissionHelper
        isVisible={showPermissionHelper}
        onRequestPermission={handlePermissionRequest}
        onClose={() => setShowPermissionHelper(false)}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default CameraPage
