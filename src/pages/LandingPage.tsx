import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Camera, Sparkles, ArrowRight, Users, Heart, Download, Zap, Share2 } from '../components/icons'
import Navigation from '../components/Navigation'

const LandingPage: React.FC = () => {
  const location = useLocation()
  const featuresRef = useRef<HTMLElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { scrollYProgress } = useScroll()
  
  // Smooth scroll-based animations
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

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

  // How It Works steps - UPDATED WITH ICONS INSTEAD OF NUMBERS
  const steps = [
    {
      title: "Set Up",
      description: "Quick 2-minute setup with your camera and preferred settings",
      icon: <Camera className="w-8 h-8" />
    },
    {
      title: "Capture",
      description: "Guests take amazing photos with built-in filters and effects",
      icon: <Sparkles className="w-8 h-8" />
    },
    {
      title: "Share",
      description: "Instant sharing via QR codes, email, or direct download",
      icon: <Share2 className="w-8 h-8" />
    }
  ]

  // Modern 2025 Features
  const features = [
    {
      icon: <Camera className="w-7 h-7" />,
      title: "Instant Capture",
      description: "Lightning-fast photo capture with real-time filters and instant sharing capabilities"
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Group Magic",
      description: "Perfect group shots with smart framing and automatic countdown timers"
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "Pro Filters",
      description: "Studio-quality filters and effects that make every photo Instagram-ready"
    },
    {
      icon: <Heart className="w-7 h-7" />,
      title: "Memory Maker",
      description: "Create unforgettable moments for weddings, parties, and special celebrations"
    },
    {
      icon: <Download className="w-7 h-7" />,
      title: "Share Instantly",
      description: "QR codes, email sharing, and social media integration built right in"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Lightning Fast",
      description: "Optimized performance ensures smooth operation even with large groups"
    }
  ]

  // Testimonials with profile pictures
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Wedding Bride",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
      quote: "ClickTales made our wedding reception unforgettable! The photo quality is amazing and setup was so easy.",
      rating: 5
    },
    {
      name: "Michael Chen", 
      role: "Event Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
      quote: "Perfect for our corporate event! Professional quality photos and the team loved the interactive experience.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Parent",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&auto=format&q=80", 
      quote: "My kids' birthday party was a hit! The filters are fun and the photos came out beautifully.",
      rating: 5
    }
  ]

  // Photo Gallery samples
  const galleryPhotos = [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop&crop=center&auto=format&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&crop=center&auto=format&q=80",
    "https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&h=400&fit=crop&crop=center&auto=format&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=400&fit=crop&crop=center&auto=format&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=400&fit=crop&crop=center&auto=format&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop&crop=center&auto=format&q=80"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-rose-50/20 font-sans overflow-x-hidden">
      {/* Animated Background */}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-pink-50/15 to-violet-100/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.04) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.03) 0%, transparent 50%)`,
        }} />
      </motion.div>

      {/* Navigation - PRESERVED */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-200/30 shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Navigation />
      </motion.div>
      
      {/* Hero Slideshow Section - PRESERVED */}
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
                style={{ opacity: heroOpacity }}
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
                    <Link to="/camera">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white text-gray-900 font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                      >
                        <Camera className="w-5 h-5" />
                        <span>Start Creating</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <Link to="#memories">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="text-white font-medium py-4 px-8 border border-white/30 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                      >
                        Explore Memories
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

      {/* 1. Your Memories Section - FIRST */}
      <section id="memories" className="relative py-20 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-violet-50/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 via-transparent to-purple-50/20" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Memories</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Amazing moments captured with ClickTales
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {galleryPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md border border-purple-200/40 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-300/50">
                  <img
                    src={photo}
                    alt={`Memory ${index + 1}`}
                    className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to="/gallery">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
              >
                View Full Gallery
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. How It Works Section - SECOND */}
      <section className="relative py-20 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-purple-50/40 to-pink-50/50" />
        <div className="absolute inset-0 bg-gradient-to-l from-rose-50/30 via-transparent to-violet-50/20" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get started with your photobooth experience in three simple steps
            </p>
          </motion.div>

          {/* Single Row Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="flex-1 max-w-xs group"
                >
                  <div className="bg-white/80 backdrop-blur-md border border-violet-200/40 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 hover:border-violet-300/50">
                    {/* Icon Circle */}
                    <motion.div 
                      className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:shadow-violet-500/20 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {step.icon}
                    </motion.div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-violet-700 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                    className="hidden lg:flex items-center justify-center"
                  >
                    <ArrowRight className="w-8 h-8 text-violet-400" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why Choose ClickTales - THIRD */}
      <section id="features" ref={featuresRef} className="relative py-20 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-rose-50/40 to-purple-50/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-violet-50/20 via-transparent to-pink-50/30" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose 
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> ClickTales?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional photobooth experience with cutting-edge technology and seamless user experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-white/80 backdrop-blur-md border border-pink-200/40 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:border-pink-300/50"
              >
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-6 text-pink-600 shadow-sm group-hover:scale-105 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  {feature.icon}
                </motion.div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-pink-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Ready to Create Magic - FOURTH */}
      <section className="relative py-20 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 via-violet-50/40 to-indigo-50/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-100/20 via-transparent to-violet-50/30" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-md border border-purple-200/40 rounded-3xl p-12 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Create 
              <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mt-2">
                Magic?
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands who have captured millions of precious moments with ClickTales
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link to="/camera">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex items-center space-x-3"
                >
                  <Camera className="w-5 h-5" />
                  <span>Launch Experience</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              
              <Link to="/gallery">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="text-gray-700 font-medium py-4 px-8 border border-purple-300/50 rounded-2xl hover:bg-purple-50/50 hover:border-purple-400/60 transition-all duration-300"
                >
                  Explore Gallery
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Reviews/Testimonials Section - FIFTH */}
      <section className="relative py-20 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-purple-50/50" />
        <div className="absolute inset-0 bg-gradient-to-l from-violet-50/30 via-transparent to-rose-50/20" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Clients Say</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Trusted by thousands for unforgettable moments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-md border border-rose-200/40 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 hover:border-rose-300/50"
              >
                <div className="flex items-center mb-6">
                  <motion.img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-rose-600 font-medium">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.svg 
                      key={i} 
                      className="w-5 h-5 text-yellow-400 fill-current" 
                      viewBox="0 0 20 20"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </motion.svg>
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative bg-white/80 backdrop-blur-md border-t border-purple-200/40 py-16 px-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-pink-50/20 to-violet-50/30" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <motion.h3 
                className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
              >
                ClickTales
              </motion.h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Creating memories, one click at a time. The ultimate photobooth experience for any occasion.
              </p>
              
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'Instagram'].map((social) => (
                  <motion.div 
                    key={social}
                    className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer text-white font-semibold shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    {social.charAt(0)}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-gray-900">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Camera', path: '/camera' },
                  { name: 'Gallery', path: '/gallery' },
                  { name: 'Features', path: '#features' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-600 hover:text-purple-700 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-gray-900">Support</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Help Center', path: '/help' },
                  { name: 'Privacy Policy', path: '/privacy' },
                  { name: 'Contact Us', path: '/contact' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-600 hover:text-purple-700 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-200 pt-8 text-center">
            <p className="text-gray-600">
              © 2025 ClickTales. All rights reserved. Made with ❤️ for creating unforgettable memories.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
