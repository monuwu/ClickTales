import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Settings, LogOut, Sparkles } from './icons'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggleSwitch from './ThemeToggleSwitch'
import StarOverlay from './StarOverlay'

// Navigation component with WiFi/sync indicator removed

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { isDark } = useTheme()
  const location = useLocation()
  const { user, logout } = useAuth()
  const isAuthenticated = !!user

  const navItems = [
    { name: 'Home', path: '/', public: true },
    { name: 'Features', path: '/#features', public: true },
    { name: 'Photobooth', path: '/photobooth', public: true },
    { name: 'Gallery', path: '/gallery', public: true },
    { name: 'Camera', path: '/camera', public: true },
    { name: 'Albums', path: '/albums', public: true },
  ]

  const handleNavClick = (item: { name: string; path: string; public?: boolean }) => {
    if (item.name === 'Features') {
      if (location.pathname !== '/') {
        window.location.href = '/#features'
      } else {
        const featuresSection = document.getElementById('features')
        if (featuresSection) {
          featuresSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    } else if (!item.public && !isAuthenticated) {
      // Redirect to login for protected routes
      window.location.href = '/login'
    }
  }

  const isActivePath = (path: string) => location.pathname === path

  return (
    <nav className={`sticky top-0 z-50 shadow-lg transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900/95 border-gray-700/20' 
        : 'bg-gray-50/95 border-gray-200/20'
    } backdrop-blur-md border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Extreme Left */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-3 rounded-xl shadow-lg"
            >
              <Sparkles className="h-7 w-7 text-white" />
            </motion.div>
            <div className="font-bold">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                ClickTales
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Right Side */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Nav Items */}
            {navItems.map((item) => {
              if (item.name === 'Features') {
                return (
                  <StarOverlay key={item.name}>
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`px-5 py-3 rounded-lg font-medium transition-all duration-300 h-12 text-base ${
                        isDark
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  </StarOverlay>
                )
              }
              
              // For protected routes when not authenticated, use button with redirect
              if (!item.public && !isAuthenticated) {
                return (
                  <StarOverlay key={item.name}>
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`px-5 py-3 rounded-lg font-medium transition-all duration-300 h-12 text-base relative group ${
                        isDark
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                      }`}
                    >
                      {item.name}
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Login required
                      </span>
                    </button>
                  </StarOverlay>
                )
              }
              
              // For all public routes, use Link
              return (
                <StarOverlay key={item.path}>
                  <Link
                    to={item.path}
                    className={`px-5 py-3 rounded-lg font-medium transition-all duration-300 h-12 flex items-center relative text-base ${
                      isActivePath(item.path)
                        ? isDark
                          ? 'text-purple-400 bg-gray-800'
                          : 'text-purple-600 bg-purple-50'
                        : isDark
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                    }`}
                  >
                    {item.name}
                    {isActivePath(item.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    )}
                  </Link>
                </StarOverlay>
              )
            })}

            {/* Theme Toggle */}
            <ThemeToggleSwitch />

            {/* User Actions */}
            {isAuthenticated ? (
              <div className="relative ml-2">
                <StarOverlay>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`flex items-center space-x-2 px-5 py-3 rounded-lg h-12 transition-all duration-300 text-base ${
                      isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user?.name || 'Profile'}</span>
                  </motion.button>
                </StarOverlay>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border backdrop-blur-md z-50 ${
                        isDark
                          ? 'bg-gray-800/95 border-gray-700'
                          : 'bg-white/95 border-gray-200'
                      }`}
                    >
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                            isDark
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                              : 'text-gray-700 hover:text-purple-600 hover:bg-gray-100'
                          }`}
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                            isDark
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                              : 'text-gray-700 hover:text-purple-600 hover:bg-gray-100'
                          }`}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        <hr className={`my-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                        <button
                          onClick={() => {
                            logout()
                            setIsProfileMenuOpen(false)
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                            isDark
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <StarOverlay>
                <Link
                  to="/login"
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 h-12 flex items-center ml-2 text-base ${
                    isDark
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                  }`}
                >
                  Sign In
                </Link>
              </StarOverlay>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden border-t backdrop-blur-md ${
              isDark 
                ? 'bg-gray-900/95 border-gray-700' 
                : 'bg-gray-50/95 border-gray-200'
            }`}
          >
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => {
                if (item.name === 'Features') {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        handleNavClick(item)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                        isDark
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  )
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActivePath(item.path)
                        ? isDark
                          ? 'text-purple-400 bg-gray-800'
                          : 'text-purple-600 bg-purple-50'
                        : isDark
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
              
              {/* Mobile Auth Actions */}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                      isDark
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block w-full px-4 py-3 text-center rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation