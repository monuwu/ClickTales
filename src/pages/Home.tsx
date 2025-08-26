import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Sparkles, ArrowRight, Users, Heart, Download, Zap, Shield, Smartphone, TrendingUp, Award, Star, Clock, Image, Calendar, Share2 } from '../components/icons'
import Navigation from '../components/Navigation'

const Home: React.FC = () => {
  const location = useLocation()
  const featuresRef = useRef<HTMLElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Slideshow data
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
  }, [location.hash])

  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Instant Capture",
      description: "Take photos quickly with live preview and easy editing.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Group Shots",
      description: "Smart framing ensures everyone fits in the picture.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Memorable Events",
      description: "Perfect for weddings, parties, and celebrations.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Easy Sharing",
      description: "Share instantly via QR codes or social media.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast Performance",
      description: "Smooth, responsive, and ready when you are.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Enhancement",
      description: "Automatically improve each photo for professional results.",
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
              className="absolute inset-0"
              style={{ 
                zIndex: currentSlide === index ? 1 : 0,
                backgroundImage: `url(${slide.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40" />
              
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

      {/* Features Section - Enhanced Cards with Modern Design */}
      <section id="features" ref={featuresRef} className="py-16 md:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Enhanced Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 md:top-20 left-10 md:left-20 w-20 md:w-40 h-20 md:h-40 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              y: [0, 50, 0],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-10 md:bottom-20 right-10 md:right-20 w-32 md:w-52 h-32 md:h-52 bg-gradient-to-r from-blue-300/30 to-cyan-300/30 rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, -25, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 w-16 md:w-32 h-16 md:h-32 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full filter blur-2xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-24"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-200/50 rounded-full px-6 md:px-10 py-3 md:py-5 mb-6 md:mb-10 shadow-2xl backdrop-blur-sm">
              <Sparkles className="w-5 md:w-7 h-5 md:h-7 text-purple-600 mr-2 md:mr-4 animate-pulse" />
              <span className="text-purple-700 font-bold text-lg md:text-xl tracking-wide">Powerful Features</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold text-gray-900 mb-4 md:mb-8 leading-tight tracking-tight">
              Why 
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent block mt-2 md:mt-4">
                ClickTales?
              </span>
            </h2>
            <p className="text-lg md:text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed font-medium px-4">
              Everything you need for the perfect photobooth experience, powered by cutting-edge technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                className="group relative bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden"
              >
                {/* Enhanced Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-8 rounded-2xl md:rounded-3xl transition-opacity duration-500`}></div>
                
                {/* Decorative Corner Element */}
                <div className="absolute top-0 right-0 w-12 md:w-24 h-12 md:h-24 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-2xl md:rounded-bl-3xl"></div>
                
                {/* Enhanced Icon */}
                <div className={`relative w-16 md:w-24 h-16 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 md:mb-8 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl md:rounded-3xl group-hover:bg-white/30 transition-colors duration-300"></div>
                  <div className="relative z-10 text-xl md:text-2xl">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="relative text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-6 group-hover:text-purple-700 transition-colors duration-400 leading-tight">
                  {feature.title}
                </h3>
                <p className="relative text-gray-600 leading-relaxed text-base md:text-lg font-medium mb-4 md:mb-6">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced Animated Counters */}
      <section className="py-16 md:py-32 bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 relative overflow-hidden">
        {/* Enhanced Animated Background Pattern */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -100, -20],
                opacity: [0, 0.6, 0],
                scale: [0.3, 1.2, 0.3],
                rotate: [0, 360, 0],
              }}
              transition={{
                duration: 12 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 12,
              }}
              className="absolute w-2 md:w-3 h-2 md:h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-20px',
              }}
            />
          ))}
          
          {/* Floating Geometric Shapes */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 md:top-20 left-10 md:left-20 w-16 md:w-32 h-16 md:h-32 border-2 border-blue-400/20 rounded-lg"
          />
          <motion.div
            animate={{
              rotate: -360,
              y: [0, 40, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-16 md:bottom-32 right-16 md:right-32 w-12 md:w-24 h-12 md:h-24 border-2 border-purple-400/20 rounded-full"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-24"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold text-white mb-4 md:mb-8 leading-tight">
              Global Reach & 
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2 md:mt-4">
                Trust
              </span>
            </h2>
            <p className="text-lg md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium px-4">
              Trusted by creators worldwide to capture life's most precious moments
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {[
              { number: "25K+", label: "Active Users", description: "Creators capturing moments globally.", color: "from-violet-400 to-purple-400", icon: <Users className="w-6 md:w-8 h-6 md:h-8" /> },
              { number: "2M+", label: "Photos Created", description: "Stunning memories preserved forever.", color: "from-cyan-400 to-blue-400", icon: <Image className="w-6 md:w-8 h-6 md:h-8" /> },
              { number: "5K+", label: "Live Events", description: "Celebrations brought to life worldwide.", color: "from-emerald-400 to-green-400", icon: <Calendar className="w-6 md:w-8 h-6 md:h-8" /> },
              { number: "4.9/5", label: "User Rating", description: "Exceptional satisfaction across all platforms.", color: "from-amber-400 to-orange-400", icon: <Star className="w-6 md:w-8 h-6 md:h-8" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.3 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: index * 0.3 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { duration: 0.4 } 
                }}
                className="group text-center bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 hover:bg-white/20 transition-all duration-500 border border-white/20 relative overflow-hidden"
              >
                {/* Background Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl md:rounded-3xl transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <motion.div 
                  className={`relative w-12 md:w-16 h-12 md:h-16 bg-gradient-to-r ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 10 }}
                >
                  {stat.icon}
                </motion.div>
                
                <motion.div 
                  className={`relative text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 md:mb-4 tracking-tight`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.3 + 0.5 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.div>
                <p className="relative text-white font-bold text-sm md:text-xl mb-1 md:mb-3 group-hover:text-gray-100 transition-colors duration-300">{stat.label}</p>
                <p className="relative text-gray-400 text-xs md:text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300 hidden sm:block">{stat.description}</p>

                {/* Interactive Pulse Effect */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>

          {/* Additional Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-20 flex flex-wrap justify-center gap-4 md:gap-8"
          >
            {[
              { icon: <Award className="w-4 md:w-6 h-4 md:h-6" />, text: "Industry Leader", color: "from-yellow-400 to-orange-400" },
              { icon: <Shield className="w-4 md:w-6 h-4 md:h-6" />, text: "Enterprise Grade", color: "from-green-400 to-emerald-400" },
              { icon: <Zap className="w-4 md:w-6 h-4 md:h-6" />, text: "99.9% Uptime", color: "from-blue-400 to-cyan-400" }
            ].map((badge, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -3 }}
                className="flex items-center space-x-2 md:space-x-3 bg-white/10 backdrop-blur-lg rounded-full px-4 md:px-6 py-2 md:py-3 border border-white/20"
              >
                <div className={`bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}>
                  {badge.icon}
                </div>
                <span className="text-white font-medium text-sm md:text-base">{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced User Reviews Grid */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-16 left-16 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full filter blur-3xl"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Creator 
              <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                Testimonials
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Real stories from photographers, event planners, and content creators
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "ClickTales revolutionized our wedding photography workflow. The instant sharing feature was a game-changer for our clients!",
                name: "Alexandra Stone",
                role: "Wedding Photographer",
                initial: "A",
                color: "from-rose-400 to-pink-400"
              },
              {
                quote: "The AI-enhanced filters save us hours of post-processing. Our corporate event photography has never looked better.",
                name: "David Martinez",
                role: "Creative Director",
                initial: "D",
                color: "from-blue-400 to-indigo-400"
              },
              {
                quote: "My social media content creation became 10x faster. The quality is consistently professional-grade every time.",
                name: "Luna Chang",
                role: "Content Creator",
                initial: "L",
                color: "from-green-400 to-teal-400"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Star Rating */}
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg 
                      key={i} 
                      className="w-6 h-6 text-yellow-400 fill-current" 
                      viewBox="0 0 20 20"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.2 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-gray-700 leading-relaxed mb-8 text-lg font-medium italic">
                  "{testimonial.quote}"
                </p>
                
                {/* User Info */}
                <div className="flex items-center">
                  <div className={`w-14 h-14 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg`}>
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Start Capturing Your Moments */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
        {/* Dynamic Background Animation */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -120, -20],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 10 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 10,
              }}
              className="absolute w-3 h-3 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-30px',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Begin Your 
              <span className="block text-gradient bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mt-4">
                Creative Story
              </span>
            </h2>
            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
              Join the revolution of instant, professional-quality photography
            </p>
          </motion.div>

          {/* CTA Buttons - Enhanced Design */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 mb-12 md:mb-24">
            <Link to="/camera">
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-white text-purple-600 font-black py-4 md:py-8 px-8 md:px-16 rounded-2xl md:rounded-4xl text-lg md:text-2xl transition-all duration-500 shadow-3xl hover:shadow-4xl overflow-hidden w-full sm:w-auto"
              >
                {/* Background Gradient Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                {/* Button Content */}
                <span className="relative flex items-center justify-center space-x-3 md:space-x-5">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Camera className="w-6 md:w-10 h-6 md:h-10 group-hover:text-purple-700 transition-colors duration-300" />
                  </motion.div>
                  <span className="group-hover:text-purple-700 transition-colors duration-300">Launch Studio</span>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 md:w-8 h-5 md:h-8 group-hover:translate-x-2 group-hover:text-purple-700 transition-all duration-300" />
                  </motion.div>
                </span>

                {/* Shine Effect */}
                <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000"></div>
              </motion.button>
            </Link>
            
            <Link to="/gallery">
              <motion.button
                whileHover={{ 
                  scale: 1.02, 
                  y: -3,
                  boxShadow: "0 20px 40px -12px rgba(255, 255, 255, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-white/20 backdrop-blur-xl text-white border-2 md:border-3 border-white/40 font-bold py-4 md:py-8 px-8 md:px-16 rounded-2xl md:rounded-4xl text-lg md:text-2xl hover:bg-white/30 hover:border-white/60 transition-all duration-500 shadow-2xl overflow-hidden w-full sm:w-auto"
              >
                {/* Background Pulse */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <span className="relative flex items-center justify-center space-x-2 md:space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image className="w-5 md:w-8 h-5 md:h-8" />
                  </motion.div>
                  <span>Explore Creations</span>
                </span>

                {/* Border Glow Animation */}
                <div className="absolute inset-0 rounded-2xl md:rounded-4xl border-2 border-white/0 group-hover:border-white/40 transition-all duration-500"></div>
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Clean and Minimal */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ClickTales
                </h3>
                <p className="text-gray-400 mb-8 max-w-md text-lg leading-relaxed">
                  Creating memories, one click at a time. The ultimate photobooth experience for events, celebrations, and special moments.
                </p>
                {/* Social/Brand Icon */}
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">C</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/camera" className="text-gray-400 hover:text-white transition-colors duration-300 text-lg">
                    Camera
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="text-gray-400 hover:text-white transition-colors duration-300 text-lg">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="text-gray-400 hover:text-white transition-colors duration-300 text-lg">
                    Features
                  </Link>
                </li>
              </ul>
            </motion.div>
            
            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300 text-lg">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-300 text-lg">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-300 text-lg">
                    Contact
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>
          
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 pt-8 text-center"
          >
            <p className="text-gray-500 text-lg">
              © 2025 ClickTales. All rights reserved. Made with ❤️ for creating memories.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default Home
