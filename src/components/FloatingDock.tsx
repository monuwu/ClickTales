import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Camera,
  ImageIcon,
  User,
  Settings,
  LogOut
} from './icons'
import { useAuth } from '../contexts/AuthContext'

interface DockItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  path?: string
  action?: () => void
  requireAuth?: boolean
  color: string
}

const FloatingDock: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const location = useLocation()

  // Show dock after page load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Hide dock on landing page and camera page to avoid blocking camera controls
  const shouldShowDock = location.pathname !== '/' && location.pathname !== '/camera'

  const handleLogout = async () => {
    await logout()
  }

  const dockItems: DockItem[] = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Camera,
      label: 'Photo Booth',
      path: '/photobooth',
      requireAuth: true,
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: ImageIcon,
      label: 'Gallery',
      path: '/gallery',
      requireAuth: true,
      color: 'from-pink-400 to-pink-600'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      requireAuth: true,
      color: 'from-green-400 to-green-600'
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
      requireAuth: true,
      color: 'from-orange-400 to-orange-600'
    },
    ...(user ? [{
      icon: LogOut,
      label: 'Logout',
      action: handleLogout,
      color: 'from-red-400 to-red-600'
    }] : [])
  ]

  const filteredItems = dockItems.filter(item => 
    !item.requireAuth || user
  )

  if (!shouldShowDock || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          delay: 0.2 
        }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4"
      >
        {/* Dock Container */}
        <div className="relative">
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl" />
          
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl blur-xl animate-pulse" />
          
          {/* Dock Items */}
          <div className="relative flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-3 sm:py-4">
            {filteredItems.map((item, index) => {
              const isActive = item.path === location.pathname
              const IconComponent = item.icon
              
              return (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  onHoverStart={() => setHoveredItem(item.label)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className="relative"
                >
                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredItem === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                      >
                        <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                          {item.label}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dock Item Button */}
                  {item.path ? (
                    <Link to={item.path}>
                      <DockButton 
                        icon={IconComponent}
                        isActive={isActive}
                        isHovered={hoveredItem === item.label}
                        color={item.color}
                      />
                    </Link>
                  ) : (
                    <button onClick={item.action}>
                      <DockButton 
                        icon={IconComponent}
                        isActive={false}
                        isHovered={hoveredItem === item.label}
                        color={item.color}
                      />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Sparkle Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 15}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

interface DockButtonProps {
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
  isHovered: boolean
  color: string
}

const DockButton: React.FC<DockButtonProps> = ({ 
  icon: Icon, 
  isActive, 
  isHovered, 
  color 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.2, y: -8 }}
      whileTap={{ scale: 0.9 }}
      className={`
        relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center
        transition-all duration-300 cursor-pointer
        ${isActive 
          ? 'bg-white/20 shadow-lg border border-white/30' 
          : 'bg-white/10 hover:bg-white/20 border border-white/10'
        }
      `}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
      )}
      
      {/* Gradient Glow Effect */}
      {isHovered && (
        <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20 rounded-xl blur-sm`} />
      )}
      
      {/* Icon */}
      <Icon className={`
        w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300
        ${isActive 
          ? 'text-white' 
          : 'text-white/80 hover:text-white'
        }
      `} />
    </motion.div>
  )
}

export default FloatingDock