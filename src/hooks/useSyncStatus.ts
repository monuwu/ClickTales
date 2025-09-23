import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import type { SyncStatus } from '../components/SyncIndicator'

interface SyncState {
  status: SyncStatus
  pendingUploads: number
  lastSyncTime: Date | null
  isOnline: boolean
  error: string | null
}

interface PendingOperation {
  id: string
  type: 'upload' | 'delete' | 'update'
  data: any
  retryCount: number
  timestamp: Date
}

export const useSyncStatus = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'online',
    pendingUploads: 0,
    lastSyncTime: null,
    isOnline: navigator.onLine,
    error: null
  })

  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([])

  // Check online status
  const updateOnlineStatus = useCallback(() => {
    const isOnline = navigator.onLine
    setSyncState(prev => ({
      ...prev,
      isOnline,
      status: isOnline ? (prev.pendingUploads > 0 ? 'pending' : 'online') : 'offline'
    }))
  }, [])

  // Add operation to pending queue
  const addPendingOperation = useCallback((operation: Omit<PendingOperation, 'id' | 'retryCount' | 'timestamp'>) => {
    const pendingOp: PendingOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random()}`,
      retryCount: 0,
      timestamp: new Date()
    }

    setPendingOperations(prev => [...prev, pendingOp])
    setSyncState(prev => ({
      ...prev,
      pendingUploads: prev.pendingUploads + 1,
      status: 'pending'
    }))

    return pendingOp.id
  }, [])

  // Remove operation from pending queue
  const removePendingOperation = useCallback((id: string) => {
    setPendingOperations(prev => prev.filter(op => op.id !== id))
    setSyncState(prev => ({
      ...prev,
      pendingUploads: Math.max(0, prev.pendingUploads - 1),
      status: prev.pendingUploads <= 1 ? (prev.isOnline ? 'synced' : 'offline') : 'pending'
    }))
  }, [])

  // Process pending operations
  const processPendingOperations = useCallback(async () => {
    if (!navigator.onLine || pendingOperations.length === 0) return

    setSyncState(prev => ({ ...prev, status: 'syncing', error: null }))

    for (const operation of pendingOperations) {
      try {
        let success = false

        switch (operation.type) {
          case 'upload':
            // Handle photo upload
            const { error: uploadError } = await supabase.storage
              .from('photos')
              .upload(operation.data.path, operation.data.file, {
                upsert: operation.retryCount > 0
              })
            
            if (!uploadError) {
              // Add to photos table
              const { error: dbError } = await supabase
                .from('photos')
                .insert(operation.data.metadata)
              
              success = !dbError
            }
            break

          case 'delete':
            // Handle photo deletion
            const { error: deleteError } = await supabase
              .from('photos')
              .delete()
              .eq('id', operation.data.id)
            
            success = !deleteError
            break

          case 'update':
            // Handle photo update
            const { error: updateError } = await supabase
              .from('photos')
              .update(operation.data.updates)
              .eq('id', operation.data.id)
            
            success = !updateError
            break
        }

        if (success) {
          removePendingOperation(operation.id)
          setSyncState(prev => ({ ...prev, lastSyncTime: new Date() }))
        } else {
          // Increment retry count
          setPendingOperations(prev => 
            prev.map(op => 
              op.id === operation.id 
                ? { ...op, retryCount: op.retryCount + 1 }
                : op
            )
          )

          // Remove if too many retries
          if (operation.retryCount >= 3) {
            removePendingOperation(operation.id)
            setSyncState(prev => ({ 
              ...prev, 
              status: 'error',
              error: `Failed to sync ${operation.type} after 3 attempts`
            }))
          }
        }
      } catch (error) {
        console.error('Sync error:', error)
        setSyncState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown sync error'
        }))
      }
    }

    // Update final status
    setSyncState(prev => ({
      ...prev,
      status: prev.pendingUploads > 0 ? 'pending' : 'synced'
    }))
  }, [pendingOperations, removePendingOperation])

  // Monitor connection status
  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [updateOnlineStatus])

  // Auto-sync when coming online
  useEffect(() => {
    if (navigator.onLine && pendingOperations.length > 0) {
      processPendingOperations()
    }
  }, [syncState.isOnline, processPendingOperations])

  // Periodic sync check
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && pendingOperations.length > 0) {
        processPendingOperations()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [processPendingOperations])

  // Manual sync trigger
  const forceSync = useCallback(async () => {
    if (navigator.onLine) {
      await processPendingOperations()
    }
  }, [processPendingOperations])

  // Clear error
  const clearError = useCallback(() => {
    setSyncState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...syncState,
    pendingOperations,
    addPendingOperation,
    removePendingOperation,
    forceSync,
    clearError
  }
}

export default useSyncStatus