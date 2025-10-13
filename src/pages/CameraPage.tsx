import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ArrowLeft, RotateCcw, Timer as TimerIcon, Palette, Sparkles, Settings, Download, Grid } from '../components/icons'
import { usePhotos } from '../contexts/PhotoContext'
import { useNotifications } from '../contexts/NotificationContext'
import Timer from '../components/Timer'
import { Filters } from '../components'
import type { Filter } from '../components/Filters'
import { filters, EnhancementPanel, type EnhancementValues } from '../components/Filters'
import CameraPermissionHelper from '../components/CameraPermissionHelper'
import { enhanceCanvasInPlace } from '../utils/enhanceImage'

const CameraPage: React.FC = () => {
  const navigate = useNavigate()
  const { addPhoto } = usePhotos()
  const { addNotification } = useNotifications()
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Camera state
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  
  // UI state
  const [showPermissionHelper, setShowPermissionHelper] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  
  // Timer state
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [timerDuration, setTimerDuration] = useState(3)
  
  // Filter and enhancement state
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<Filter>(filters[0])
  const [showEnhancePanel, setShowEnhancePanel] = useState(false)
  const [enhanceValues, setEnhanceValues] = useState<EnhancementValues>({
    brightness: 1.0,
    contrast: 1.12,
    saturation: 1.08,
    shadows: 0.0,
    sharpness: 0.55,
    smoothing: 0.12,
  })
  
  // Photo state
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [showPhotoGrid, setShowPhotoGrid] = useState(false)
  
  // Settings
  const [cameraSettings, setCameraSettings] = useState({
    resolution: 'hd', // 'sd', 'hd', 'fullhd'
    quality: 0.9,
    gridLines: false,
    autoSave: true,
    flashEnabled: false
  })

  // Initialize camera on mount and when facingMode changes
  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode, cameraSettings.resolution])

  // Real-time filter rendering
  useEffect(() => {
    let animationFrame = 0
    
    const renderFrame = () => {
      const video = videoRef.current
      const overlay = overlayCanvasRef.current
      const ctx = overlay?.getContext('2d', { willReadFrequently: true })
      
      if (!video || !overlay || !ctx || isLoading || error) {
        animationFrame = requestAnimationFrame(renderFrame)
        return
      }

      if (video.videoWidth && video.videoHeight) {
        // Update canvas dimensions if needed
        if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
          overlay.width = video.videoWidth
          overlay.height = video.videoHeight
        }

        // Clear and draw video frame
        ctx.clearRect(0, 0, overlay.width, overlay.height)
        
        // Apply CSS filter first
        if (selectedFilter.cssFilter && selectedFilter.cssFilter !== 'none') {
          ctx.filter = selectedFilter.cssFilter
        }
        
        ctx.drawImage(video, 0, 0, overlay.width, overlay.height)
        ctx.filter = 'none'

        // Apply enhancements if panel is open
        if (showEnhancePanel) {
          try {
            enhanceCanvasInPlace(ctx, overlay.width, overlay.height, enhanceValues)
          } catch (error) {
            console.warn('Enhancement failed:', error)
          }
        }

        // Draw grid lines if enabled
        if (cameraSettings.gridLines) {
          drawGridLines(ctx, overlay.width, overlay.height)
        }
      }

      animationFrame = requestAnimationFrame(renderFrame)
    }

    animationFrame = requestAnimationFrame(renderFrame)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [selectedFilter, showEnhancePanel, enhanceValues, cameraSettings.gridLines, isLoading, error])

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const resetTimeout = () => {
      clearTimeout(timeout)
      setShowControls(true)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const handleActivity = () => {
      if (!showTimer && !showSettings) {
        resetTimeout()
      }
    }

    document.addEventListener('mousemove', handleActivity)
    document.addEventListener('touchstart', handleActivity)
    
    // Initial timeout
    resetTimeout()

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousemove', handleActivity)
      document.removeEventListener('touchstart', handleActivity)
    }
  }, [showTimer, showSettings])

  const getResolutionConstraints = (resolution: string) => {
    switch (resolution) {
      case 'sd':
        return { width: { ideal: 640 }, height: { ideal: 480 } }
      case 'hd':
        return { width: { ideal: 1280 }, height: { ideal: 720 } }
      case 'fullhd':
        return { width: { ideal: 1920 }, height: { ideal: 1080 } }
      default:
        return { width: { ideal: 1280 }, height: { ideal: 720 } }
    }
  }

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          ...getResolutionConstraints(cameraSettings.resolution),
          facingMode: facingMode
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsLoading(false)
        
        addNotification({
          type: 'success',
          title: 'Camera ready',
          message: 'Camera initialized successfully!'
        })
      }
    } catch (err) {
      const error = err as Error
      let errorMessage = 'Unable to access camera. Please check your camera and try again.'
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access denied. Please enable camera permissions.'
        setShowPermissionHelper(true)
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.'
      }
      
      setError(errorMessage)
      setIsLoading(false)
      
      addNotification({
        type: 'error',
        title: 'Camera Error',
        message: errorMessage
      })
    }
  }

  const drawGridLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(width / 3, 0)
    ctx.lineTo(width / 3, height)
    ctx.moveTo((2 * width) / 3, 0)
    ctx.lineTo((2 * width) / 3, height)
    ctx.stroke()

    // Horizontal lines
    ctx.beginPath()
    ctx.moveTo(0, height / 3)
    ctx.lineTo(width, height / 3)
    ctx.moveTo(0, (2 * height) / 3)
    ctx.lineTo(width, (2 * height) / 3)
    ctx.stroke()

    ctx.setLineDash([])
  }

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const overlay = overlayCanvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Get the processed frame from overlay canvas
      ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height)

      // Convert to data URL with quality setting
      const imageData = canvas.toDataURL('image/jpeg', cameraSettings.quality)
      
      // Create photo object
      const photo = {
        id: `photo-${Date.now()}`,
        url: imageData,
        thumbnail: imageData,
        timestamp: new Date(),
        filename: `photo-${Date.now()}.jpg`,
        filter: selectedFilter.id,
        settings: {
          filter: selectedFilter.id,
          enhancements: showEnhancePanel ? enhanceValues : undefined,
          resolution: cameraSettings.resolution,
          quality: cameraSettings.quality
        }
      }

      // Add to photo context if auto-save is enabled
      if (cameraSettings.autoSave) {
        addPhoto(photo)
        addNotification({
          type: 'success',
          title: 'Photo captured!',
          message: 'Photo saved to your gallery successfully.',
          action: {
            label: 'View Gallery',
            onClick: () => navigate('/gallery')
          }
        })
      } else {
        // Add to session photos for preview
        setCapturedPhotos(prev => [imageData, ...prev])
        addNotification({
          type: 'success',
          title: 'Photo captured!',
          message: 'Photo ready for preview. Save or discard below.'
        })
      }

      // Flash effect
      if (cameraSettings.flashEnabled) {
        const flashDiv = document.createElement('div')
        flashDiv.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 9999;
          opacity: 0.8;
          pointer-events: none;
        `
        document.body.appendChild(flashDiv)
        setTimeout(() => document.body.removeChild(flashDiv), 100)
      }

    } catch (error) {
      console.error('Photo capture failed:', error)
      addNotification({
        type: 'error',
        title: 'Capture failed',
        message: 'Failed to capture photo. Please try again.'
      })
    }
  }, [videoRef, canvasRef, overlayCanvasRef, selectedFilter, showEnhancePanel, enhanceValues, cameraSettings, addPhoto, addNotification, navigate])

  const handleCaptureClick = () => {
    if (timerEnabled) {
      setShowTimer(true)
    } else {
      capturePhoto()
    }
  }

  const handleTimerComplete = useCallback(() => {
    setShowTimer(false)
    // Use setTimeout to defer the capture to the next tick
    setTimeout(() => {
      capturePhoto()
    }, 0)
  }, [capturePhoto])

  const handleTimerCancel = useCallback(() => {
    setShowTimer(false)
  }, [])

  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
    addNotification({
      type: 'info',
      title: 'Switching camera',
      message: `Switching to ${facingMode === 'user' ? 'back' : 'front'} camera...`
    })
  }

  const downloadPhoto = (imageData: string) => {
    const link = document.createElement('a')
    link.href = imageData
    link.download = `photo-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    addNotification({
      type: 'success',
      title: 'Photo downloaded',
      message: 'Photo downloaded to your device successfully.'
    })
  }

  const savePhoto = (imageData: string) => {
    const photo = {
      id: `photo-${Date.now()}`,
      url: imageData,
      thumbnail: imageData,
      timestamp: new Date(),
      filename: `photo-${Date.now()}.jpg`,
      filter: selectedFilter.id
    }
    
    addPhoto(photo)
    setCapturedPhotos(prev => prev.filter(p => p !== imageData))
    
    addNotification({
      type: 'success',
      title: 'Photo saved!',
      message: 'Photo added to your gallery.'
    })
  }

  const discardPhoto = (imageData: string) => {
    setCapturedPhotos(prev => prev.filter(p => p !== imageData))
    addNotification({
      type: 'info',
      title: 'Photo discarded',
      message: 'Photo removed from session.'
    })
  }

  if (showPermissionHelper) {
    return (
      <CameraPermissionHelper 
        onRequestPermission={() => startCamera()}
        isVisible={true}
        onClose={() => setShowPermissionHelper(false)}
      />
    )
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Video Stream */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10"
          >
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg">Starting camera...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10"
          >
            <div className="text-center text-white max-w-md px-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Camera Error</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Main video element */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />

        {/* Overlay canvas for real-time effects */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={previewCanvasRef} className="hidden" />
      </div>

      {/* Timer Overlay */}
      <AnimatePresence>
        {showTimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
          >
            <Timer
              duration={timerDuration}
              isActive={true}
              onComplete={handleTimerComplete}
              onCancel={handleTimerCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Controls */}
      <AnimatePresence>
        {showControls && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 z-30 p-4"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPhotoGrid(!showPhotoGrid)}
                  className={`p-3 backdrop-blur-sm text-white rounded-full transition-colors ${
                    capturedPhotos.length > 0
                      ? 'bg-purple-500/80 hover:bg-purple-600/80'
                      : 'bg-black/50 hover:bg-black/70'
                  }`}
                >
                  <Grid className="w-6 h-6" />
                  {capturedPhotos.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {capturedPhotos.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-0 left-0 right-0 z-30 p-6"
          >
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-4 backdrop-blur-sm text-white rounded-full transition-colors ${
                    showFilters ? 'bg-purple-500/80' : 'bg-black/50 hover:bg-black/70'
                  }`}
                >
                  <Palette className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setShowEnhancePanel(!showEnhancePanel)}
                  className={`p-4 backdrop-blur-sm text-white rounded-full transition-colors ${
                    showEnhancePanel ? 'bg-purple-500/80' : 'bg-black/50 hover:bg-black/70'
                  }`}
                >
                  <Sparkles className="w-6 h-6" />
                </button>
              </div>

              {/* Center Capture Button */}
              <motion.button
                onClick={handleCaptureClick}
                className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                {timerEnabled && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <TimerIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.button>

              {/* Right Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTimerEnabled(!timerEnabled)}
                  className={`p-4 backdrop-blur-sm text-white rounded-full transition-colors ${
                    timerEnabled ? 'bg-yellow-500/80' : 'bg-black/50 hover:bg-black/70'
                  }`}
                >
                  <TimerIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={toggleCamera}
                  className="p-4 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-32 left-0 right-0 z-40"
          >
            <Filters
              onFilterSelect={setSelectedFilter}
              selectedFilter={selectedFilter.id}
              isVisible={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhancement Panel */}
      <AnimatePresence>
        {showEnhancePanel && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-20 right-4 bottom-32 z-40"
          >
            <EnhancementPanel
              values={enhanceValues}
              onChange={setEnhanceValues}
              isVisible={true}
              onClose={() => setShowEnhancePanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute top-20 left-4 right-4 z-40"
          >
            <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="text-white text-lg font-semibold mb-4">Camera Settings</h3>
              
              <div className="space-y-4">
                {/* Resolution */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Resolution</label>
                  <select
                    value={cameraSettings.resolution}
                    onChange={(e) => setCameraSettings(prev => ({ ...prev, resolution: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  >
                    <option value="sd">SD (640x480)</option>
                    <option value="hd">HD (1280x720)</option>
                    <option value="fullhd">Full HD (1920x1080)</option>
                  </select>
                </div>

                {/* Photo Quality */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Photo Quality ({Math.round(cameraSettings.quality * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.1"
                    value={cameraSettings.quality}
                    onChange={(e) => setCameraSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Timer Duration */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Timer Duration ({timerDuration}s)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between text-white">
                    <span>Grid Lines</span>
                    <input
                      type="checkbox"
                      checked={cameraSettings.gridLines}
                      onChange={(e) => setCameraSettings(prev => ({ ...prev, gridLines: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between text-white">
                    <span>Auto Save</span>
                    <input
                      type="checkbox"
                      checked={cameraSettings.autoSave}
                      onChange={(e) => setCameraSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between text-white">
                    <span>Flash Effect</span>
                    <input
                      type="checkbox"
                      checked={cameraSettings.flashEnabled}
                      onChange={(e) => setCameraSettings(prev => ({ ...prev, flashEnabled: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Grid Panel */}
      <AnimatePresence>
        {showPhotoGrid && capturedPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-20 right-4 bottom-32 w-80 z-40"
          >
            <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 h-full">
              <h3 className="text-white text-lg font-semibold mb-4">Session Photos</h3>
              
              <div className="grid grid-cols-2 gap-2 max-h-full overflow-y-auto">
                {capturedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Captured ${index}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadPhoto(photo)}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => savePhoto(photo)}
                          className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => discardPhoto(photo)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CameraPage