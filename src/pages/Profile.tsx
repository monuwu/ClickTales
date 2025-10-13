import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Calendar, Edit2, Camera } from '../components/icons'
import Navigation from '../components/Navigation'
import { useAuth } from '../contexts/AuthContext'

const Profile: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-pink-100 flex items-center justify-center pt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h2>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </>
    )
  }

  const joinDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-pink-100 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-16 w-16 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
                  <Camera className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h1>
                    <p className="text-gray-600 text-lg">@{user.email.split('@')[0]}</p>
                  </div>
                  <Link
                    to="/settings"
                    className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white/50 hover:bg-white/70 transition-all duration-300"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </div>

                {/* Role Badge */}
                <div className="flex justify-center md:justify-start mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Shield className="h-4 w-4 mr-1" />
                    User
                  </span>
                </div>

                {/* Bio Section */}
                <div className="bg-gray-50/50 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Welcome to ClickTales! I love capturing moments and creating memories through our amazing photobooth experience.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Address</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Username */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Username</p>
                  <p className="text-gray-900">@{user.email.split('@')[0]}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-gray-900">{joinDate}</p>
                </div>
              </div>

              {/* Account Type */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Account Type</p>
                  <p className="text-gray-900">Standard User</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photos Taken */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-purple-600 mb-2">0</h3>
                <p className="text-gray-600">Photos Taken</p>
              </div>

              {/* Sessions */}
              <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-pink-600 mb-2">0</h3>
                <p className="text-gray-600">Total Sessions</p>
              </div>

              {/* Account Age */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-600 mb-2">New</h3>
                <p className="text-gray-600">Member Status</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Profile
