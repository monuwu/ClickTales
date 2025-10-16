import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Users, Image, Settings, Play, RotateCcw, Download, Share, Heart } from '../components/icons'
import { useNavigate } from 'react-router-dom'
import CameraPreview from '../components/CameraPreview'
import { Navigation } from '../components'
import { useCamera } from '../hooks/useCamera'
import { usePhotos } from '../contexts/PhotoContext'

const PhotoboothHome = () => {
  const navigate = useNavigate()
  const { photos } = usePhotos()
  const [hasPhoto, setHasPhoto] = React.useState(false)
  const [capturedPhoto, setCapturedPhoto] = React.useState<string | null>(null)
  const [countdown, setCountdown] = React.useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0)

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
    }
  }

  const handleCollageAction = () => {
    navigate('/gallery', { state: { activeTab: 'albums' } })
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
    }
  }

  const handleSharePhoto = () => {
    if (capturedPhoto) {
      // Use Web Share API if available, otherwise fallback to download
      if (navigator.share) {
        // Convert data URL to blob for sharing
        fetch(capturedPhoto)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
            return navigator.share({
              title: 'ClickTales Photo',
              text: 'Check out this photo from ClickTales!',
              files: [file]
            })
          })
          .catch(() => handleDownloadPhoto()) // Fallback to download
      } else {
        // Fallback: trigger download
        handleDownloadPhoto()
      }
    }
  }

  const resetCapture = () => {
    setHasPhoto(false)
    setCapturedPhoto(null)
    setCountdown(0)
  }

  // Photo carousel functionality
  const recentPhotos = React.useMemo(() => photos.slice(-6), [photos])
  
  React.useEffect(() => {
    if (recentPhotos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % recentPhotos.length)
      }, 4000) // Change photo every 4 seconds
      return () => clearInterval(interval)
    }
  }, [recentPhotos.length])

  const handlePhotoCarouselClick = (index: number) => {
    setCurrentPhotoIndex(index)
  }

  const quickFeatures = [
    {
      icon: Camera,
      title: 'Camera',
      description: 'Take instant photos',
      action: () => navigate('/camera'),
      color: 'from-purple-400 to-pink-400',
      badge: 'Popular'
    },
    {
      icon: Users,
      title: 'Collage',
      description: 'Create photo collages',
      action: handleCollageAction,
      color: 'from-blue-400 to-purple-400',
      badge: 'Creative'
    },
    {
      icon: Image,
      title: 'Gallery',
      description: 'View all photos',
      action: () => navigate('/gallery'),
      color: 'from-green-400 to-blue-400',
      badge: 'Browse'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Configure photobooth',
      action: () => navigate('/admin'),
      color: 'from-orange-400 to-red-400',
      badge: 'Customize'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navigation />
      
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
          {/* Camera Section */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    Photo Booth
                  </h1>
                  <p className="text-slate-300 text-lg">Capture your perfect moment</p>
                </div>

                {/* Camera Preview */}
                <div className="relative bg-slate-800/50 rounded-2xl overflow-hidden aspect-video mb-6 border border-white/5">
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
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl"
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
                        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center rounded-2xl"
                      >
                        <img
                          src={capturedPhoto}
                          alt="Captured photo"
                          className="max-w-full max-h-full object-cover rounded-lg shadow-2xl"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Camera Controls */}
                <div className="flex justify-center items-center flex-wrap gap-4">
                  {!hasPhoto ? (
                    <>
                      {isStreaming && (
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleTakePhoto}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-semibold border border-white/20 hover:shadow-purple-500/25 shadow-xl transition-all duration-300 flex items-center space-x-2"
                        >
                          <Camera className="w-5 h-5" />
                          <span>Take Photo</span>
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/camera')}
                        className="bg-slate-700/50 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-semibold border border-white/10 hover:bg-slate-600/50 transition-all duration-300 flex items-center space-x-2"
                      >
                        <Play className="w-5 h-5" />
                        <span>Full Camera</span>
                      </motion.button>

                      {isStreaming && (
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={stopStream}
                          className="bg-red-500/20 backdrop-blur-sm text-red-400 px-6 py-4 rounded-2xl font-semibold border border-red-400/20 hover:bg-red-500/30 transition-all duration-300 flex items-center space-x-2"
                        >
                          <RotateCcw className="w-5 h-5" />
                          <span>Stop Camera</span>
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetCapture}
                        className="bg-slate-600/50 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 border border-white/10 hover:bg-slate-500/50 transition-all duration-300"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>Retake</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadPhoto}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 border border-white/20 hover:shadow-blue-500/25 shadow-xl transition-all duration-300"
                      >
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSharePhoto}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 border border-white/20 hover:shadow-green-500/25 shadow-xl transition-all duration-300"
                      >
                        <Share className="w-5 h-5" />
                        <span>Share</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 border border-white/20 hover:shadow-red-500/25 shadow-xl transition-all duration-300"
                      >
                        <Heart className="w-5 h-5" />
                        <span>Save</span>
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Recent Gallery and Quick Actions */}
          <div className="space-y-6">
            {/* Recent Gallery Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Recent Gallery</h2>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/gallery')}
                    className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors duration-200"
                  >
                    View All
                  </motion.button>
                </div>

                {recentPhotos.length > 0 ? (
                  <div className="space-y-4">
                    {/* Photo Carousel */}
                    <div className="relative h-40 bg-slate-800/30 rounded-2xl overflow-hidden border border-white/5">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentPhotoIndex}
                          src={recentPhotos[currentPhotoIndex]?.url}
                          alt={`Recent photo ${currentPhotoIndex + 1}`}
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.5 }}
                        />
                      </AnimatePresence>
                      
                      {/* Photo metadata overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <div className="text-white text-xs">
                          <p className="font-medium">
                            {recentPhotos[currentPhotoIndex]?.timestamp.toLocaleDateString()}
                          </p>
                          <p className="text-slate-300">
                            Photo {currentPhotoIndex + 1} of {recentPhotos.length}
                          </p>
                        </div>
                      </div>

                      {/* Navigation dots */}
                      {recentPhotos.length > 1 && (
                        <div className="absolute bottom-3 right-3 flex space-x-1">
                          {recentPhotos.map((_, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handlePhotoCarouselClick(index)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === currentPhotoIndex 
                                  ? 'bg-white' 
                                  : 'bg-white/40 hover:bg-white/60'
                              }`}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-800/30 rounded-xl p-3 border border-white/5">
                        <p className="text-2xl font-bold text-white">{photos.length}</p>
                        <p className="text-xs text-slate-400">Total Photos</p>
                      </div>
                      <div className="bg-slate-800/30 rounded-xl p-3 border border-white/5">
                        <p className="text-2xl font-bold text-green-400">
                          {isStreaming ? 'Active' : 'Inactive'}
                        </p>
                        <p className="text-xs text-slate-400">Camera Status</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-2xl flex items-center justify-center">
                      <Image className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400 mb-4">No photos yet</p>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/camera')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl text-sm font-medium border border-white/20 hover:shadow-purple-500/25 shadow-lg transition-all duration-300"
                    >
                      Take Your First Photo
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Quick Actions</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {quickFeatures.map((feature, index) => (
                    <motion.button
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={feature.action}
                      className="group/btn relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-white/5 hover:border-white/20 transition-all duration-300 flex items-center space-x-4"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover/btn:shadow-xl transition-shadow duration-300`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                        <p className="text-xs text-slate-400">{feature.description}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${feature.color} text-white font-medium opacity-80`}>
                        {feature.badge}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoboothHome
