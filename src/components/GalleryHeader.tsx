import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, Image, Layout, FolderOpen, Heart } from './icons'

interface GalleryHeaderProps {
  activeTab: 'photos' | 'collage' | 'albums' | 'favorites'
  onTabChange: (tab: 'photos' | 'collage' | 'albums' | 'favorites') => void
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'photos' as const, label: 'Photos', icon: <Image className="w-5 h-5" /> },
    { id: 'favorites' as const, label: 'Favorites', icon: <Heart className="w-5 h-5" /> },
    { id: 'collage' as const, label: 'Collage', icon: <Layout className="w-5 h-5" /> },
    { id: 'albums' as const, label: 'Albums', icon: <FolderOpen className="w-5 h-5" /> }
  ]

  return (
    <div className="relative bg-white/80 backdrop-blur-xl border-b border-purple-200/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </motion.button>
            </Link>
          </div>

          <motion.h1 
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Gallery
          </motion.h1>

          <Link to="/photobooth">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Camera className="w-5 h-5" />
              <span className="hidden sm:inline">Take Photo</span>
            </motion.button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center">
          <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1 border border-purple-200/30 shadow-lg">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GalleryHeader
