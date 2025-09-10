import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Settings, LogOut, Sparkles } from './icons'
import { useAuth } from '../contexts/AuthContext'

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  // Theme toggle functionality
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [darkMode])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'Photobooth', path: '/photobooth' },
    { name: 'Gallery', path: '/gallery' },
  ]

  const handleNavClick = (item: { name: string; path: string }) => {
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
    }
  }

  const isActivePath = (path: string) => location.pathname === path

  // Theme Toggle Component
  const ThemeToggle = () => (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 h-10 w-16 flex items-center justify-center ${
        darkMode 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      aria-label="Toggle theme"
    >
      <svg width={18} height={18} viewBox="0 0 20 20" fill="currentColor">
        {darkMode ? (
          // Sun icon
          <>
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1v2M10 17v2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M1 10h2M17 10h2M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          // Moon icon
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  )

  return (
    <nav className={`sticky top-0 z-50 shadow-lg transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-900/95 border-gray-700/20' 
        : 'bg-gray-50/95 border-gray-200/20'
    } backdrop-blur-md border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Extreme Left */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-2.5 rounded-xl shadow-lg"
            >
              <Sparkles className="h-6 w-6 text-white" />
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
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 h-10 ${
                      darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 h-10 flex items-center relative ${
                    isActivePath(item.path)
                      ? darkMode
                        ? 'text-purple-400 bg-gray-800'
                        : 'text-purple-600 bg-purple-50'
                      : darkMode
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
              )
            })}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Actions */}
            {isAuthenticated ? (
              <div className="relative ml-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg h-10 transition-all duration-300 ${
                    darkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user?.name || 'Profile'}</span>
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border py-2 ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <Link
                        to="/profile"
                        className={`flex items-center space-x-3 px-4 py-2 transition-colors ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className={`flex items-center space-x-3 px-4 py-2 transition-colors ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`} />
                      <button
                        onClick={logout}
                        className={`flex items-center space-x-3 px-4 py-2 transition-colors w-full text-left ${
                          darkMode
                            ? 'text-red-400 hover:bg-red-900/20'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 h-10 flex items-center ml-2 ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-200'
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
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
            className={`md:hidden border-t ${
              darkMode 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                if (item.name === 'Features') {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        handleNavClick(item)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 w-full text-left ${
                        darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
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
                    className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActivePath(item.path)
                        ? darkMode
                          ? 'text-purple-400 bg-gray-800'
                          : 'text-purple-600 bg-purple-50'
                        : darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
              
              {/* Mobile Theme Toggle */}
              <div className="flex justify-center py-2">
                <ThemeToggle />
              </div>
              
              <hr className={`my-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
              
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.name || 'Profile'}</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
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
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${
                      darkMode
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-medium transition-colors text-center ${
                    darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-200'
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation
