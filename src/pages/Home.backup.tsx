import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Sparkles, ArrowRight, Users, Heart, Download, Zap, Shield, Smartphone } from '../components/icons'
import Navigation from '../components/Navigation'
import { useAuth } from '../contexts/AuthContext'

const Home: React.FC = () => {
  const location = useLocation()
  const featuresRef = useRef<HTMLElement>(null)
  const { isAuthenticated } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Slideshow data
  const slides = [
    {
      id: 1,
      title: "Capture Your Best Moments",
      subtitle: "Create stunning photos with sleek filters, templates, and effects for events, gatherings, and memories.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2NmJmNDtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlYzQ4OTk7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM5ODBmNjtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9InVybCgjZ3JhZGllbnQxKSIvPgo8Y2lyY2xlIGN4PSIzMDAiIGN5PSIyMDAiIHI9IjEwMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+CjxjaXJjbGUgY3g9IjkwMCIgY3k9IjYwMCIgcj0iMTUwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+CjxwYXRoIGQ9Ik01MDAgMzAwQzU1MCAzMDAgNTkwIDM0MCA1OTAgMzkwUzU1MCA0ODAgNTAwIDQ4MFM0MTAgNDQwIDQxMCAzOTBTNDUwIDMwMCA1MDAgMzAwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPgo8dGV4dCB4PSI2MDAiIHk9IjQyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIG9wYWNpdHk9IjAuOSI+8J+Tiz48L3RleHQ+Cjwvc3ZnPg==",
      background: "from-purple-500 via-pink-500 to-blue-500"
    },
    {
      id: 2,
      title: "Professional Quality",
      subtitle: "Advanced filters and AI enhancement deliver studio-quality results with every capture.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzEwYjk4MTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNmI2ZDQ7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM5ODBmNjtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9InVybCgjZ3JhZGllbnQyKSIvPgo8Y2lyY2xlIGN4PSI4MDAiIGN5PSIxNTAiIHI9IjgwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMTIpIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjY1MCIgcj0iMTIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+CjxyZWN0IHg9IjQ1MCIgeT0iMzUwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEwMCIgcng9IjUwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpIi8+Cjx0ZXh0IHg9IjYwMCIgeT0iNDIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgb3BhY2l0eT0iMC45Ij7inagmbmJzcDs8L3RleHQ+Cjwvc3ZnPg==",
      background: "from-emerald-500 via-cyan-500 to-blue-500"
    },
    {
      id: 3,
      title: "Event Ready",
      subtitle: "Perfect for weddings, parties, corporate events, and special occasions of any size.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y5NjMwODtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlYzQ4OTk7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izg4NTVmNjtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9InVybCgjZ3JhZGllbnQzKSIvPgo8Y2lyY2xlIGN4PSI0MDAiIGN5PSI1MDAiIHI9IjYwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpIi8+CjxjaXJjbGUgY3g9IjgwMCIgY3k9IjMwMCIgcj0iOTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8ZWxsaXBzZSBjeD0iNjAwIiBjeT0iNDAwIiByeD0iMTUwIiByeT0iNzUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xMikiLz4KPHRleHQgeD0iNjAwIiB5PSI0MjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBvcGFjaXR5PSIwLjkiPvCfkbc8L3RleHQ+Cjwvc3ZnPg==",
      background: "from-orange-500 via-pink-500 to-purple-500"
    }
  ]

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    if (location.hash === '#features' && featuresRef.current) {
      setTimeout(() => {
        featuresRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }, [location])

  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Instant Capture",
      description: "Take stunning photos directly from your browser with professional-grade camera controls",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Group Fun",
      description: "Perfect for parties, events, and gatherings - capture memories with friends",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Custom Filters",
      description: "Apply beautiful filters and effects to make every photo special",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Easy Sharing",
      description: "Download, share, or print your photos instantly - no complicated setup",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Built with modern web technology for instant performance",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Enhancement",
      description: "Smart auto-enhancement to make every photo look professional",
      color: "from-violet-500 to-purple-500"
    }
  ]

  return (
    <div className="min-h-screen bg-white font-inter">
      <Navigation />
      
      {/* Hero Slideshow Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Slideshow Container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentSlide === index ? 1 : 0,
                scale: currentSlide === index ? 1 : 1.1,
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className={`absolute inset-0 bg-gradient-to-br ${slide.background}`}
              style={{ zIndex: currentSlide === index ? 1 : 0 }}
            >
              {/* Background Image/Pattern */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundBlendMode: 'overlay'
                }}
              />
              
              {/* Content Overlay */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: currentSlide === index ? 1 : 0,
                      y: currentSlide === index ? 0 : 50
                    }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {/* Professional Badge */}
                    <div className="inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 mb-8">
                      <Camera className="w-5 h-5 text-white mr-3" />
                      <span className="text-white font-medium">Professional Photo Experience</span>
                    </div>
                    
                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                      {slide.title}
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
                      {slide.subtitle}
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link to="/camera">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="group bg-white text-gray-900 font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                            <span>Start Taking Photos</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </motion.button>
                      </Link>
                      
                      <Link to="/gallery">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-white/10 backdrop-blur-md text-white border border-white/30 font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 transition-all duration-300"
                        >
                          View Gallery
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Enhanced Features Section - Always visible and interactive */}
      <section id="features" ref={featuresRef} className="py-32 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full filter blur-3xl"></div>
        </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Features Badge */}
                <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full px-6 py-3 mb-8 shadow-lg">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-purple-700 font-semibold">Powerful Features</span>
                </div>

                <h2 className="text-5xl md:text-6xl font-poppins font-black text-gray-900 mb-6">
                  Why Choose 
                  <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mt-2">
                    ClickTales?
                  </span>
                </h2>
                <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Everything you need for the perfect photobooth experience, powered by cutting-edge technology
                </p>
              </motion.div>
            </div>
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-8"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full px-8 py-3 mb-8 shadow-lg backdrop-blur-sm"
            >
              <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
              <span className="text-purple-700 font-semibold text-lg">Professional Photo Booth Experience</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="ml-3 text-yellow-500 text-xl"
              >
                ⭐
              </motion.div>
            </motion.div>
            
            
            <h1 className="text-6xl md:text-8xl font-poppins font-black mb-8 leading-tight">
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
              >
                Capture
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="block text-gray-900 mt-2"
              >
                Memories
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="block bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent text-5xl md:text-6xl mt-4"
              >
                Like Never Before
              </motion.span>
            </h1>
            
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12"
            >
              Create amazing memories with 
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> AI-powered filters</span>, 
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> instant sharing</span>, and 
              <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> seamless editing</span>
            </motion.p>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <Link to="/camera">
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold py-6 px-12 rounded-3xl text-xl transition-all duration-500 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center space-x-4">
                  <Camera className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-xl">Start Creating Magic</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </motion.button>
            </Link>
            
            <Link to="/gallery">
              <motion.button
                whileHover={{ 
                  scale: 1.02, 
                  y: -2,
                  backdropFilter: "blur(20px)"
                }}
                whileTap={{ scale: 0.98 }}
                className="group bg-white/80 hover:bg-white/90 backdrop-blur-lg text-gray-800 font-semibold py-6 px-12 rounded-3xl text-xl transition-all duration-300 border border-gray-200 shadow-xl hover:shadow-2xl"
              >
                <span className="flex items-center space-x-4">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🖼️</span>
                  <span>Explore Gallery</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-purple-600"
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </Link>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="relative mx-auto max-w-6xl"
            style={{ overflowX: 'hidden' }}
          >
            {/* Glassmorphism Container */}
            <div className="relative bg-white/30 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20" 
                 style={{ overflow: 'hidden' }}>
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 animate-gradient-xy"></div>
              
              {/* Camera Preview Mockup */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl aspect-video flex items-center justify-center"
                   style={{ overflow: 'hidden', maxWidth: '100%' }}>
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10 text-white text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Camera className="w-32 h-32 mx-auto mb-6 opacity-90" />
                  </motion.div>
                  <h3 className="text-3xl font-poppins font-bold mb-3">Live Camera Preview</h3>
                  <p className="text-xl opacity-75">Professional quality in real-time</p>
                </motion.div>
                
                {/* Floating UI Elements */}
                <motion.div
                  animate={{ y: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30"
                  style={{ maxWidth: 'calc(100% - 2rem)' }}
                >
                  <span className="text-white font-medium text-sm md:text-base">📸 Auto Focus</span>
                </motion.div>
                
                <motion.div
                  animate={{ y: [20, -20, 20], x: [-5, 5, -5] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30"
                  style={{ maxWidth: 'calc(100% - 2rem)' }}
                >
                  <span className="text-white font-medium text-sm md:text-base">✨ AI Enhanced</span>
                </motion.div>
                
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30"
                  style={{ maxWidth: 'calc(100% - 2rem)' }}
                >
                  <span className="text-white font-medium">🎭 Live Filters</span>
                </motion.div>
                
                {/* Particle Effects */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [-10, -30, -10],
                      x: [0, Math.random() * 10 - 5, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 3
                    }}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      bottom: `${10 + Math.random() * 20}%`
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="font-medium">Privacy First</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Mobile Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="font-medium">Loved by 10K+ Users</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section - Always visible and interactive */}
      <section id="features" ref={featuresRef} className="py-32 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full filter blur-3xl"></div>
        </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Features Badge */}
                <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full px-6 py-3 mb-8 shadow-lg">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-purple-700 font-semibold">Powerful Features</span>
                </div>

                <h2 className="text-5xl md:text-6xl font-poppins font-black text-gray-900 mb-6">
                  Why Choose 
                  <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mt-2">
                    ClickTales?
                  </span>
                </h2>
                <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Everything you need for the perfect photobooth experience, powered by cutting-edge technology
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative cursor-pointer"
                  onClick={() => {
                    if (!isAuthenticated) {
                      // Redirect to login page
                      window.location.href = '/login'
                    } else {
                      // Navigate to relevant feature page
                      if (feature.title === "Instant Capture") window.location.href = '/camera'
                      else if (feature.title === "Custom Filters") window.location.href = '/camera'
                      else if (feature.title === "Easy Sharing") window.location.href = '/gallery'
                      else if (feature.title === "Group Fun") window.location.href = '/camera'
                      else window.location.href = '/camera'
                    }
                  }}
                >
                  {/* Card Background with Glassmorphism */}
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 overflow-hidden h-full">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    {/* Animated Icon Container */}
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <div className="relative">
                        {feature.icon}
                        {/* Pulse effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-full opacity-75 group-hover:animate-ping`}></div>
                      </div>
                    </motion.div>

                    <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {feature.description}
                    </p>

                    {/* Hover Indicator */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />

                    {/* Bottom Shine Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-20 text-center"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
                  <div className="text-gray-600 font-medium">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-pink-600 mb-2">1M+</div>
                  <div className="text-gray-600 font-medium">Photos Captured</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-gray-600 font-medium">Filters & Effects</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">99.9%</div>
                  <div className="text-gray-600 font-medium">Uptime</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -40, -20],
                x: [0, Math.random() * 30 - 15, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4
              }}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* CTA Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8 shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-yellow-300 mr-3" />
              <span className="text-white font-semibold">Ready to Get Started?</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-poppins font-black text-white mb-6 leading-tight"
            >
              Start Your 
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent mt-2">
                Photo Journey
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Join over <span className="font-bold text-yellow-300">10,000+ users</span> who are already creating 
              amazing memories with our professional photo booth experience
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/login">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    y: -3,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-white text-gray-900 font-bold py-6 px-12 rounded-3xl text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-3">
                    <span>Get Started Free</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ✨
                    </motion.div>
                  </div>
                </motion.button>
              </Link>
              
              <Link to="/camera">
                <motion.button
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-6 px-12 rounded-3xl text-xl transition-all duration-300 border border-white/30 shadow-xl"
                >
                  <span className="flex items-center space-x-3">
                    <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Try Camera Now</span>
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/80"
            >
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="ml-4 font-medium">Trusted by 10K+ users</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex text-yellow-300">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">⭐</span>
                  ))}
                </div>
                <span className="font-medium">4.9/5 Rating</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-poppins font-bold">ClickTales</span>
            </div>
            <p className="text-gray-400 mb-8">
              Modern photobooth experience for the digital age
            </p>
            <div className="flex items-center justify-center space-x-6 text-gray-400">
              <Smartphone className="w-5 h-5" />
              <span>Mobile Ready</span>
              <span>•</span>
              <Shield className="w-5 h-5" />
              <span>Privacy First</span>
              <span>•</span>
              <Zap className="w-5 h-5" />
              <span>Lightning Fast</span>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500">
              © 2024 ClickTales • Built with modern web technology
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
