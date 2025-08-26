import React, { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Download, ArrowLeft } from './icons'

export interface CollageLayout {
  id: string
  name: string
  slots: number
  layout: {
    width: number
    height: number
    positions: { x: number; y: number; width: number; height: number }[]
  }
}

const collageLayouts: CollageLayout[] = [
  {
    id: 'single',
    name: 'Single',
    slots: 1,
    layout: {
      width: 800,
      height: 600,
      positions: [{ x: 0, y: 0, width: 800, height: 600 }]
    }
  },
  {
    id: 'double-horizontal',
    name: 'Side by Side',
    slots: 2,
    layout: {
      width: 800,
      height: 400,
      positions: [
        { x: 0, y: 0, width: 400, height: 400 },
        { x: 400, y: 0, width: 400, height: 400 }
      ]
    }
  },
  {
    id: 'double-vertical',
    name: 'Top & Bottom',
    slots: 2,
    layout: {
      width: 600,
      height: 800,
      positions: [
        { x: 0, y: 0, width: 600, height: 400 },
        { x: 0, y: 400, width: 600, height: 400 }
      ]
    }
  },
  {
    id: 'triple',
    name: 'Triple',
    slots: 3,
    layout: {
      width: 900,
      height: 600,
      positions: [
        { x: 0, y: 0, width: 300, height: 600 },
        { x: 300, y: 0, width: 300, height: 300 },
        { x: 300, y: 300, width: 300, height: 300 }
      ]
    }
  },
  {
    id: 'quad',
    name: 'Four Square',
    slots: 4,
    layout: {
      width: 800,
      height: 800,
      positions: [
        { x: 0, y: 0, width: 400, height: 400 },
        { x: 400, y: 0, width: 400, height: 400 },
        { x: 0, y: 400, width: 400, height: 400 },
        { x: 400, y: 400, width: 400, height: 400 }
      ]
    }
  }
]

interface CollageProps {
  photos: string[]
  selectedLayout: string
  onLayoutSelect: (layout: CollageLayout) => void
  onDownload: () => void
  onBack: () => void
}

const Collage: React.FC<CollageProps> = ({ 
  photos, 
  selectedLayout, 
  onLayoutSelect, 
  onDownload, 
  onBack 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const currentLayout = collageLayouts.find(l => l.id === selectedLayout) || collageLayouts[0]

  const generateCollage = useCallback(async () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = currentLayout.layout.width
    canvas.height = currentLayout.layout.height

    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load and draw each photo
    const promises = photos.slice(0, currentLayout.slots).map((photoUrl, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => {
          const pos = currentLayout.layout.positions[index]
          if (pos) {
            ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height)
          }
          resolve()
        }
        img.onerror = () => resolve()
        img.src = photoUrl
      })
    })

    await Promise.all(promises)
  }, [photos, currentLayout])

  React.useEffect(() => {
    generateCollage()
  }, [generateCollage])

  const handleDownload = () => {
    if (!canvasRef.current) return
    
    const link = document.createElement('a')
    link.download = `collage-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
    
    onDownload()
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-medium">Back</span>
        </button>
        
        <h1 className="text-2xl font-bold text-white">Create Collage</h1>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Download</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Layout Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-white text-lg font-semibold mb-4">Choose Layout</h3>
          <div className="grid grid-cols-2 gap-3">
            {collageLayouts.map((layout) => (
              <motion.button
                key={layout.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLayoutSelect(layout)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${selectedLayout === layout.id 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }
                `}
              >
                <div className="text-white text-sm font-medium mb-2">{layout.name}</div>
                <div className="bg-gray-700 rounded aspect-square flex items-center justify-center">
                  <span className="text-xs text-gray-300">{layout.slots} photos</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Photo Count Info */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-300">
              Photos needed: {currentLayout.slots}
            </p>
            <p className="text-sm text-gray-300">
              Photos available: {photos.length}
            </p>
            {photos.length < currentLayout.slots && (
              <p className="text-sm text-yellow-400 mt-1">
                Take {currentLayout.slots - photos.length} more photo(s)
              </p>
            )}
          </div>
        </div>

        {/* Collage Preview */}
        <div className="lg:col-span-2">
          <h3 className="text-white text-lg font-semibold mb-4">Preview</h3>
          <div className="bg-white rounded-lg p-4 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-96 border border-gray-300 rounded"
              style={{
                aspectRatio: `${currentLayout.layout.width}/${currentLayout.layout.height}`
              }}
            />
          </div>

          {/* Photos Grid */}
          <div className="mt-6">
            <h4 className="text-white text-md font-medium mb-3">
              Recent Photos ({photos.length})
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 8).map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-square bg-gray-800 rounded overflow-hidden"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collage
export { collageLayouts }
