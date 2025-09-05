import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Users, Image, Timer, Settings, Play, RotateCcw, Download, Share, Heart } from '../components/icons'
import { useNavigate } from 'react-router-dom'
import CameraPreview from '../components/CameraPreview'
import Navigation from '../components/Navigation'
import { useCamera } from '../hooks/useCamera'

const PhotoboothHome = () => {
  const navigate = useNavigate()
  const [hasPhoto, setHasPhoto] = React.useState(false)
  const [capturedPhoto, setCapturedPhoto] = React.useState<string | null>(null)
  const [countdown, setCountdown] = React.useState(0)
  
  // Live statistics state
  const [todaysStats, setTodaysStats] = React.useState<{
    photosTaken: number;
    collagesMade: number;
    prints: number;
  }>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('todaysStats')
    return saved ? JSON.parse(saved) : {
      photosTaken: 0,
      collagesMade: 0,
      prints: 0
    }
  })

  // Save stats to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('todaysStats', JSON.stringify(todaysStats))
  }, [todaysStats])

  // Default camera settings
  const defaultCameraSettings = {
    width: 1920,
    height: 1080,
    timerEnabled: true,
    timerDuration: 3
  }

  // Use camera hook for control buttons
  const {
    isStreaming,
    capturePhoto: captureFromCamera,
    stopStream
  } = useCamera(defaultCameraSettings)

  const handleTakePhoto = () => {
    const result = captureFromCamera()
    if (result.success && result.imageData) {
      setHasPhoto(true)
      setCapturedPhoto(result.imageData)
      // Increment photos taken counter
      setTodaysStats(prev => ({ 
        ...prev, 
        photosTaken: prev.photosTaken + 1 
      }))
    }
  }

  const handleCollageAction = () => {
    // Increment collages made counter
    setTodaysStats(prev => ({ 
      ...prev, 
      collagesMade: prev.collagesMade + 1 
    }))
    navigate('/collage')
  }

  const handleDownloadPhoto = () => {
    if (capturedPhoto) {
      // Create download link
      const link = document.createElement('a')
      link.href = capturedPhoto
      link.download = `photo-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Increment prints counter (downloads count as prints)
      setTodaysStats(prev => ({ 
        ...prev, 
        prints: prev.prints + 1 
      }))
    }
  }

  const handleSharePhoto = () => {
    // This could integrate with actual sharing APIs
    // For now, we'll just increment prints counter
    setTodaysStats(prev => ({ 
      ...prev, 
      prints: prev.prints + 1 
    }))
    // Add share functionality here
    alert('Photo shared! (Feature coming soon)')
  }

  const resetCapture = () => {
    setHasPhoto(false)
    setCapturedPhoto(null)
    setCountdown(0)
  }

  // Reset stats function (useful for testing or daily reset)
  const resetTodaysStats = () => {
    setTodaysStats({
      photosTaken: 0,
      collagesMade: 0,
      prints: 0
    })
  }

  const quickFeatures = [
    {
      icon: Camera,
      title: 'Camera',
      description: 'Take instant photos',
      action: () => navigate('/camera'),
      color: 'from-purple-400 to-pink-400'
    },
    {
      icon: Users,
      title: 'Collage',
      description: 'Create photo collages',
      action: handleCollageAction,
      color: 'from-blue-400 to-purple-400'
    },
    {
      icon: Image,
      title: 'Gallery',
      description: 'View all photos',
      action: () => navigate('/gallery'),
      color: 'from-green-400 to-blue-400'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Configure photobooth',
      action: () => navigate('/admin'),
      color: 'from-orange-400 to-red-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Navigation />
      
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Camera Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20"
            >
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Photo Booth
                </h1>
                <p className="text-gray-600 text-lg">Capture your perfect moment</p>
              </div>

              {/* Camera Preview */}
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video mb-6">
                <CameraPreview 
                  settings={defaultCameraSettings} 
                  onCapture={(result) => {
                    if (result.success) {
                      setHasPhoto(true)
                      setCapturedPhoto(result.imageData)
                    }
                  }}
                />
                
                {/* Countdown Overlay */}
                <AnimatePresence>
                  {countdown > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    >
                      <motion.div
                        key={countdown}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="text-8xl font-bold text-white"
                      >
                        {countdown}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Photo Capture Overlay */}
                <AnimatePresence>
                  {hasPhoto && capturedPhoto && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white flex items-center justify-center"
                    >
                      <img
                        src={capturedPhoto}
                        alt="Captured photo"
                        className="max-w-full max-h-full object-cover rounded-lg"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Camera Controls */}
              <div className="flex justify-center items-center space-x-4">
                {!hasPhoto ? (
                  <>
                    {isStreaming && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTakePhoto}
                        className="bg-white/80 backdrop-blur-sm text-purple-600 px-6 py-4 rounded-2xl font-semibold border border-purple-200 hover:bg-white transition-all duration-200 flex items-center space-x-2"
                      >
                        <Camera className="w-5 h-5" />
                        <span>Take Photo</span>
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/camera')}
                      className="bg-white/80 backdrop-blur-sm text-purple-600 px-6 py-4 rounded-2xl font-semibold border border-purple-200 hover:bg-white transition-all duration-200 flex items-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>Full Camera</span>
                    </motion.button>

                    {isStreaming && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopStream}
                        className="bg-white/80 backdrop-blur-sm text-red-600 px-6 py-4 rounded-2xl font-semibold border border-red-200 hover:bg-white transition-all duration-200 flex items-center space-x-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>Stop Camera</span>
                      </motion.button>
                    )}
                  </>
                ) : (
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetCapture}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Retake</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadPhoto}
                      className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSharePhoto}
                      className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2"
                    >
                      <Share className="w-5 h-5" />
                      <span>Share</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2"
                    >
                      <Heart className="w-5 h-5" />
                      <span>Save</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Actions</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {quickFeatures.map((feature, index) => (
                  <motion.button
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={feature.action}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                    
                    <div className="relative z-10 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl mb-3 shadow-lg`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">Today's Stats</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <button
                  onClick={resetTodaysStats}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                  title="Reset stats (for testing)"
                >
                  Reset
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <motion.div 
                    key={todaysStats.photosTaken}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    {todaysStats.photosTaken}
                  </motion.div>
                  <div className="text-sm text-gray-600 mt-1">Photos Taken</div>
                </div>
                <div className="text-center">
                  <motion.div 
                    key={todaysStats.collagesMade}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    {todaysStats.collagesMade}
                  </motion.div>
                  <div className="text-sm text-gray-600 mt-1">Collages Made</div>
                </div>
                <div className="text-center">
                  <motion.div 
                    key={todaysStats.prints}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                  >
                    {todaysStats.prints}
                  </motion.div>
                  <div className="text-sm text-gray-600 mt-1">Downloads & Shares</div>
                </div>
              </div>
            </motion.div>

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-3xl p-6 border border-purple-200/30"
            >
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                <Timer className="w-5 h-5 mr-2" />
                Pro Tip
              </h3>
              <p className="text-purple-700 text-sm leading-relaxed">
                For the best photos, make sure you're well-lit and positioned in the center of the frame. 
                The countdown gives you time to get ready for the perfect shot!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoboothHome
