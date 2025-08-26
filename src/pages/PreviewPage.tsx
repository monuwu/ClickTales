import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Share, Save } from '../components/icons'

interface LocationState {
  imageData: string
}

const PreviewPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  // If no image data, redirect to camera
  React.useEffect(() => {
    if (!state?.imageData) {
      navigate('/camera')
    }
  }, [state, navigate])

  const handleSave = () => {
    console.log('Photo Saved!')
    
    // In a real app, you would save to local storage or send to server
    // For now, we'll create a download link
    if (state?.imageData) {
      const link = document.createElement('a')
      link.download = `clicktales-photo-${Date.now()}.jpg`
      link.href = state.imageData
      link.click()
    }
    
    // Show success message
    alert('Photo saved successfully!')
  }

  const handleShare = async () => {
    if (navigator.share && state?.imageData) {
      try {
        // Convert data URL to blob
        const response = await fetch(state.imageData)
        const blob = await response.blob()
        const file = new File([blob], 'clicktales-photo.jpg', { type: 'image/jpeg' })
        
        await navigator.share({
          title: 'CLICKTALES Photo',
          text: 'Check out this photo I captured with CLICKTALES!',
          files: [file]
        })
      } catch (error) {
        console.log('Sharing failed:', error)
        // Fallback: copy image data to clipboard or download
        handleSave()
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleSave()
    }
  }

  if (!state?.imageData) {
    return null
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm border-b border-gray-800"
      >
        <button
          onClick={() => navigate('/camera')}
          className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-medium">Back to Camera</span>
        </button>
        
        <h1 className="text-xl font-bold text-white">Photo Preview</h1>
        
        <button
          onClick={() => navigate('/')}
          className="text-white hover:text-purple-400 transition-colors font-medium"
        >
          Home
        </button>
      </motion.div>

      {/* Photo Preview */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-4xl"
        >
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={state.imageData}
              alt="Captured photo"
              className="w-full h-auto object-contain"
            />
            
            {/* Photo frame effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-4 border-white/10 rounded-2xl"></div>
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">CLICKTALES</span>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-4 p-8 bg-black/80 backdrop-blur-sm"
      >
        {/* Retake Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/camera')}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
        >
          <RotateCcw className="w-5 h-5" />
          Retake
        </motion.button>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
        >
          <Share className="w-5 h-5" />
          Share
        </motion.button>

        {/* Save Button */}
        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg"
        >
          <Save className="w-5 h-5" />
          Save Photo
        </motion.button>
      </motion.div>

      {/* Success Toast */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        id="success-toast"
        style={{ display: 'none' }}
      >
        Photo saved successfully!
      </motion.div>
    </div>
  )
}

export default PreviewPage
