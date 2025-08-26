import React from 'react'
import { motion } from 'framer-motion'

export interface Filter {
  id: string
  name: string
  cssFilter: string
  preview: string
}

const filters: Filter[] = [
  { id: 'none', name: 'Original', cssFilter: '', preview: '🔸' },
  { id: 'grayscale', name: 'B&W', cssFilter: 'grayscale(100%)', preview: '⚫' },
  { id: 'sepia', name: 'Vintage', cssFilter: 'sepia(100%)', preview: '🟤' },
  { id: 'invert', name: 'Negative', cssFilter: 'invert(100%)', preview: '🔄' },
  { id: 'blur', name: 'Dreamy', cssFilter: 'blur(2px)', preview: '💫' },
  { id: 'brightness', name: 'Bright', cssFilter: 'brightness(150%)', preview: '☀️' },
  { id: 'contrast', name: 'Dramatic', cssFilter: 'contrast(150%)', preview: '🎭' },
  { id: 'saturate', name: 'Vivid', cssFilter: 'saturate(200%)', preview: '🌈' },
  { id: 'hue', name: 'Cool', cssFilter: 'hue-rotate(180deg)', preview: '🔵' },
  { id: 'vintage', name: 'Retro', cssFilter: 'sepia(50%) contrast(120%) brightness(110%)', preview: '📸' },
  { id: 'warm', name: 'Warm', cssFilter: 'hue-rotate(20deg) saturate(120%) brightness(110%)', preview: '🔶' },
  { id: 'cold', name: 'Arctic', cssFilter: 'hue-rotate(200deg) saturate(120%) brightness(95%)', preview: '❄️' }
]

interface FiltersProps {
  selectedFilter: string
  onFilterSelect: (filter: Filter) => void
  isVisible: boolean
}

const Filters: React.FC<FiltersProps> = ({ selectedFilter, onFilterSelect, isVisible }) => {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-24 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-700 z-50 max-h-40 overflow-hidden"
    >
      <div className="p-4">
        <h3 className="text-white text-lg font-semibold mb-4 text-center">Choose a Filter</h3>
        
        <div className="flex gap-3 justify-center flex-wrap">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterSelect(filter)}
              className={`
                flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all duration-200
                ${selectedFilter === filter.id 
                  ? 'border-purple-500 bg-purple-500/20' 
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }
              `}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">{filter.preview}</span>
                <span className="text-xs text-white font-medium">{filter.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Filters
export { filters }
