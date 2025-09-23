import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Cloud, CloudOff, Check, AlertCircle, Loader } from './icons'

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'error' | 'pending'

interface SyncIndicatorProps {
  status: SyncStatus
  className?: string
  showText?: boolean
  pendingCount?: number
  lastSyncTime?: Date
}

interface SyncIconProps {
  status: SyncStatus
  className?: string
}

const SyncIcon: React.FC<SyncIconProps> = ({ status, className = "w-4 h-4" }) => {
  switch (status) {
    case 'online':
      return <Wifi className={`${className} text-green-500`} />
    case 'offline':
      return <WifiOff className={`${className} text-gray-400`} />
    case 'syncing':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader className={`${className} text-blue-500`} />
        </motion.div>
      )
    case 'synced':
      return <Check className={`${className} text-green-500`} />
    case 'error':
      return <AlertCircle className={`${className} text-red-500`} />
    case 'pending':
      return <Cloud className={`${className} text-yellow-500`} />
    default:
      return <CloudOff className={`${className} text-gray-400`} />
  }
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  status,
  className = "",
  showText = true,
  pendingCount = 0,
  lastSyncTime
}) => {
  const [isVisible, setIsVisible] = useState(true)

  // Auto-hide synced status after 3 seconds
  useEffect(() => {
    if (status === 'synced') {
      const timer = setTimeout(() => setIsVisible(false), 3000)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [status])

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'offline':
        return 'Offline'
      case 'syncing':
        return 'Syncing...'
      case 'synced':
        return 'Synced'
      case 'error':
        return 'Sync Error'
      case 'pending':
        return `${pendingCount} pending`
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online':
      case 'synced':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'offline':
        return 'text-gray-500 bg-gray-50 border-gray-200'
      case 'syncing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const formatLastSync = () => {
    if (!lastSyncTime) return null
    
    const now = new Date()
    const diff = now.getTime() - lastSyncTime.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (!isVisible && status === 'synced') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium
          ${getStatusColor()}
          ${className}
        `}
        title={lastSyncTime ? `Last sync: ${formatLastSync()}` : undefined}
      >
        <SyncIcon status={status} />
        
        {showText && (
          <span>{getStatusText()}</span>
        )}
        
        {pendingCount > 0 && status === 'pending' && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full"
          >
            {pendingCount > 99 ? '99+' : pendingCount}
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default SyncIndicator