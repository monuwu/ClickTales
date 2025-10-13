import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Sparkles, ArrowRight, Users, Heart, Zap, Settings, Share2 } from '../components/icons'
import Navigation from '../components/Navigation'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

const LandingPage: React.FC = () => {
  console.log('LandingPage component is rendering...')
  const { isDark } = useTheme()
  const { user } = useAuth()
  const location = useLocation()
  const featuresRef = useRef<HTMLElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Slideshow data - PRESERVED EXACTLY AS REQUESTED
  const slides = [
    {
      id: 1,
      title: "Capture Your Best Moments",
      subtitle: "Create stunning photos with sleek filters, templates, and effects for events, gatherings, and memories.",
      backgroundImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=800&fit=crop&crop=center&auto=format&q=80"
    },
    {
      id: 2,
      title: "Professional Quality",
      subtitle: "Advanced filters and image enhancement deliver studio-quality results with every capture.",
      backgroundImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=800&fit=crop&crop=center&auto=format&q=80"
    },
    {
      id: 3,
      title: "Event Ready",
      subtitle: "Perfect for weddings, parties, corporate events, and special occasions of any size.",
      backgroundImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=800&fit=crop&crop=center&auto=format&q=80"
    }
  ]

  // Auto-slide functionality - PRESERVED
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
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
  }, [location.hash])







  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-purple-50/30 to-rose-50/20'
    }`}>
      {/* Static Background Layer - Removed scroll-based transform to prevent glitches */}
      <div className="fixed inset-0 z-0">
        {/* Simplified Animated Gradient Orbs - Reduced complexity */}
        <motion.div
          animate={{
            x: [0, 50, -20, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute top-20 left-20 w-80 h-80 rounded-full blur-3xl ${
            isDark 
              ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20' 
              : 'bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10'
          }`}
          style={{ willChange: 'transform' }}
        />
        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 80, -30, 0],
            scale: [0.9, 1.2, 1, 0.9],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8
          }}
          className={`absolute bottom-32 right-32 w-72 h-72 rounded-full blur-3xl ${
            isDark
              ? 'bg-gradient-to-r from-yellow-500/15 via-orange-500/15 to-red-500/15'
              : 'bg-gradient-to-r from-yellow-400/8 via-orange-400/8 to-red-400/8'
          }`}
          style={{ willChange: 'transform' }}
        />

        {/* Minimal Floating Shapes - Only 2 shapes */}
        {[0, 1].map((i) => (
          <motion.div
            key={`shape-${i}`}
            animate={{
              rotate: [0, 360],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 3,
            }}
            className={`absolute w-3 h-3 border border-purple-400/15 ${i === 0 ? 'rounded-full' : 'rounded-sm'}`}
            style={{
              left: `${30 + i * 40}%`,
              top: `${25 + i * 20}%`,
              willChange: 'transform'
            }}
          />
        ))}

        {/* Static Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/8 via-transparent to-pink-100/8" />
      </div>

      {/* Navigation - PRESERVED */}
      <motion.div 
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-sm ${
          isDark 
            ? 'bg-gray-900/90 border-gray-700/30' 
            : 'bg-white/90 border-purple-200/30'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Navigation />
      </motion.div>
      
      {/* Hero Slideshow Section - PRESERVED EXACTLY */}
      <section className="relative h-screen overflow-hidden pt-20">
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ 
                opacity: currentSlide === index ? 1 : 0,
                scale: currentSlide === index ? 1 : 1.02,
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
              style={{ 
                zIndex: currentSlide === index ? 1 : 0,
                backgroundImage: `url(${slide.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-purple-900/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              <motion.div 
                className="relative z-10 h-full flex items-center justify-center"
              >
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8 font-light"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                  >
                    <Link to={user ? "/photobooth" : "/login"}>
                      <motion.button
                        whileHover={{ 
                          scale: 1.05, 
                          y: -8,
                          rotate: -2,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 overflow-hidden ${
                          isDark 
                            ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' 
                            : 'bg-white text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {/* Animated Background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-pink-100/30"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 2
                          }}
                        />

                        {/* Simplified Sparkle Effects - Fixed positions */}
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100"
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1.2, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                            style={{
                              left: `${30 + i * 20}%`,
                              top: `${40 + i * 10}%`,
                            }}
                          />
                        ))}

                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ duration: 0.3 }}
                          className="relative z-10"
                        >
                          <Camera className="w-5 h-5" />
                        </motion.div>
                        <span className="relative z-10">{user ? "Start Creating" : "Sign In to Start"}</span>
                        <motion.div
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.3 }}
                          className="relative z-10"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000"></div>
                      </motion.button>
                    </Link>
                    <Link to="#features">
                      <motion.button
                        whileHover={{ 
                          scale: 1.05,
                          y: -3,
                          rotate: 2,
                          boxShadow: "0 20px 40px rgba(255,255,255,0.2)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative text-white font-medium py-4 px-8 border border-white/30 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 overflow-hidden"
                      >
                        {/* Animated Border Glow */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl border border-transparent"
                          animate={{
                            borderColor: [
                              'rgba(255,255,255,0.3)',
                              'rgba(255,255,255,0.6)',
                              'rgba(255,255,255,0.3)'
                            ]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        {/* Floating Particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100"
                            animate={{
                              y: [0, -20, 0],
                              opacity: [0, 1, 0],
                              x: Math.random() * 80 - 40,
                            }}
                            transition={{
                              duration: 3 + Math.random(),
                              repeat: Infinity,
                              delay: Math.random() * 2,
                            }}
                            style={{
                              left: `${10 + Math.random() * 80}%`,
                            }}
                          />
                        ))}

                        <span className="relative z-10">Explore Features</span>
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Controls - PRESERVED */}
        <motion.button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          whileHover={{ scale: 1.1, x: -3 }}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full border border-white/20 hover:bg-white/30 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        
        <motion.button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          whileHover={{ scale: 1.1, x: 3 }}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full border border-white/20 hover:bg-white/30 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* What's Special Section */}
      <section className={`relative py-24 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-white to-purple-50/20'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2 
              className={`text-5xl md:text-6xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="font-bold">What's</span> <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">Special</span>
            </motion.h2>
            <motion.p 
              className={`text-xl max-w-3xl mx-auto ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <span className="font-semibold">Advanced photo booth technology for professional-quality results</span>
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Smart Camera System",
                description: "Advanced camera integration with real-time preview, filters, and professional-quality capture for any event size.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Sparkles,
                title: "Real-Time Effects",
                description: "Apply stunning filters and effects instantly with our image processing engine for immediate results.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Share2,
                title: "Instant Sharing",
                description: "Share photos immediately via QR codes, email, or download directly to devices with seamless integration.",
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                icon: Users,
                title: "Gallery Management",
                description: "Organize and manage photo collections with smart categorization and easy access for all users.",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Ultra-fast processing with zero lag, optimized for high-volume events and celebrations.",
                gradient: "from-violet-500 to-purple-500"
              },
              {
                icon: Heart,
                title: "User Profiles",
                description: "Personalized user accounts with preferences, photo history, and customizable settings.",
                gradient: "from-pink-500 to-rose-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`group relative backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border ${
                  isDark
                    ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90'
                    : 'bg-white/80 border-white/50 hover:bg-white/90'
                }`}
              >
                <motion.div 
                  className={`inline-flex items-center justify-center w-16 h-16 p-3 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg group-hover:shadow-xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-8 h-8" />
                </motion.div>
                
                <h3 className={`text-2xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-lg leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>

                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 2025 Modern Design */}
      <motion.section 
        className={`relative flex flex-col items-center justify-center text-center px-6 py-20 ${
          isDark 
            ? 'bg-gradient-to-b from-black via-zinc-900 to-black' 
            : 'bg-gradient-to-b from-slate-50 via-white to-slate-50'
        } backdrop-blur-2xl`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
              isDark ? 'bg-purple-500/10' : 'bg-purple-300/20'
            } blur-3xl`}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <motion.h2 
            className={`text-4xl md:text-5xl font-semibold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          
          <motion.p 
            className={`text-lg max-w-2xl mx-auto mb-16 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Simple 4-step process to get started
          </motion.p>

          {/* Steps Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                step: "01",
                title: "Access Camera",
                description: "Open ClickTales and access the camera interface with one click",
                icon: Camera,
                gradient: "from-blue-500 to-cyan-500",
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=200&fit=crop&auto=format&q=80"
              },
              {
                step: "02", 
                title: "Capture Photos",
                description: "Take stunning photos with built-in filters and effects",
                icon: Sparkles,
                gradient: "from-purple-500 to-pink-500",
                image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop&auto=format&q=80"
              },
              {
                step: "03",
                title: "Organize Gallery", 
                description: "Browse and manage all your photos in an intuitive gallery",
                icon: Settings,
                gradient: "from-emerald-500 to-teal-500",
                image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=200&fit=crop&auto=format&q=80"
              },
              {
                step: "04",
                title: "Share & Export",
                description: "Download or share photos instantly with QR codes and links",
                icon: Share2,
                gradient: "from-orange-500 to-red-500",
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop&auto=format&q=80"
              }
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative group rounded-3xl overflow-hidden ${
                  isDark 
                    ? 'bg-zinc-800/50 border-zinc-700/50' 
                    : 'bg-white/60 border-gray-200/50'
                } border backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {/* Background Image Header */}
                <div className="relative h-32 overflow-hidden">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-80`}></div>
                  
                  {/* Step Number */}
                  <motion.div 
                    className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.step}
                  </motion.div>

                  {/* Floating Icon */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className={`text-xl font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.description}
                  </p>

                  {/* Progress Indicator */}
                  <div className="mt-4 flex items-center">
                    <div className={`flex-1 h-1 bg-gradient-to-r ${item.gradient} rounded-full opacity-30`}></div>
                    <span className={`ml-3 text-xs font-medium ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Step {item.step}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose ClickTales - 2025 Modern Design */}
      <section 
        id="features"
        ref={featuresRef}
        className={`relative py-32 overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900' 
            : 'bg-gradient-to-br from-white via-slate-50/50 to-purple-50/30'
        }`}
      >
        {/* Floating Orbs Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-20 right-20 w-64 h-64 rounded-full ${
              isDark ? 'bg-purple-500/10' : 'bg-purple-400/5'
            } blur-3xl`}
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute bottom-20 left-20 w-80 h-80 rounded-full ${
              isDark ? 'bg-pink-500/10' : 'bg-pink-400/5'
            } blur-3xl`}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <motion.h2 
              className={`text-6xl md:text-7xl font-light mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Why <span className="font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">ClickTales</span>
            </motion.h2>
            <motion.div 
              className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-6 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            />
            <motion.p 
              className={`text-lg max-w-2xl mx-auto font-light ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Professional photo booth technology for modern events and photography
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              {
                title: "Real-Time Camera Interface",
                description: "Professional photo capture with live preview",
                features: ["Live Camera Feed", "Instant Capture"],
                icon: Camera,
                gradient: "from-purple-500 to-blue-500"
              },
              {
                title: "Smart Gallery Management",
                description: "Organize and browse photos with intuitive interface", 
                features: ["Photo Organization", "Album Creation"],
                icon: Settings,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Modern Web Architecture",
                description: "Lightning-fast performance with React & TypeScript",
                features: ["Fast Loading", "Responsive Design"],
                icon: Sparkles,
                gradient: "from-cyan-500 to-teal-500"
              },
              {
                title: "Seamless Photo Sharing",
                description: "Instant download and sharing capabilities",
                features: ["Direct Download", "QR Code Sharing"],
                icon: Share2,
                gradient: "from-teal-500 to-purple-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <div className={`relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-500 ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' 
                    : 'bg-white/70 border-white/50 hover:bg-white/90 hover:border-white/70'
                } shadow-xl hover:shadow-2xl`}>
                  {/* Icon */}
                  <motion.div 
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className={`text-2xl font-bold mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-lg mb-6 leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-3">
                    {feature.features.map((item, i) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                        viewport={{ once: true }}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          isDark 
                            ? 'bg-gray-800/60 text-gray-200 border border-gray-700/50' 
                            : 'bg-gray-100/80 text-gray-700 border border-gray-200/50'
                        } backdrop-blur-sm`}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>

                  {/* Hover Gradient Effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Our Users Say - 2025 Modern Design */}
      <section className={`relative py-32 overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-white to-purple-50/20'
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              x: [0, 100, -50, 0],
              y: [0, -50, 100, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full ${
              isDark ? 'bg-purple-500/5' : 'bg-purple-400/3'
            } blur-3xl`}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2 
              className={`text-6xl md:text-7xl font-light mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            >
              What Our <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Users</span> Say
            </motion.h2>
          </motion.div>

          {/* Testimonials Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-8"
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4 }}
                className={`relative p-10 rounded-3xl backdrop-blur-xl border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white/70 border-white/50'
                } shadow-2xl group`}
              >
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-6 shadow-lg">
                    AT
                  </div>
                  <div>
                    <h4 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Alex Thompson
                    </h4>
                    <p className="text-purple-600 font-medium">Event Photographer</p>
                  </div>
                  <div className="ml-auto">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-2xl">★</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <blockquote className={`text-xl leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  "ClickTales transformed our event photography workflow with its professional interface that delivers stunning results instantly."
                </blockquote>
                
                <div className="mt-6">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-semibold shadow-lg">
                    50+ Events
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Side Testimonials */}
            <div className="lg:col-span-4 space-y-8">
              {[
                {
                  name: "Maria G.",
                  role: "Wedding Coordinator", 
                  quote: "Perfect for weddings. Guests love the instant sharing!",
                  gradient: "from-pink-500 to-rose-500",
                  initials: "MG"
                },
                {
                  name: "David K.",
                  role: "Party Host",
                  quote: "Kids had a blast. Super easy to use and great results.",
                  gradient: "from-blue-500 to-cyan-500", 
                  initials: "DK"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, x: 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className={`relative p-6 rounded-2xl backdrop-blur-xl border ${
                    isDark 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/70 border-white/50'
                  } shadow-xl group`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-xl flex items-center justify-center text-white font-bold mr-4 shadow-md`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <h5 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {testimonial.name}
                      </h5>
                      <p className="text-purple-600 text-sm font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <p className={`text-sm leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    "{testimonial.quote}"
                  </p>

                  <div className="flex mt-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* See ClickTales in Action - 2025 Hero Design */}
      <motion.section 
        className={`relative py-24 overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-b from-zinc-900 via-black to-zinc-900' 
            : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full ${
              isDark ? 'bg-purple-500/20' : 'bg-purple-300/30'
            } blur-3xl`}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className={`text-5xl md:text-6xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              See ClickTales in{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Action
              </span>
            </motion.h2>
            <motion.p 
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Experience the future of photo booth technology
            </motion.p>
          </motion.div>

          {/* Live Preview Frame */}
          <motion.div
            className="relative max-w-5xl mx-auto mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* Glowing Border Effect */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-30"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Main Preview Container */}
            <div className={`relative rounded-3xl overflow-hidden ${
              isDark 
                ? 'bg-zinc-800/90 border-zinc-700/50' 
                : 'bg-white/90 border-gray-200/50'
            } border backdrop-blur-xl shadow-2xl`}>
              {/* Top Bar */}
              <div className={`flex items-center justify-between px-6 py-4 ${
                isDark ? 'bg-zinc-700/50' : 'bg-gray-100/50'
              } border-b border-gray-600/20`}>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className={`text-sm font-mono ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  ClickTales Live Preview
                </span>
                <div></div>
              </div>

              {/* Preview Content */}
              <div className="aspect-video bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/10"></div>
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-8 left-8 w-4 h-4 bg-white/30 rounded-full"
                />
                <motion.div
                  animate={{ 
                    y: [0, 15, 0],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-8 right-12 w-3 h-3 bg-white/20 rounded-full"
                />

                {/* Central Content */}
                <motion.div 
                  className="text-center text-white relative z-10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="mb-6"
                    animate={{ 
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Camera className="w-24 h-24 mx-auto opacity-90" />
                  </motion.div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-3">Live Camera Interface</h3>
                  <p className="text-lg opacity-80 mb-8 max-w-md mx-auto">
                    Professional photo booth experience with real-time filters and effects
                  </p>
                  
                  {/* Action Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <Link to={user ? "/camera" : "/login"}>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-full border border-white/30 transition-all duration-300 flex items-center space-x-3 shadow-lg"
                      >
                        <Camera className="w-5 h-5" />
                        <span>{user ? "Launch Camera" : "Try Demo"}</span>
                      </motion.button>
                    </Link>
                    
                    <Link to={user ? "/gallery" : "/login"}>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-full transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl"
                      >
                        <span>{user ? "View Gallery" : "Explore Gallery"}</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              { icon: Camera, text: "Real-Time Capture", color: "from-purple-500 to-pink-500" },
              { icon: Sparkles, text: "Live Filters & Effects", color: "from-blue-500 to-cyan-500" },
              { icon: Share2, text: "Instant Sharing", color: "from-emerald-500 to-teal-500" }
            ].map((feature) => (
              <motion.div
                key={feature.text}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -5 }}
                className={`text-center p-6 rounded-2xl ${
                  isDark 
                    ? 'bg-zinc-800/50 border-zinc-700/50' 
                    : 'bg-white/50 border-gray-200/50'
                } border backdrop-blur-sm transition-all duration-300`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.text}
                </h4>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>



      {/* Ready to Get Started - 2025 Modern CTA */}
      <section className={`relative py-32 overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black' 
          : 'bg-gradient-to-br from-slate-100 via-white to-purple-50'
      }`}>
        {/* Minimal Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full ${
              isDark ? 'bg-purple-600/5' : 'bg-purple-300/10'
            } blur-3xl`}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Modern Minimal Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className={`text-7xl md:text-8xl font-light mb-8 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Start</span>
            </motion.h2>

            <motion.p 
              className={`text-xl font-light mb-16 max-w-2xl mx-auto ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join the next generation of photo experiences
            </motion.p>
            
            {/* Modern Button Design */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link to={user ? "/photobooth" : "/login"}>
                <motion.button
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative px-12 py-4 rounded-2xl font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <Camera className="w-5 h-5" />
                    <span>{user ? "Start Creating" : "Get Started"}</span>
                  </span>
                </motion.button>
              </Link>
              
              <Link to="/gallery">
                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative px-12 py-4 rounded-2xl font-medium border transition-all duration-300 ${
                    isDark
                      ? 'border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <span>Explore Gallery</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative py-20 overflow-hidden ${
        isDark 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-900 text-white'
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-600/10 to-transparent"
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Floating Particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`footer-particle-${i}`}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              style={{
                left: `${20 + i * 25}%`,
                top: `${30 + i * 15}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.5, 0.1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Main Footer Content */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {/* Company Info */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="flex items-center space-x-3 mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Camera className="w-7 h-7 text-white" />
                </motion.div>
                <span className="text-3xl font-bold">ClickTales</span>
              </motion.div>
              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                <span className="font-bold">Professional Photo Booth Platform.</span> Complete solution for events, photographers, and organizers with intuitive camera interface, gallery management, and seamless sharing.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <a 
                  href="mailto:hello@clicktales.com" 
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <span className="text-lg">📧</span>
                  <span>hello@clicktales.com</span>
                </a>
                <div className="text-gray-400 text-sm">
                  <p>Open source • Built for creators</p>
                </div>
              </div>
            </motion.div>

            {/* Features & Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold mb-6 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Features
              </h4>
              <ul className="space-y-3">
                {[
                  'Live Camera',
                  'Photo Gallery',
                  'User Profiles',
                  'Album Management'
                ].map((item, i) => (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-gray-400 text-sm flex items-center space-x-2">
                      <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                      <span>{item}</span>
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Pages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Pages
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Photobooth', path: '/photobooth', public: true },
                  { name: 'Gallery', path: '/gallery', public: true },
                  { name: 'Albums', path: '/albums', public: true },
                  { name: 'Camera', path: '/camera', public: true }
                ].map((item, i) => (
                  <motion.li 
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link 
                      to={item.path}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm hover:underline flex items-center space-x-2 group"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>{item.name}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact & Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold mb-6 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                Support
              </h4>
              
              <div className="space-y-4">
                <a 
                  href="mailto:hello@clicktales.com" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <span className="text-lg">📧</span>
                  <span className="text-sm">Support</span>
                </a>
                
                <div className="text-gray-400 text-sm space-y-1">
                  <button className="flex items-center space-x-2 hover:text-white transition-colors duration-300">
                    <span className="text-lg">🌐</span>
                    <span>English</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>


          
          {/* Copyright */}
          <motion.div 
            className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.p 
              className="text-gray-400 text-sm flex items-center space-x-2"
              whileHover={{ color: '#a855f7' }}
              transition={{ duration: 0.3 }}
            >
              <span>© 2025 ClickTales.</span>
              <span>Open source photo booth platform.</span>
            </motion.p>
            
            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <span>Made with ❤️ by creators</span>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
