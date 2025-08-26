import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimerProps {
  duration: number // in seconds
  onComplete: () => void
  isActive: boolean
  onCancel: () => void
}

const Timer: React.FC<TimerProps> = ({ duration, onComplete, isActive, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (isActive && !isRunning) {
      setTimeLeft(duration)
      setIsRunning(true)
    } else if (!isActive) {
      setIsRunning(false)
      setTimeLeft(duration)
    }
  }, [isActive, duration, isRunning])

  useEffect(() => {
    let interval: number | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false)
            onComplete()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, onComplete])

  const handleCancel = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(duration)
    onCancel()
  }, [duration, onCancel])

  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div className="text-center">
          {/* Timer Display */}
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-9xl font-bold text-white mb-8 select-none"
            style={{
              textShadow: '0 0 50px rgba(255, 255, 255, 0.5)',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))'
            }}
          >
            {timeLeft}
          </motion.div>

          {/* Progress Ring */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                className="text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Progress circle */}
              <path
                className="text-purple-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(timeLeft / duration) * 100}, 100`}
                strokeLinecap="round"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl text-white mb-8 font-medium"
          >
            Get ready for your photo!
          </motion.p>

          {/* Cancel Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </motion.button>
        </div>

        {/* Pulse effect */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full"
          style={{
            clipPath: 'circle(200px at center)'
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default Timer
