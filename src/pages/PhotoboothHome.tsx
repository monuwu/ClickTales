import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Users, Image, Timer, Settings, Play, Pause, RotateCcw, Download, Share, Heart } from '../components/icons'
import { useNavigate } from 'react-router-dom'
import CameraPreview from '../components/CameraPreview'
import Navigation from '../components/Navigation'

const PhotoboothHome = () => {
  const navigate = useNavigate()
  const [isCapturing, setIsCapturing] = React.useState(false)
  const [hasPhoto, setHasPhoto] = React.useState(false)
  const [capturedPhoto, setCapturedPhoto] = React.useState<string | null>(null)
  const [countdown, setCountdown] = React.useState(0)

  // Default camera settings
  const defaultCameraSettings = {
    width: 1920,
    height: 1080,
    timerEnabled: true,
    timerDuration: 3
  }

  const startCapture = () => {
    setCountdown(3)
    setIsCapturing(true)
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          capturePhoto()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const capturePhoto = () => {
    // Simulate photo capture
    setTimeout(() => {
      setIsCapturing(false)
      setHasPhoto(true)
      // In a real app, this would be the actual captured photo
      setCapturedPhoto('/api/placeholder/400/300')
    }, 500)
  }

  const resetCapture = () => {
    setHasPhoto(false)
    setCapturedPhoto(null)
    setCountdown(0)
    setIsCapturing(false)
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
      action: () => navigate('/collage'),
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
                <CameraPreview settings={defaultCameraSettings} />
                
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startCapture}
                      disabled={isCapturing}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCapturing ? (
                        <>
                          <Pause className="w-6 h-6" />
                          <span>Capturing...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6" />
                          <span>Take Photo</span>
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/camera')}
                      className="bg-white/80 backdrop-blur-sm text-purple-600 px-6 py-4 rounded-2xl font-semibold border border-purple-200 hover:bg-white transition-all duration-200 flex items-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>Full Camera</span>
                    </motion.button>
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
                      className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Today's Stats</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">42</div>
                  <div className="text-sm text-gray-600 mt-1">Photos Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">8</div>
                  <div className="text-sm text-gray-600 mt-1">Collages Made</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">156</div>
                  <div className="text-sm text-gray-600 mt-1">Prints</div>
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
