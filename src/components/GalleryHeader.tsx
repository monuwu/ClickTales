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
    <div className="relative">
      {/* Glassmorphism container */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-b-3xl blur-lg"></div>
      <div className="relative bg-slate-900/40 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-300 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 hover:border-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back to Home</span>
                </motion.button>
              </Link>
            </div>

            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
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
                className="group relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 border border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span className="hidden sm:inline">Take Photo</span>
                </div>
              </motion.button>
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500"></div>
              <div className="relative flex bg-slate-800/50 backdrop-blur-sm rounded-2xl p-1 border border-white/10 shadow-2xl">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex items-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'text-white shadow-2xl'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-2xl"
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
      </div>
    </div>
  )
}

export default GalleryHeader
