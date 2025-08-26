import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Sparkles, ArrowRight, Users, Heart, Download, Zap, Shield, Smartphone } from '../components/icons'
import Navigation from '../components/Navigation'

const Home: React.FC = () => {
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
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy First",
      description: "Your photos stay private - all processing happens locally in your browser",
      color: "from-indigo-500 to-purple-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-inter">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-8"
            >
              <div className="inline-flex items-center bg-white/60 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6 shadow-lg">
                <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-purple-700 font-medium">Modern Photobooth Experience</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-poppins font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Capture
                </span>
                <br />
                <span className="text-gray-900">Amazing Moments</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform any device into a professional photobooth. Perfect for events, parties, 
                or just having fun with friends and family.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/camera">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <div className="flex items-center space-x-3">
                    <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Start Taking Photos</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </motion.button>
              </Link>
              
              <Link to="/demo">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/70 hover:bg-white/90 backdrop-blur-sm text-purple-700 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center space-x-2">
                    <span>🧪</span>
                    <span>View Demo</span>
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative mx-auto max-w-4xl"
            >
              <div className="relative bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative z-10 text-white text-center"
                  >
                    <Camera className="w-24 h-24 mx-auto mb-4 opacity-90" />
                    <p className="text-2xl font-poppins font-semibold">Live Camera Preview</p>
                    <p className="text-lg opacity-75 mt-2">Click "Start Taking Photos" to begin</p>
                  </motion.div>
                  
                  {/* Floating elements */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-6 left-6 w-4 h-4 bg-white/30 rounded-full"
                  ></motion.div>
                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-8 right-8 w-6 h-6 bg-white/20 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-900 mb-4">
                Why Choose ClickTales?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need for the perfect photobooth experience, built with modern technology
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-poppins font-bold text-gray-900 mb-3">
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

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
              Ready to Start Creating?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of users who are already creating amazing memories with ClickTales
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-gray-50"
                >
                  Get Started Free
                </motion.button>
              </Link>
              
              <Link to="/camera">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 border border-white/30"
                >
                  Try Now
                </motion.button>
              </Link>
            </div>
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
