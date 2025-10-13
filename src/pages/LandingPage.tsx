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

      {/* How It Works Section */}
      <section className={`relative py-24 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-800 via-gray-900 to-slate-800' 
          : 'bg-gradient-to-br from-white via-purple-50/30 to-rose-50/20'
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
              <span className="font-bold">How It</span> <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">Works</span>
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
              <span className="font-semibold">Simple 4-step process to get started</span>
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {[
              {
                number: "01",
                title: "Access Camera",
                description: "Click on Camera or Photo Booth to access the camera interface and start taking photos.",
                icon: Settings,
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&auto=format&q=80"
              },
              {
                number: "02",
                title: "Capture Photos",
                description: "Take photos with built-in effects and filters using our intuitive camera interface.",
                icon: Camera,
                image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop&auto=format&q=80"
              },
              {
                number: "03",
                title: "View Gallery",
                description: "Browse all captured photos in the gallery with options to organize and manage your collection.",
                icon: Sparkles,
                image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop&auto=format&q=80"
              },
              {
                number: "04",
                title: "Share & Save",
                description: "Download photos directly or share them with QR codes and direct links.",
                icon: Share2,
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&auto=format&q=80"
              }
            ].map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border ${
                  isDark
                    ? 'bg-gray-800/80 border-gray-700/50'
                    : 'bg-white/80 border-white/50'
                }`}
              >
                <div className="aspect-video overflow-hidden">
                  <motion.img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.number}
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className={`text-base leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits/Why Choose Us Section */}
      <section 
        id="features"
        ref={featuresRef}
        className={`relative py-24 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
            : 'bg-gradient-to-br from-slate-50 via-white to-purple-50/20'
        }`}
      >
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
              <span className="font-bold">Why Choose</span> <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">ClickTales</span>
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
              <span className="font-semibold">Modern photo booth technology for memorable experiences</span>
            </motion.p>
          </motion.div>

          <div className="space-y-32">
            {[
              {
                title: "User-Friendly Interface",
                description: "Clean, intuitive design makes it easy for anyone to take professional-quality photos. Simple navigation and clear buttons ensure a smooth experience for all users.",
                features: ["Responsive Design", "Touch Friendly", "Dark/Light Mode", "Easy Navigation"],
                image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop&auto=format&q=80",
                reversed: false
              },
              {
                title: "Gallery Management",
                description: "Organize and manage your photo collections with smart categorization. Browse, search, and organize photos with an elegant gallery interface.",
                features: ["Photo Organization", "Smart Search", "Album Creation", "Easy Browsing"],
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format&q=80",
                reversed: true
              },
              {
                title: "Modern Technology",
                description: "Built with the latest web technologies for reliability and performance. Responsive design works seamlessly on all devices and screen sizes.",
                features: ["React & TypeScript", "Real-time Updates", "Cross-platform", "Modern UI"],
                image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop&auto=format&q=80",
                reversed: false
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col ${benefit.reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}
              >
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: benefit.reversed ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <h3 className={`text-4xl font-bold mb-6 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {benefit.title}
                    </h3>
                    <p className={`text-lg mb-8 leading-relaxed ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {benefit.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {benefit.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 + featureIndex * 0.1 }}
                          viewport={{ once: true }}
                          className={`flex items-center space-x-3 p-4 rounded-2xl ${
                            isDark 
                              ? 'bg-gray-800/60 border-gray-700/30' 
                              : 'bg-white/60 border-white/30'
                          } border backdrop-blur-sm`}
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                          <span className={`font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
                
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: benefit.reversed ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                      <motion.img
                        src={benefit.image}
                        alt={benefit.title}
                        className="w-full h-80 object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-white font-bold text-2xl">✨</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`relative py-24 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-800 via-gray-900 to-slate-800' 
          : 'bg-gradient-to-br from-white via-purple-50/30 to-rose-50/20'
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
              <span className="font-bold">What Our</span> <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">Users</span> <span className="font-bold">Say</span>
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
              <span className="font-bold">Real feedback from our community</span>
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Thompson",
                role: "Event Photographer",
                company: "Photo Pro Studios",
                rating: 5,
                quote: "ClickTales has transformed how I approach event photography. The interface is intuitive and the gallery management features are exactly what I needed.",
                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%234F46E5'/%3E%3Ctext x='32' y='38' font-family='Arial, sans-serif' font-size='24' font-weight='bold' text-anchor='middle' fill='white'%3EAT%3C/text%3E%3C/svg%3E",
                stats: "50+ Events"
              },
              {
                name: "Maria Garcia",
                role: "Wedding Coordinator",
                company: "Dream Weddings",
                rating: 5,
                quote: "The photo booth feature is a hit at every wedding. Guests love the easy interface and instant sharing capabilities. Highly recommended!",
                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23EC4899'/%3E%3Ctext x='32' y='38' font-family='Arial, sans-serif' font-size='24' font-weight='bold' text-anchor='middle' fill='white'%3EMG%3C/text%3E%3C/svg%3E",
                stats: "100+ Weddings"
              },
              {
                name: "David Kim",
                role: "Party Host",
                company: "Birthday Celebration",
                rating: 5,
                quote: "Used this for my daughter's birthday party. The kids had a blast taking photos and the parents loved seeing all the memories captured so easily.",
                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2306B6D4'/%3E%3Ctext x='32' y='38' font-family='Arial, sans-serif' font-size='24' font-weight='bold' text-anchor='middle' fill='white'%3EDK%3C/text%3E%3C/svg%3E",
                stats: "Family Events"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`relative backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border ${
                  isDark
                    ? 'bg-gray-800/80 border-gray-700/50'
                    : 'bg-white/80 border-white/50'
                }`}
              >
                <div className="flex items-start space-x-4 mb-6">
                  <motion.img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {testimonial.name}
                    </h4>
                    <p className="text-purple-600 font-medium">{testimonial.role}</p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {testimonial.company}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="text-yellow-400 text-xl">★</span>
                    </motion.div>
                  ))}
                </div>
                
                <blockquote className={`text-lg leading-relaxed mb-6 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  "{testimonial.quote}"
                </blockquote>

                <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm`}>
                  <span className="text-sm font-semibold text-white">
                    {testimonial.stats}
                  </span>
                </div>

                <div className="absolute top-6 right-6 text-6xl opacity-10">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>❝</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Interactive Demo Section */}
      <section className="relative py-24 bg-gradient-to-br from-slate-50 via-purple-50/30 to-rose-50/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>
              See ClickTales in <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Experience our intuitive interface before you start creating
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-5xl"
          >
            <div className={`relative backdrop-blur-lg rounded-3xl p-8 shadow-2xl border ${
              isDark 
                ? 'bg-gray-800/60 border-gray-600/30' 
                : 'bg-white/60 border-white/30'
            }`}>
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Simplified floating elements */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 left-6 w-3 h-3 bg-white/20 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-8 right-8 w-3 h-3 bg-white/15 rounded-full"
                ></motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative z-10 text-white text-center"
                >
                  <div className="mb-4">
                    <Camera className="w-20 h-20 mx-auto opacity-90" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold mb-2">Live Camera Preview</p>
                  <p className="text-lg opacity-75 mb-6">Professional photo booth experience in your browser</p>
                  
                  <motion.div 
                    className="flex items-center justify-center gap-6"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Link to={user ? "/camera" : "/login"}>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl border border-white/30 transition-all duration-300 flex items-center space-x-2"
                      >
                        <Camera className="w-5 h-5" />
                        <span>{user ? "Try Now" : "Sign In to Try"}</span>
                      </motion.button>
                    </Link>
                    
                    <Link to={user ? "/gallery" : "/login"}>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/90 hover:bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2"
                      >
                        <span>{user ? "View Gallery" : "Sign In for Gallery"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
                
                {/* Animated border glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-white/20"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255, 255, 255, 0.1)',
                      '0 0 40px rgba(255, 255, 255, 0.2)',
                      '0 0 20px rgba(255, 255, 255, 0.1)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              
              {/* Demo Features */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {[
                  { icon: Camera, text: "One-Click Capture", color: "from-purple-500 to-pink-500" },
                  { icon: Sparkles, text: "Real-Time Filters", color: "from-blue-500 to-cyan-500" },
                  { icon: ArrowRight, text: "Instant Download", color: "from-emerald-500 to-teal-500" }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-center space-x-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color}`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-violet-600 overflow-hidden">
        {/* Enhanced Dynamic Background */}
        <div className="absolute inset-0">
          {/* Animated Gradient Orbs */}
          <motion.div
            className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-full blur-2xl"
            animate={{
              x: [-50, 50, -50],
              y: [-30, 30, -30],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />

          {/* Minimal Floating Geometric Shapes - Reduced to 2 */}
          {[0, 1].map((i) => (
            <motion.div
              key={`cta-shape-${i}`}
              className={`absolute w-4 h-4 bg-white/8 backdrop-blur-sm ${i === 0 ? 'rounded-full' : 'rounded-lg'}`}
              style={{
                left: `${30 + (i * 40)}%`,
                top: `${25 + (i * 30)}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 5,
              }}
            />
          ))}

          {/* Minimal Sparkling Particles - Reduced to 3 */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`cta-particle-${i}`}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${25 + i * 25}%`,
                top: `${30 + i * 15}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 1,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* Enhanced Title with Glow Effect */}
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="relative z-10 drop-shadow-2xl font-bold">Ready to Get Started?</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-pink-400/30 blur-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.h2>

            <motion.p 
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join photographers and event organizers who trust ClickTales for their photo booth needs
            </motion.p>
            
            {/* Enhanced Buttons with Spectacular Effects */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link to={user ? "/photobooth" : "/login"}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-500 flex items-center space-x-3 overflow-hidden"
                >
                  {/* Button Background Effects */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  
                  {/* Sparkle Effects */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`cta-sparkle-${i}`}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${20 + i * 15}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}

                  <Camera className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{user ? "Start Taking Photos" : "Sign In to Start"}</span>

                  {/* Border Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-yellow-400/50"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(250, 204, 21, 0.3)',
                        '0 0 40px rgba(250, 204, 21, 0.6)',
                        '0 0 20px rgba(250, 204, 21, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.button>
              </Link>
              
              <Link to="/gallery">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group text-white font-semibold py-4 px-8 border-2 border-white/30 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-500 overflow-hidden"
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%', skewX: -45 }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                  
                  <span className="relative z-10">View Gallery</span>

                  {/* Animated Border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      borderColor: [
                        'rgba(255, 255, 255, 0.3)',
                        'rgba(255, 255, 255, 0.6)',
                        'rgba(255, 255, 255, 0.3)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ border: '2px solid' }}
                  />
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
