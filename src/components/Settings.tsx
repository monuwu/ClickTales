import React, { useState, useEffect } from 'react'
import type { PhotoboothConfig } from '../types'

interface SettingsProps {
  onClose?: () => void
  onConfigChange?: (config: PhotoboothConfig) => void
}

const Settings: React.FC<SettingsProps> = ({ onClose, onConfigChange }) => {
  const [config, setConfig] = useState<PhotoboothConfig>({
    cameraSettings: {
      width: 1280,
      height: 720,
      deviceId: '',
      timerEnabled: true,
      timerDuration: 3
    },
    enableFilters: true,
    enableGallery: true,
    enablePrint: false,
    enableTimer: true,
    enableCollage: true,
    autoSave: true
  })

  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [activeTab, setActiveTab] = useState<'camera' | 'features' | 'appearance' | 'advanced'>('camera')

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('photobooth-config')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setConfig(parsed)
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    }

    // Get available camera devices
    getAvailableDevices()
  }, [])

  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableDevices(videoDevices)
    } catch (error) {
      console.error('Failed to get devices:', error)
    }
  }

  const updateConfig = (updates: Partial<PhotoboothConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    localStorage.setItem('photobooth-config', JSON.stringify(newConfig))
    
    if (onConfigChange) {
      onConfigChange(newConfig)
    }
  }

  const updateCameraSettings = (updates: Partial<PhotoboothConfig['cameraSettings']>) => {
    updateConfig({
      cameraSettings: { ...config.cameraSettings, ...updates }
    })
  }

  const resetToDefaults = () => {
    const defaultConfig: PhotoboothConfig = {
      cameraSettings: {
        width: 1280,
        height: 720,
        deviceId: '',
        timerEnabled: true,
        timerDuration: 3
      },
      enableFilters: true,
      enableGallery: true,
      enablePrint: false,
      enableTimer: true,
      enableCollage: true,
      autoSave: true
    }
    
    setConfig(defaultConfig)
    localStorage.setItem('photobooth-config', JSON.stringify(defaultConfig))
    
    if (onConfigChange) {
      onConfigChange(defaultConfig)
    }
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'photobooth-config.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string)
        setConfig(importedConfig)
        localStorage.setItem('photobooth-config', JSON.stringify(importedConfig))
        
        if (onConfigChange) {
          onConfigChange(importedConfig)
        }
        
        alert('Configuration imported successfully!')
      } catch (error) {
        alert('Failed to import configuration. Please check the file format.')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
  }

  const renderCameraSettings = () => (
    <div className="settings-section">
      <h3>Camera Settings</h3>
      
      <div className="setting-group">
        <label>Camera Device</label>
        <select
          value={config.cameraSettings.deviceId}
          onChange={(e) => updateCameraSettings({ deviceId: e.target.value })}
        >
          <option value="">Default Camera</option>
          {availableDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label>Resolution</label>
        <select
          value={`${config.cameraSettings.width}x${config.cameraSettings.height}`}
          onChange={(e) => {
            const [width, height] = e.target.value.split('x').map(Number)
            updateCameraSettings({ width, height })
          }}
        >
          <option value="640x480">640x480 (4:3)</option>
          <option value="1280x720">1280x720 (16:9)</option>
          <option value="1920x1080">1920x1080 (16:9)</option>
          <option value="1280x960">1280x960 (4:3)</option>
        </select>
      </div>

      <div className="setting-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={config.cameraSettings.timerEnabled}
            onChange={(e) => updateCameraSettings({ timerEnabled: e.target.checked })}
          />
          Enable Timer
        </label>
      </div>

      {config.cameraSettings.timerEnabled && (
        <div className="setting-group">
          <label>Timer Duration (seconds)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.cameraSettings.timerDuration}
            onChange={(e) => updateCameraSettings({ timerDuration: Number(e.target.value) })}
          />
          <span>{config.cameraSettings.timerDuration}s</span>
        </div>
      )}
    </div>
  )

  const renderFeatureSettings = () => (
    <div className="settings-section">
      <h3>Features</h3>
      
      <div className="setting-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={config.enableFilters}
            onChange={(e) => updateConfig({ enableFilters: e.target.checked })}
          />
          Enable Photo Filters
        </label>
      </div>

      <div className="setting-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={config.enableGallery}
            onChange={(e) => updateConfig({ enableGallery: e.target.checked })}
          />
          Enable Photo Gallery
        </label>
      </div>

      <div className="setting-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={config.enableCollage}
            onChange={(e) => updateConfig({ enableCollage: e.target.checked })}
          />
          Enable Collage Mode
        </label>
      </div>

      <div className="setting-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={config.enableTimer}
            onChange={(e) => updateConfig({ enableTimer: e.target.checked })}
          />
          Enable Countdown Timer
        </label>
      </div>

      <div className="setting-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={config.enablePrint}
            onChange={(e) => updateConfig({ enablePrint: e.target.checked })}
          />
          Enable Photo Printing
        </label>
      </div>

      <div className="setting-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={config.autoSave}
            onChange={(e) => updateConfig({ autoSave: e.target.checked })}
          />
          Auto-save Photos
        </label>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h3>Appearance</h3>
      
      <div className="setting-group">
        <label>Theme</label>
        <select defaultValue="light">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div className="setting-group">
        <label>UI Language</label>
        <select defaultValue="en">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Gallery Layout</label>
        <select defaultValue="grid">
          <option value="grid">Grid</option>
          <option value="masonry">Masonry</option>
          <option value="list">List</option>
        </select>
      </div>
    </div>
  )

  const renderAdvancedSettings = () => (
    <div className="settings-section">
      <h3>Advanced</h3>
      
      <div className="setting-group">
        <label>Storage</label>
        <div className="storage-info">
          <p>Photos stored: {localStorage.getItem('photobooth-photos')?.length || 0} bytes</p>
          <button 
            onClick={() => {
              localStorage.removeItem('photobooth-photos')
              alert('Photo storage cleared!')
            }}
            className="danger-btn"
          >
            Clear All Photos
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label>Configuration</label>
        <div className="config-actions">
          <button onClick={exportConfig} className="secondary-btn">
            Export Config
          </button>
          <input
            type="file"
            accept=".json"
            onChange={importConfig}
            style={{ display: 'none' }}
            id="import-config"
          />
          <button 
            onClick={() => document.getElementById('import-config')?.click()}
            className="secondary-btn"
          >
            Import Config
          </button>
          <button onClick={resetToDefaults} className="danger-btn">
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label>Debug Info</label>
        <div className="debug-info">
          <p>User Agent: {navigator.userAgent.slice(0, 50)}...</p>
          <p>Screen: {window.screen.width}x{window.screen.height}</p>
          <p>Viewport: {window.innerWidth}x{window.innerHeight}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          {onClose && (
            <button onClick={onClose} className="close-btn">×</button>
          )}
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button
              className={`tab ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => setActiveTab('camera')}
            >
              📷 Camera
            </button>
            <button
              className={`tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              ⚡ Features
            </button>
            <button
              className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              🎨 Appearance
            </button>
            <button
              className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              ⚙️ Advanced
            </button>
          </div>

          <div className="settings-panel">
            {activeTab === 'camera' && renderCameraSettings()}
            {activeTab === 'features' && renderFeatureSettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
            {activeTab === 'advanced' && renderAdvancedSettings()}
          </div>
        </div>
      </div>

      <style>{`
        .settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .settings-modal {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .settings-header h2 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          color: #666;
        }

        .settings-content {
          display: flex;
          flex: 1;
          min-height: 0;
        }

        .settings-tabs {
          width: 180px;
          background: #f8f9fa;
          border-right: 1px solid #eee;
          display: flex;
          flex-direction: column;
        }

        .tab {
          padding: 1rem;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          border-bottom: 1px solid #e9ecef;
          transition: background-color 0.2s;
        }

        .tab:hover {
          background: #e9ecef;
        }

        .tab.active {
          background: #007bff;
          color: white;
        }

        .settings-panel {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .settings-section h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.25rem;
        }

        .setting-group {
          margin-bottom: 1.5rem;
        }

        .setting-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .setting-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .setting-group input,
        .setting-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .setting-group.checkbox input {
          width: auto;
        }

        .setting-group input[type="range"] {
          margin-bottom: 0.5rem;
        }

        .setting-group span {
          font-size: 0.875rem;
          color: #666;
          margin-left: 0.5rem;
        }

        .storage-info,
        .config-actions,
        .debug-info {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .storage-info p,
        .debug-info p {
          margin: 0.5rem 0;
          font-size: 0.875rem;
          color: #666;
        }

        .config-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .secondary-btn,
        .danger-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .secondary-btn {
          background: #6c757d;
          color: white;
        }

        .secondary-btn:hover {
          background: #5a6268;
        }

        .danger-btn {
          background: #dc3545;
          color: white;
        }

        .danger-btn:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  )
}

export default Settings
