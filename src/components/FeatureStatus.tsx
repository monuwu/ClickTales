import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Timer, XCircle } from './icons'

interface FeatureStatusProps {
  status: 'implemented' | 'in-development' | 'planned'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const FeatureStatus: React.FC<FeatureStatusProps> = ({ 
  status, 
  size = 'sm', 
  showLabel = false 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'implemented':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Available'
        }
      case 'in-development':
        return {
          icon: Timer,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          label: 'In Development'
        }
      case 'planned':
        return {
          icon: XCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          label: 'Planned'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const paddingClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      <div className={`
        ${config.bgColor} ${paddingClasses[size]} rounded-full
        flex items-center justify-center
      `}>
        <Icon className={`${sizeClasses[size]} ${config.color}`} />
      </div>
      {showLabel && (
        <span className={`
          text-xs font-medium ${config.color}
          ${size === 'lg' ? 'text-sm' : 'text-xs'}
        `}>
          {config.label}
        </span>
      )}
    </motion.div>
  )
}

export default FeatureStatus