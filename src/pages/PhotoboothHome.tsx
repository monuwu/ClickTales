import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Image, 
  Settings, 
  Grid3X3, 
  Download,
  Share2,
  Zap,
  Filter,
  Sparkles,
  Users,
  Heart,
  Play,
  Pause
} from '../components/icons'
import Navigation from '../components/Navigation'
import CameraPreview from '../components/CameraPreview'
import { usePhotos } from '../contexts/PhotoContext'
import type { Photo, CameraSettings, CaptureResult } from '../types'

const PhotoboothHome: React.FC = () => {
  const { photos, addPhoto } = usePhotos()
  const [lastPhoto, setLastPhoto] = useState<Photo | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'photo' | 'collage' | 'burst'>('photo')

  const cameraSettings: CameraSettings = {
    width: 1280,
    height: 720,
    timerEnabled: false,
    timerDuration: 3
  }

  const handlePhotoCapture = (result: CaptureResult) => {
    if (result.success && result.imageData) {
      // Create a photo object from the captured data
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: result.imageData,
        thumbnail: result.imageData,
        timestamp: new Date(),
        filename: `photo_${Date.now()}.jpg`
      }
      
      addPhoto(newPhoto)
      setLastPhoto(newPhoto)
      setShowPreview(false)
      setTimeout(() => setShowPreview(true), 3000)
    } else {
      alert(`Capture failed: ${result.error}`)
    }
  }

  const modes = [
    { 
      id: 'photo', 
      name: 'Single Photo', 
      icon: Camera, 
      description: 'Take a perfect shot',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'collage', 
      name: 'Photo Collage', 
      icon: Grid3X3, 
      description: 'Create a story',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'burst', 
      name: 'Burst Mode', 
      icon: Zap, 
      description: 'Capture the moment',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const features = [
    { 
      icon: Filter, 
      title: 'Live Filters', 
      description: 'Apply real-time effects',
      link: '/demo'
    },
    { 
      icon: Share2, 
      title: 'Instant Share', 
      description: 'Share to social media',
      link: '/demo'
    },
    { 
      icon: Download, 
      title: 'High Quality', 
      description: 'Download in HD',
      link: '/gallery'
    },
    { 
      icon: Sparkles, 
      title: 'AI Enhancement', 
      description: 'Auto-enhance photos',
      link: '/demo'
    }
  ]

  return (
    <div className="min-h-screen bg-white font-inter">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Camera Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Camera Preview - Takes 2 columns */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-poppins font-bold text-gray-900">Live Preview</h2>
                  <p className="text-gray-600">Position yourself and get ready for the perfect shot</p>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </motion.button>
                  <Link to="/settings">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                    >
                      <Settings className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </div>

              {showPreview ? (
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <CameraPreview 
                    settings={cameraSettings} 
                    onCapture={handlePhotoCapture}
                  />
                  
                  {/* Camera Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full border-4 border-white shadow-xl flex items-center justify-center hover:bg-white transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Photo Captured!</h3>
                  {lastPhoto && (
                    <div className="max-w-sm mx-auto mb-4">
                      <img 
                        src={lastPhoto.url} 
                        alt="Captured" 
                        className="w-full rounded-xl shadow-lg"
                      />
                      <p className="text-sm text-gray-600 mt-2">Saved as: {lastPhoto.filename}</p>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPreview(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                  >
                    Take Another Photo
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Mode Selection & Stats */}
          <div className="space-y-6">
            {/* Mode Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Capture Mode</h3>
              <div className="space-y-3">
                {modes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMode(mode.id as any)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedMode === mode.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${mode.color}`}>
                        <mode.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{mode.name}</h4>
                        <p className="text-sm text-gray-600">{mode.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Photos Taken</span>
                  </div>
                  <span className="font-bold text-purple-600">{photos.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Sessions</span>
                  </div>
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Favorites</span>
                  </div>
                  <span className="font-bold text-red-600">0</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-6 text-center">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 text-center hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Photos */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-poppins font-bold text-gray-900">Recent Photos</h3>
                <p className="text-gray-600">Your latest captures</p>
              </div>
              <Link
                to="/gallery"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {photos.slice(0, 10).map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <img 
                    src={photo.thumbnail} 
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {photos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Camera className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Photo Journey</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Take your first photo to begin creating amazing memories with our modern photobooth experience.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg font-medium"
            >
              Take Your First Photo
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PhotoboothHome
