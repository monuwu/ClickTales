import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

interface StarOverlayProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const StarOverlay: React.FC<StarOverlayProps> = ({ children, className = "", onClick }) => {
  const { isDark } = useTheme()

  const StarSVG = ({ size = "w-2 h-2" }: { size?: string }) => (
    <svg
      className={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={isDark ? '#a855f7' : '#7c3aed'}
        className="drop-shadow-sm"
      />
    </svg>
  )

  return (
    <motion.div
      className={`relative group ${className}`}
      onClick={onClick}
      whileHover="hover"
    >
      {/* Star animations - positioned absolutely to not affect layout */}
      <motion.div
        className="absolute -z-10"
        style={{ top: '10%', left: '15%' }}
        variants={{
          hover: {
            top: '-30%',
            left: '-20%',
            opacity: 1,
            scale: 1,
          }
        }}
        initial={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.6, ease: [0.05, 0.83, 0.43, 0.96] }}
      >
        <StarSVG size="w-3 h-3" />
      </motion.div>

      <motion.div
        className="absolute -z-10"
        style={{ top: '50%', right: '20%' }}
        variants={{
          hover: {
            top: '20%',
            right: '-30%',
            opacity: 1,
            scale: 1,
          }
        }}
        initial={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0, 0.4, 0, 1.01] }}
      >
        <StarSVG size="w-2 h-2" />
      </motion.div>

      <motion.div
        className="absolute -z-10"
        style={{ bottom: '10%', left: '30%' }}
        variants={{
          hover: {
            bottom: '-25%',
            left: '10%',
            opacity: 1,
            scale: 1,
          }
        }}
        initial={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0, 0.4, 0, 1.01] }}
      >
        <StarSVG size="w-2 h-2" />
      </motion.div>

      <motion.div
        className="absolute -z-10"
        style={{ top: '30%', right: '10%' }}
        variants={{
          hover: {
            top: '-20%',
            right: '-40%',
            opacity: 1,
            scale: 1,
          }
        }}
        initial={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0, 0.4, 0, 1.01] }}
      >
        <StarSVG size="w-3 h-3" />
      </motion.div>

      <motion.div
        className="absolute -z-10"
        style={{ bottom: '30%', right: '40%' }}
        variants={{
          hover: {
            bottom: '-30%',
            right: '70%',
            opacity: 1,
            scale: 1,
          }
        }}
        initial={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0, 0.4, 0, 1.01] }}
      >
        <StarSVG size="w-2 h-2" />
      </motion.div>

      {/* Original content - unchanged */}
      {children}
    </motion.div>
  )
}

export default StarOverlay