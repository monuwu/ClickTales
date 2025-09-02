import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Save, Camera, Palette } from '../components/icons'
import type { PhotoboothConfig } from '../types'

const Admin: React.FC = () => {
  const [config, setConfig] = useState<PhotoboothConfig>({
    cameraSettings: {
      width: 1280,
      height: 720,
      timerEnabled: false,
      timerDuration: 3
    },
    enableFilters: true,
    enableGallery: true,
    enablePrint: false,
    enableTimer: true,
    enableCollage: false,
    autoSave: true
  })

  const handleSave = () => {
    // In a real app, you'd save to local storage or API
    localStorage.setItem('photoboothConfig', JSON.stringify(config))
    alert('Settings saved!')
  }

  const updateCameraSetting = (key: keyof typeof config.cameraSettings, value: number) => {
    setConfig(prev => ({
      ...prev,
      cameraSettings: {
        ...prev.cameraSettings,
        [key]: value
      }
    }))
  }

  const updateConfig = (key: keyof Omit<PhotoboothConfig, 'cameraSettings'>, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-purple-200/30 shadow-lg p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ⚙️ Admin Panel
          </h1>
          <div></div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera Settings */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-6">
              <Camera className="w-6 h-6 text-purple-600" />
              Camera Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Width:
                </label>
                <input
                  type="number"
                  value={config.cameraSettings.width}
                  onChange={(e) => updateCameraSetting('width', parseInt(e.target.value))}
                  min="640"
                  max="1920"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200/30 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Height:
                </label>
                <input
                  type="number"
                  value={config.cameraSettings.height}
                  onChange={(e) => updateCameraSetting('height', parseInt(e.target.value))}
                  min="480"
                  max="1080"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200/30 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Feature Settings */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-6">
              <Palette className="w-6 h-6 text-purple-600" />
              Features
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableFilters}
                  onChange={(e) => updateConfig('enableFilters', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-700 font-medium">Enable Photo Filters</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableGallery}
                  onChange={(e) => updateConfig('enableGallery', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-700 font-medium">Enable Gallery</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enablePrint}
                  onChange={(e) => updateConfig('enablePrint', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-700 font-medium">Enable Printing</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSave}
                  onChange={(e) => updateConfig('autoSave', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-700 font-medium">Auto-save Photos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={handleSave} 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default Admin
