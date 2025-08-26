import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Smartphone, Monitor, ChevronDown, Info, CheckCircle } from './icons'

interface CameraPermissionHelperProps {
  onRequestPermission: () => void
  isVisible: boolean
  onClose: () => void
}

const CameraPermissionHelper: React.FC<CameraPermissionHelperProps> = ({
  onRequestPermission,
  isVisible,
  onClose
}) => {
  const [showInstructions, setShowInstructions] = useState(false)

  const handleEnableCamera = async () => {
    try {
      // Try to request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true })
      onRequestPermission()
      onClose()
    } catch (error) {
      // If permission denied, show instructions
      setShowInstructions(true)
    }
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isAndroid = /Android/i.test(navigator.userAgent)

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Camera className="w-8 h-8" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Enable Camera Access</h3>
            <p className="text-white/90">Take amazing photos with ClickTales</p>
          </div>

          <div className="p-6">
            {!showInstructions ? (
              <>
                {/* Permission Request */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">Ready to access camera</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Click the button below to enable camera access and start taking photos with filters, timer, and more!
                  </p>
                </div>

                {/* Enable Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnableCamera}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl mb-4"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Camera className="w-6 h-6" />
                    <span>Enable Camera</span>
                  </div>
                </motion.button>

                {/* Instructions Toggle */}
                <button
                  onClick={() => setShowInstructions(true)}
                  className="w-full flex items-center justify-center space-x-2 text-gray-500 hover:text-gray-700 py-2 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span>Need help with permissions?</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Instructions */}
                <div className="space-y-4">
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="flex items-center text-purple-600 hover:text-purple-700 transition-colors mb-4"
                  >
                    <ChevronDown className="w-4 h-4 rotate-180 mr-2" />
                    Back to camera access
                  </button>

                  <h4 className="font-bold text-lg text-gray-800 mb-4">Enable Camera Permissions:</h4>

                  {isIOS && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <div className="flex items-center mb-3">
                        <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-blue-800">iPhone/iPad (Safari)</span>
                      </div>
                      <div className="space-y-2 text-sm text-blue-700">
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Tap "Allow" when prompted for camera access</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Or go to Settings → Safari → Camera → Allow</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Tap "aA" in address bar → Website Settings → Camera → Allow</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isAndroid && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                      <div className="flex items-center mb-3">
                        <Smartphone className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-800">Android (Chrome)</span>
                      </div>
                      <div className="space-y-2 text-sm text-green-700">
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Tap "Allow" when the permission dialog appears</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Tap the lock icon next to URL → Permissions → Camera → Allow</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Chrome Settings → Site Settings → Camera → Allow</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isMobile && (
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                      <div className="flex items-center mb-3">
                        <Monitor className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="font-semibold text-purple-800">Desktop Browser</span>
                      </div>
                      <div className="space-y-2 text-sm text-purple-700">
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Click "Allow" when prompted for camera access</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Click the camera icon in the address bar → Always allow</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Browser Settings → Privacy → Camera → Allow for this site</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Try Again Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnableCamera}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl mt-4"
                  >
                    Try Again
                  </motion.button>
                </div>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 py-2 mt-4 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CameraPermissionHelper
