import React from 'react'
import { motion } from 'framer-motion'
import { User } from '../components/icons'
import Navigation from '../components/Navigation'
import { useAuth } from '../contexts/AuthContext'

const Settings: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-pink-100 flex items-center justify-center pt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access settings</h2>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-pink-100 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600">Settings page is working! User: {user.name}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Settings
