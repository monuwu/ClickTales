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
    <div className="admin-page">
      <header className="admin-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Camera
        </Link>
        <h1>⚙️ Admin Panel</h1>
      </header>

      <div className="admin-content">
        <div className="settings-section">
          <h2>
            <Camera size={20} />
            Camera Settings
          </h2>
          <div className="setting-group">
            <label>
              Resolution Width:
              <input
                type="number"
                value={config.cameraSettings.width}
                onChange={(e) => updateCameraSetting('width', parseInt(e.target.value))}
                min="640"
                max="1920"
              />
            </label>
            <label>
              Resolution Height:
              <input
                type="number"
                value={config.cameraSettings.height}
                onChange={(e) => updateCameraSetting('height', parseInt(e.target.value))}
                min="480"
                max="1080"
              />
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>
            <Palette size={20} />
            Features
          </h2>
          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.enableFilters}
                onChange={(e) => updateConfig('enableFilters', e.target.checked)}
              />
              Enable Photo Filters
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.enableGallery}
                onChange={(e) => updateConfig('enableGallery', e.target.checked)}
              />
              Enable Gallery
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.enablePrint}
                onChange={(e) => updateConfig('enablePrint', e.target.checked)}
              />
              Enable Printing
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.autoSave}
                onChange={(e) => updateConfig('autoSave', e.target.checked)}
              />
              Auto-save Photos
            </label>
          </div>
        </div>

        <div className="admin-actions">
          <button onClick={handleSave} className="save-btn">
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default Admin
