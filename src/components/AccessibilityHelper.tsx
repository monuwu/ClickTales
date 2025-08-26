import React, { useState, useEffect } from 'react'

interface AccessibilitySettings {
  fontSize: 'small' | 'normal' | 'large' | 'xl'
  contrast: 'normal' | 'high'
  reducedMotion: boolean
  screenReader: boolean
  focusVisible: boolean
  keyboardNavigation: boolean
}

interface AccessibilityHelperProps {
  onClose?: () => void
}

const AccessibilityHelper: React.FC<AccessibilityHelperProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    contrast: 'normal',
    reducedMotion: false,
    screenReader: false,
    focusVisible: true,
    keyboardNavigation: true
  })

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load accessibility settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        applySettings(parsed)
      } catch (error) {
        console.error('Failed to load accessibility settings:', error)
      }
    }

    // Check for system preferences
    checkSystemPreferences()
  }, [])

  const checkSystemPreferences = () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setSettings(prev => ({ ...prev, reducedMotion: true }))
    }

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    if (prefersHighContrast) {
      setSettings(prev => ({ ...prev, contrast: 'high' }))
    }
  }

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings))
    applySettings(newSettings)
  }

  const applySettings = (accessibilitySettings: AccessibilitySettings) => {
    const root = document.documentElement

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      normal: '16px',
      large: '18px',
      xl: '20px'
    }
    root.style.fontSize = fontSizeMap[accessibilitySettings.fontSize]

    // Apply contrast
    if (accessibilitySettings.contrast === 'high') {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply reduced motion
    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Apply focus visibility
    if (accessibilitySettings.focusVisible) {
      root.classList.add('focus-visible')
    } else {
      root.classList.remove('focus-visible')
    }

    // Apply keyboard navigation enhancements
    if (accessibilitySettings.keyboardNavigation) {
      root.classList.add('keyboard-navigation')
    } else {
      root.classList.remove('keyboard-navigation')
    }
  }

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 'normal',
      contrast: 'normal',
      reducedMotion: false,
      screenReader: false,
      focusVisible: true,
      keyboardNavigation: true
    }
    setSettings(defaultSettings)
    localStorage.removeItem('accessibility-settings')
    applySettings(defaultSettings)
  }

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle keyboard shortcuts for accessibility
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault()
          increaseFontSize()
          break
        case '-':
          event.preventDefault()
          decreaseFontSize()
          break
        case '0':
          event.preventDefault()
          updateSetting('fontSize', 'normal')
          announceToScreenReader('Font size reset to normal')
          break
      }
    }
  }

  const increaseFontSize = () => {
    const sizeOrder: AccessibilitySettings['fontSize'][] = ['small', 'normal', 'large', 'xl']
    const currentIndex = sizeOrder.indexOf(settings.fontSize)
    if (currentIndex < sizeOrder.length - 1) {
      const newSize = sizeOrder[currentIndex + 1]
      updateSetting('fontSize', newSize)
      announceToScreenReader(`Font size increased to ${newSize}`)
    }
  }

  const decreaseFontSize = () => {
    const sizeOrder: AccessibilitySettings['fontSize'][] = ['small', 'normal', 'large', 'xl']
    const currentIndex = sizeOrder.indexOf(settings.fontSize)
    if (currentIndex > 0) {
      const newSize = sizeOrder[currentIndex - 1]
      updateSetting('fontSize', newSize)
      announceToScreenReader(`Font size decreased to ${newSize}`)
    }
  }

  useEffect(() => {
    // Add global keydown listener
    document.addEventListener('keydown', handleKeyDown as any)
    return () => {
      document.removeEventListener('keydown', handleKeyDown as any)
    }
  }, [settings])

  return (
    <>
      {/* Floating accessibility button */}
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open accessibility settings"
        title="Accessibility Settings (Alt + A)"
      >
        ♿
      </button>

      {/* Accessibility panel */}
      {isOpen && (
        <div className="accessibility-overlay">
          <div className="accessibility-panel" role="dialog" aria-labelledby="accessibility-title">
            <div className="accessibility-header">
              <h2 id="accessibility-title">Accessibility Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="close-btn"
                aria-label="Close accessibility settings"
              >
                ×
              </button>
            </div>

            <div className="accessibility-content">
              <div className="setting-section">
                <h3>Visual</h3>
                
                <div className="setting-group">
                  <label htmlFor="font-size">Font Size</label>
                  <select
                    id="font-size"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', e.target.value as AccessibilitySettings['fontSize'])}
                  >
                    <option value="small">Small (14px)</option>
                    <option value="normal">Normal (16px)</option>
                    <option value="large">Large (18px)</option>
                    <option value="xl">Extra Large (20px)</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="contrast">Contrast</label>
                  <select
                    id="contrast"
                    value={settings.contrast}
                    onChange={(e) => updateSetting('contrast', e.target.value as AccessibilitySettings['contrast'])}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Contrast</option>
                  </select>
                </div>

                <div className="setting-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.reducedMotion}
                      onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    />
                    Reduce Motion
                  </label>
                </div>
              </div>

              <div className="setting-section">
                <h3>Navigation</h3>
                
                <div className="setting-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.focusVisible}
                      onChange={(e) => updateSetting('focusVisible', e.target.checked)}
                    />
                    Enhanced Focus Indicators
                  </label>
                </div>

                <div className="setting-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.keyboardNavigation}
                      onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                    />
                    Keyboard Navigation Help
                  </label>
                </div>

                <div className="setting-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.screenReader}
                      onChange={(e) => updateSetting('screenReader', e.target.checked)}
                    />
                    Screen Reader Optimizations
                  </label>
                </div>
              </div>

              <div className="setting-section">
                <h3>Keyboard Shortcuts</h3>
                <div className="shortcuts-list">
                  <div className="shortcut-item">
                    <span className="shortcut-keys">Ctrl/Cmd + +</span>
                    <span>Increase font size</span>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-keys">Ctrl/Cmd + -</span>
                    <span>Decrease font size</span>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-keys">Ctrl/Cmd + 0</span>
                    <span>Reset font size</span>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-keys">Alt + A</span>
                    <span>Open accessibility menu</span>
                  </div>
                </div>
              </div>

              <div className="accessibility-actions">
                <button onClick={resetToDefaults} className="reset-btn">
                  Reset to Defaults
                </button>
                {onClose && (
                  <button onClick={onClose} className="done-btn">
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .accessibility-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          z-index: 999;
          transition: all 0.3s ease;
        }

        .accessibility-toggle:hover {
          background: #0056b3;
          transform: scale(1.1);
        }

        .accessibility-toggle:focus {
          outline: 3px solid #ffc107;
          outline-offset: 2px;
        }

        .accessibility-overlay {
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

        .accessibility-panel {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .accessibility-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .accessibility-header h2 {
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

        .accessibility-content {
          padding: 1.5rem;
        }

        .setting-section {
          margin-bottom: 2rem;
        }

        .setting-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
          border-bottom: 2px solid #007bff;
          padding-bottom: 0.5rem;
        }

        .setting-group {
          margin-bottom: 1rem;
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

        .setting-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .setting-group.checkbox input {
          width: auto;
          transform: scale(1.2);
        }

        .shortcuts-list {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .shortcut-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .shortcut-item:last-child {
          margin-bottom: 0;
        }

        .shortcut-keys {
          background: #fff;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-family: monospace;
          font-weight: bold;
        }

        .accessibility-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .reset-btn,
        .done-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .reset-btn {
          background: #6c757d;
          color: white;
        }

        .done-btn {
          background: #007bff;
          color: white;
        }

        .reset-btn:hover {
          background: #5a6268;
        }

        .done-btn:hover {
          background: #0056b3;
        }

        /* Global accessibility styles */
        :global(.high-contrast) {
          filter: contrast(150%);
        }

        :global(.reduced-motion *) {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        :global(.focus-visible *:focus) {
          outline: 3px solid #ffc107 !important;
          outline-offset: 2px !important;
        }

        :global(.keyboard-navigation *:focus) {
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5) !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .accessibility-toggle {
            transition: none;
          }
        }

        @media (prefers-contrast: high) {
          .accessibility-toggle {
            border: 2px solid white;
          }
        }
      `}</style>
    </>
  )
}

export default AccessibilityHelper
