import React, { useState, useRef, useEffect } from 'react'

interface PhotoEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string) => void
  onCancel: () => void
}

interface EditSettings {
  brightness: number
  contrast: number
  saturation: number
  rotation: number
  cropX: number
  cropY: number
  cropWidth: number
  cropHeight: number
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [settings, setSettings] = useState<EditSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
    cropX: 0,
    cropY: 0,
    cropWidth: 100,
    cropHeight: 100
  })
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setOriginalImage(img)
      drawImage(img, settings)
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    if (originalImage) {
      drawImage(originalImage, settings)
    }
  }, [settings, originalImage])

  const drawImage = (img: HTMLImageElement, editSettings: EditSettings) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = img.width
    canvas.height = img.height

    // Apply filters
    ctx.filter = `
      brightness(${editSettings.brightness}%)
      contrast(${editSettings.contrast}%)
      saturate(${editSettings.saturation}%)
    `

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context for rotation
    ctx.save()

    // Apply rotation
    if (editSettings.rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((editSettings.rotation * Math.PI) / 180)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
    }

    // Draw image
    ctx.drawImage(img, 0, 0)

    // Restore context
    ctx.restore()
  }

  const handleSettingChange = (setting: keyof EditSettings, value: number) => {
    setSettings(prev => ({ ...prev, [setting]: value }))
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const editedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
    onSave(editedImageUrl)
  }

  const handleReset = () => {
    setSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 100,
      cropHeight: 100
    })
  }

  return (
    <div className="photo-editor-overlay">
      <div className="photo-editor-modal">
        <div className="photo-editor-header">
          <h3>Edit Photo</h3>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>
        
        <div className="photo-editor-content">
          <div className="photo-editor-preview">
            <canvas ref={canvasRef} className="preview-canvas" />
          </div>
          
          <div className="photo-editor-controls">
            <div className="control-group">
              <label>Brightness</label>
              <input
                type="range"
                min="50"
                max="150"
                value={settings.brightness}
                onChange={(e) => handleSettingChange('brightness', Number(e.target.value))}
              />
              <span>{settings.brightness}%</span>
            </div>
            
            <div className="control-group">
              <label>Contrast</label>
              <input
                type="range"
                min="50"
                max="150"
                value={settings.contrast}
                onChange={(e) => handleSettingChange('contrast', Number(e.target.value))}
              />
              <span>{settings.contrast}%</span>
            </div>
            
            <div className="control-group">
              <label>Saturation</label>
              <input
                type="range"
                min="0"
                max="200"
                value={settings.saturation}
                onChange={(e) => handleSettingChange('saturation', Number(e.target.value))}
              />
              <span>{settings.saturation}%</span>
            </div>
            
            <div className="control-group">
              <label>Rotation</label>
              <input
                type="range"
                min="0"
                max="360"
                value={settings.rotation}
                onChange={(e) => handleSettingChange('rotation', Number(e.target.value))}
              />
              <span>{settings.rotation}°</span>
            </div>
            
            <div className="control-actions">
              <button onClick={handleReset} className="reset-btn">Reset</button>
              <button onClick={handleSave} className="save-btn">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .photo-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .photo-editor-modal {
          background: white;
          border-radius: 8px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .photo-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
        }
        
        .photo-editor-content {
          display: flex;
          flex: 1;
          min-height: 0;
        }
        
        .photo-editor-preview {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: #f5f5f5;
        }
        
        .preview-canvas {
          max-width: 100%;
          max-height: 100%;
          border: 1px solid #ddd;
        }
        
        .photo-editor-controls {
          width: 300px;
          padding: 1rem;
          border-left: 1px solid #eee;
          overflow-y: auto;
        }
        
        .control-group {
          margin-bottom: 1.5rem;
        }
        
        .control-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .control-group input[type="range"] {
          width: 100%;
          margin-bottom: 0.25rem;
        }
        
        .control-group span {
          font-size: 0.875rem;
          color: #666;
        }
        
        .control-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        
        .reset-btn, .save-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .reset-btn {
          background: #f5f5f5;
          color: #333;
        }
        
        .save-btn {
          background: #007bff;
          color: white;
        }
        
        .reset-btn:hover {
          background: #e9ecef;
        }
        
        .save-btn:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  )
}

export default PhotoEditor
