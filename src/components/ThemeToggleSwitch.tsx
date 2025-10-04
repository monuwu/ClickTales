import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggleSwitch: React.FC = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="relative">
      <label 
        htmlFor="themeToggle" 
        className="relative cursor-pointer w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
      >
        <input 
          type="checkbox" 
          id="themeToggle" 
          className="sr-only" 
          checked={isDark}
          onChange={toggleTheme}
        />
        <svg 
          width={20} 
          height={20} 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          stroke="none"
          className="transition-transform duration-400 ease-in-out transform"
          style={{ transform: isDark ? 'rotate(90deg)' : 'rotate(40deg)' }}
        >
          <mask id="moon-mask">
            <rect x={0} y={0} width={20} height={20} fill="white" />
            <circle 
              cx={11} 
              cy={3} 
              r={8} 
              fill="black" 
              className="transition-transform duration-640 ease-out"
              style={{ 
                transform: isDark ? 'translate(16px, -3px)' : 'translate(0px, 0px)' 
              }}
            />
          </mask>
          <circle 
            className="transition-transform duration-400 ease-in-out origin-center"
            cx={10} 
            cy={10} 
            r={8} 
            mask="url(#moon-mask)" 
            style={{
              transform: isDark ? 'scale(0.55)' : 'scale(1)'
            }}
          />
          <g>
            {/* Sun rays */}
            {[
              { cx: 18, cy: 10, delay: 'delay-0' },
              { cx: 14, cy: 16.928, delay: 'delay-75' },
              { cx: 6, cy: 16.928, delay: 'delay-100' },
              { cx: 2, cy: 10, delay: 'delay-150' },
              { cx: 6, cy: 3.1718, delay: 'delay-200' },
              { cx: 14, cy: 3.1718, delay: 'delay-300' }
            ].map((ray, index) => (
              <circle
                key={index}
                className={`transition-all duration-400 ease-in-out origin-center ${ray.delay}`}
                cx={ray.cx}
                cy={ray.cy}
                r="1.5"
                style={{
                  transform: isDark ? 'scale(1)' : 'scale(0)'
                }}
              />
            ))}
          </g>
        </svg>
      </label>
    </div>
  )
}

export default ThemeToggleSwitch