import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from '../components/icons'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

const NotificationToast: React.FC<{ 
  notification: Notification
  onRemove: (id: string) => void 
}> = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  React.useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, notification.duration || 5000)
      
      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-xl border shadow-lg backdrop-blur-sm ${getBgColor()} max-w-sm`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {notification.title}
          </p>
          {notification.message && (
            <p className="mt-1 text-sm text-gray-700">
              {notification.message}
            </p>
          )}
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 p-1 hover:bg-gray-200/50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </motion.div>
  )
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

// Utility hooks for common notification types
export const useSuccessNotification = () => {
  const { addNotification } = useNotifications()
  return useCallback((title: string, message?: string) => 
    addNotification({ type: 'success', title, message }), [addNotification])
}

export const useErrorNotification = () => {
  const { addNotification } = useNotifications()
  return useCallback((title: string, message?: string) => 
    addNotification({ type: 'error', title, message, duration: 7000 }), [addNotification])
}

export const useInfoNotification = () => {
  const { addNotification } = useNotifications()
  return useCallback((title: string, message?: string) => 
    addNotification({ type: 'info', title, message }), [addNotification])
}

export const useWarningNotification = () => {
  const { addNotification } = useNotifications()
  return useCallback((title: string, message?: string) => 
    addNotification({ type: 'warning', title, message }), [addNotification])
}

export default NotificationProvider