import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Sparkles, ArrowRight, Users, Heart, Zap, Settings, Share2, Smartphone, Shield } from '../components/icons'
import Navigation from '../components/Navigation'

const LandingPage: React.FC = () => {
  console.log('LandingPage component is rendering...')
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
      subtitle: "Advanced filters and AI enhancement deliver studio-quality results with every capture.",
      backgroundImage: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&crop=center&auto=format&q=80"
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

  // Enhanced features with modern approach
  const features = [
    {
      icon: Camera,
      title: "Instant Photo Magic",
      description: "AI-powered camera with real-time filters, smart framing, and professional-grade image processing",
      color: "from-purple-500 to-pink-500",
      stats: "99.9% uptime"
    },
    {
      icon: Users,
      title: "Smart Group Detection", 
      description: "Automatically detects groups, optimizes framing, and ensures everyone looks their best",
      color: "from-blue-500 to-cyan-500",
      stats: "Up to 50 people"
    },
    {
      icon: Sparkles,
      title: "Studio-Quality Filters",
      description: "Professional filters, lighting effects, and beauty enhancements for Instagram-ready photos",
      color: "from-emerald-500 to-teal-500",
      stats: "100+ filters"
    },
    {
      icon: Share2,
      title: "Instant Sharing Hub",
      description: "QR codes, email, social media, and cloud storage integration for seamless photo distribution",
      color: "from-orange-500 to-red-500",
      stats: "Share in seconds"
    },
    {
      icon: Zap,
      title: "Lightning Performance",
      description: "Ultra-fast processing, zero lag, and optimized for high-volume events and celebrations",
      color: "from-violet-500 to-purple-500",
      stats: "< 0.5s processing"
    },
    {
      icon: Heart,
      title: "Memory Preservation",
      description: "Automatic backup, cloud sync, and lifetime storage for all your precious moments",
      color: "from-pink-500 to-rose-500",
      stats: "Unlimited storage"
    }
  ]

  // Updated testimonials with more detail
  const testimonials = [
    {
      name: "Marcus & Lisa Chen",
      role: "Event Planners",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
      quote: "As professional event planners, we've used many photo solutions, but ClickTales stands out for its reliability and guest engagement. The AI enhancement features are incredible!",
      rating: 5,
      event: "Corporate Launch",
      photos: "750+ photos"
    },
    {
      name: "TechCorp Annual Gala", 
      role: "Event Coordinator",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
      quote: "Professional setup, seamless operation, and fantastic results. Our employees are still talking about how fun and easy it was. Perfect for corporate events!",
      rating: 5,
      event: "Corporate Gala",
      photos: "300+ photos"
    },
    {
      name: "Emily's Sweet 16",
      role: "Proud Mom",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&auto=format&q=80", 
      quote: "The kids absolutely loved it! The filters were so fun and creative. We ended up with beautiful memories that will last forever. Highly recommend for any celebration!",
      rating: 5,
      event: "Birthday Party",
      photos: "200+ photos"
    }
  ]

  // How it works steps
  const steps = [
    {
      number: "01",
      title: "Quick Setup",
      description: "Connect your camera and configure settings in under 2 minutes",
      icon: Settings,
      color: "from-purple-400 to-pink-400"
    },
    {
      number: "02", 
      title: "Start Capturing",
      description: "Guests take photos with built-in filters, effects, and smart framing",
      icon: Camera,
      color: "from-blue-400 to-cyan-400"
    },
    {
      number: "03",
      title: "Instant Magic",
      description: "Photos are processed, enhanced, and ready for sharing in seconds",
      icon: Sparkles,
      color: "from-emerald-400 to-teal-400"
    },
    {
      number: "04",
      title: "Share & Save",
      description: "QR codes, email sharing, and automatic backup ensure no memory is lost",
      icon: Share2,
      color: "from-orange-400 to-red-400"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-rose-50/20">
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
          className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 rounded-full blur-3xl"
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
          className="absolute bottom-32 right-32 w-72 h-72 bg-gradient-to-r from-yellow-400/8 via-orange-400/8 to-red-400/8 rounded-full blur-3xl"
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
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-200/30 shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Navigation />
      </motion.div>
      
      {/* Hero Slideshow Section - PRESERVED EXACTLY */}
      <section className="relative h-screen overflow-hidden pt-16">
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
                    <Link to="/photobooth">
                      <motion.button
                        whileHover={{ 
                          scale: 1.05, 
                          y: -8,
                          rotate: -2,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-white text-gray-900 font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 overflow-hidden"
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
                        <span className="relative z-10">Start Creating</span>
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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See ClickTales in <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            <div className="relative bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30">
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
                    <Link to="/camera">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl border border-white/30 transition-all duration-300 flex items-center space-x-2"
                      >
                        <Camera className="w-5 h-5" />
                        <span>Try Now</span>
                      </motion.button>
                    </Link>
                    
                    <Link to="/gallery">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/90 hover:bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2"
                      >
                        <span>View Gallery</span>
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
                    className="flex items-center space-x-3 text-gray-700"
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

      {/* Stats Section */}
      <section className="relative py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Photos Captured", color: "from-purple-600 to-pink-600" },
              { number: "99.9%", label: "Uptime", color: "from-blue-600 to-cyan-600" },
              { number: "500+", label: "Events", color: "from-emerald-600 to-teal-600" },
              { number: "24/7", label: "Support", color: "from-orange-600 to-red-600" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="relative py-24 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">ClickTales</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets stunning design for the ultimate photo booth experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  {/* Enhanced Icon with Hover Animation */}
                  <motion.div 
                    className={`inline-flex items-center justify-center w-16 h-16 p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg group-hover:shadow-xl`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <feature.icon className="w-8 h-8" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  <motion.div 
                    className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${feature.color} rounded-full shadow-sm`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-sm font-semibold text-white">
                      {feature.stats}
                    </span>
                  </motion.div>
                </div>

                {/* Subtle Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl blur-xl transition-opacity duration-500 -z-10`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple 4-step process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50"
              >
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl mb-6 shadow-lg`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Customers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real events powered by ClickTales
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-4 border-white shadow-lg"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-purple-600 font-medium">{testimonial.event}</p>
                    <p className="text-sm text-gray-500">{testimonial.photos}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Heart key={i} className="w-5 h-5 text-pink-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
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
              <span className="relative z-10 drop-shadow-2xl">
                Ready to Create Amazing Memories?
              </span>
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
              Join thousands of satisfied customers and start capturing unforgettable moments today
            </motion.p>
            
            {/* Enhanced Buttons with Spectacular Effects */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link to="/photobooth">
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
                  <span className="relative z-10">Start Free Trial</span>

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
      <footer className="relative bg-gray-900 text-white py-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Subtle Gradient Waves */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-600/10 to-transparent"
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Floating Code Symbols */}
          {['</>', '{}', '[]', '<>', '()'].map((symbol, i) => (
            <motion.div
              key={`footer-symbol-${i}`}
              className="absolute text-purple-500/20 text-2xl font-mono"
              style={{
                left: `${15 + i * 20}%`,
                top: `${20 + Math.sin(i) * 30}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 12 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2,
              }}
            >
              {symbol}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="md:col-span-2"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <motion.div 
                className="flex items-center space-x-3 mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Camera className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-2xl font-bold">ClickTales</span>
              </motion.div>
              <p className="text-gray-300 leading-relaxed max-w-md mb-6">
                Creating unforgettable memories with cutting-edge photo booth technology. 
                Perfect for weddings, parties, corporate events, and special celebrations.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social, i) => (
                  <motion.div 
                    key={social}
                    className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center cursor-pointer text-white font-semibold shadow-lg hover:shadow-xl"
                    whileHover={{ 
                      scale: 1.1, 
                      y: -2,
                      boxShadow: '0 20px 40px rgba(147, 51, 234, 0.4)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {social.charAt(0)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Photo Booth', path: '/photobooth' },
                  { name: 'Camera', path: '/camera' },
                  { name: 'Gallery', path: '/gallery' },
                  { name: 'Features', path: '#features' }
                ].map((link, i) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link 
                      to={link.path} 
                      className="text-gray-300 hover:text-purple-400 transition-colors relative group"
                    >
                      <span className="relative z-10">{link.name}</span>
                      <motion.span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400"
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Help Center', path: '/help' },
                  { name: 'Privacy Policy', path: '/privacy' },
                  { name: 'Terms of Service', path: '/terms' },
                  { name: 'Contact Us', path: '/contact' }
                ].map((link, i) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link 
                      to={link.path} 
                      className="text-gray-300 hover:text-purple-400 transition-colors relative group"
                    >
                      <span className="relative z-10">{link.name}</span>
                      <motion.span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400"
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
          
          {/* Tech Highlights Section */}
          <motion.div 
            className="border-t border-gray-700 pt-8 pb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 text-gray-400"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ color: '#a855f7', scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Smartphone className="w-5 h-5" />
                <span className="font-medium">Mobile Ready</span>
              </motion.div>
              <span className="text-gray-600">•</span>
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ color: '#a855f7', scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Privacy First</span>
              </motion.div>
              <span className="text-gray-600">•</span>
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ color: '#a855f7', scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="w-5 h-5" />
                <span className="font-medium">Lightning Fast</span>
              </motion.div>
              <span className="text-gray-600">•</span>
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ color: '#a855f7', scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Camera className="w-5 h-5" />
                <span className="font-medium">Professional Quality</span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.p 
              className="text-gray-400 mb-4 md:mb-0"
              whileHover={{ color: '#a855f7' }}
              transition={{ duration: 0.3 }}
            >
              © 2025 ClickTales. All rights reserved. Made with ❤️ for creating unforgettable memories.
            </motion.p>
            <motion.div 
              className="flex items-center space-x-4 text-sm text-gray-400"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.span whileHover={{ color: '#a855f7', scale: 1.05 }}>
                Powered by React & Vite
              </motion.span>
              <span>•</span>
              <motion.span 
                whileHover={{ color: '#a855f7', scale: 1.05 }}
                className="cursor-pointer"
              >
                v2.0.0
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
