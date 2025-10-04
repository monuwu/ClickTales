import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

interface StarAnimationButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const StarAnimationButton: React.FC<StarAnimationButtonProps> = ({ 
  children, 
  onClick, 
  className = ""
}) => {
  const { isDark } = useTheme()

  const StarSVG = () => (
    <svg
      viewBox="0 0 784.11 815.53"
      style={{
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        fillRule: 'evenodd',
        clipRule: 'evenodd'
      } as React.CSSProperties}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Layer_x0020_1">
        <path
          d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
          fill={isDark ? '#fffdef' : '#fffdef'}
        />
      </g>
    </svg>
  )

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        className={`
          relative overflow-hidden px-6 py-2 rounded-full font-medium transition-all duration-300 h-10 flex items-center
          ${isDark
            ? 'bg-gray-800 text-gray-200 hover:bg-black hover:text-white shadow-lg hover:shadow-gray-400/20'
            : 'bg-white text-gray-800 hover:bg-black hover:text-white shadow-lg hover:shadow-purple-400/20'
          }
          ${className}
        `}
        style={{
          boxShadow: isDark 
            ? '0px 0px 10px 0px rgba(255, 255, 255, 0.1)' 
            : '0px 0px 10px 0px rgba(147, 51, 234, 0.2)'
        }}
      >
        {/* Star animations */}
        <motion.div
          className="absolute w-6 h-6 -z-10"
          style={{ top: '20%', left: '20%' }}
          variants={{
            hover: {
              top: '-20%',
              left: '-20%',
              width: '20px',
              height: '20px',
              filter: 'drop-shadow(0 0 10px #fffdef)',
              zIndex: 2,
            }
          }}
          initial={{ filter: 'drop-shadow(0 0 0 #fffdef)', zIndex: -5 }}
          transition={{ duration: 0.8, ease: [0.05, 0.83, 0.43, 0.96] }}
        >
          <StarSVG />
        </motion.div>

        <motion.div
          className="absolute w-4 h-4 -z-10"
          style={{ top: '45%', left: '45%' }}
          variants={{
            hover: {
              top: '35%',
              left: '-25%',
              width: '15px',
              height: '15px',
              filter: 'drop-shadow(0 0 10px #fffdef)',
              zIndex: 2,
            }
          }}
          initial={{ filter: 'drop-shadow(0 0 0 #fffdef)', zIndex: -5 }}
          transition={{ duration: 0.8, ease: [0, 0.4, 0, 1.01] }}
        >
          <StarSVG />
        </motion.div>

        <motion.div
          className="absolute w-2 h-2 -z-10"
          style={{ top: '40%', left: '40%' }}
          variants={{
            hover: {
              top: '80%',
              left: '-10%',
              width: '10px',
              height: '10px',
              filter: 'drop-shadow(0 0 10px #fffdef)',
              zIndex: 2,
            }
          }}
          initial={{ filter: 'drop-shadow(0 0 0 #fffdef)', zIndex: -5 }}
          transition={{ duration: 0.8, ease: [0, 0.4, 0, 1.01] }}
        >
          <StarSVG />
        </motion.div>

        <motion.div
          className="absolute w-3 h-3 -z-10"
          style={{ top: '20%', left: '40%' }}
          variants={{
            hover: {
              top: '-25%',
              left: '105%',
              width: '20px',
              height: '20px',
              filter: 'drop-shadow(0 0 10px #fffdef)',
              zIndex: 2,
            }
          }}
          initial={{ filter: 'drop-shadow(0 0 0 #fffdef)', zIndex: -5 }}
          transition={{ duration: 0.8, ease: [0, 0.4, 0, 1.01] }}
        >
          <StarSVG />
        </motion.div>

        <motion.div
          className="absolute w-4 h-4 -z-10"
          style={{ top: '25%', left: '45%' }}
          variants={{
            hover: {
              top: '30%',
              left: '115%',
              width: '15px',
              height: '15px',
              filter: 'drop-shadow(0 0 10px #fffdef)',
              zIndex: 2,
            }
          }}
          initial={{ filter: 'drop-shadow(0 0 0 #fffdef)', zIndex: -5 }}
          transition={{ duration: 0.8, ease: [0, 0.4, 0, 1.01] }}
        >
          <StarSVG />
        </motion.div>

        <motion.div
          className="absolute w-2 h-2 -z-10"
          style={{ top: '5%', left: '50%' }}
          variants={{
            hover: {
              top: '80%',
              left: '105%',
              width: '10px',
              height: '10px',
              filter: 'drop-shadow(0 0 10px #fffdef)',
              zIndex: 2,
            }
          }}
          initial={{ filter: 'drop-shadow(0 0 0 #fffdef)', zIndex: -5 }}
          transition={{ duration: 0.8, ease: [0, 0.4, 0, 1.01] }}
        >
          <StarSVG />
        </motion.div>

        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </motion.button>
    </div>
  )
}

export default StarAnimationButton