import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'
import { usePhoto } from '../contexts/PhotoContext'
import { CheckCircle, XCircle, AlertCircle, Loader, Monitor, Smartphone } from './icons'

interface DeviceInfo {
  id: string
  name: string
  userAgent: string
  lastSeen: Date
  isOnline: boolean
}

interface SyncTestResult {
  test: string
  status: 'pending' | 'success' | 'failed' | 'running'
  details?: string
  timestamp?: Date
}

const MultiDeviceSyncTester: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [testResults, setTestResults] = useState<SyncTestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const { photos, albums } = usePhoto()

  // Generate unique device ID
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('device-id')
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device-id', deviceId)
    }
    return deviceId
  }

  // Get device info
  const getDeviceInfo = (): DeviceInfo => {
    const deviceId = getDeviceId()
    return {
      id: deviceId,
      name: `${navigator.platform} - ${deviceId.slice(-6)}`,
      userAgent: navigator.userAgent,
      lastSeen: new Date(),
      isOnline: navigator.onLine
    }
  }

  // Register this device
  const registerDevice = async () => {
    const deviceInfo = getDeviceInfo()
    
    try {
      const { error } = await supabase
        .from('sync_test_devices')
        .upsert({
          id: deviceInfo.id,
          name: deviceInfo.name,
          user_agent: deviceInfo.userAgent,
          last_seen: deviceInfo.lastSeen.toISOString(),
          is_online: deviceInfo.isOnline
        })
      
      if (error) {
        console.error('Failed to register device:', error)
      }
    } catch (error) {
      console.log('Sync test table not available, skipping device registration')
    }
  }

  // Load devices
  const loadDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_test_devices')
        .select('*')
        .order('last_seen', { ascending: false })
      
      if (!error && data) {
        setDevices(data.map(d => ({
          id: d.id,
          name: d.name,
          userAgent: d.user_agent,
          lastSeen: new Date(d.last_seen),
          isOnline: d.is_online
        })))
      }
    } catch (error) {
      console.log('Sync test devices table not available')
    }
  }

  // Run sync tests
  const runSyncTests = async () => {
    setIsRunningTests(true)
    const results: SyncTestResult[] = []

    // Test 1: Photo count consistency
    results.push({ test: 'Photo Count Check', status: 'running' })
    setTestResults([...results])
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      const { data: remotePhotos, error } = await supabase
        .from('photos')
        .select('id')
      
      if (error) {
        results[0] = { test: 'Photo Count Check', status: 'failed', details: error.message, timestamp: new Date() }
      } else {
        const localCount = photos.length
        const remoteCount = remotePhotos?.length || 0
        const match = localCount === remoteCount
        
        results[0] = {
          test: 'Photo Count Check',
          status: match ? 'success' : 'failed',
          details: `Local: ${localCount}, Remote: ${remoteCount}`,
          timestamp: new Date()
        }
      }
    } catch (error) {
      results[0] = { test: 'Photo Count Check', status: 'failed', details: 'Connection error', timestamp: new Date() }
    }

    setTestResults([...results])

    // Test 2: Album sync
    results.push({ test: 'Album Sync Check', status: 'running' })
    setTestResults([...results])
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      const { data: remoteAlbums, error } = await supabase
        .from('albums')
        .select('id')
      
      if (error) {
        results[1] = { test: 'Album Sync Check', status: 'failed', details: error.message, timestamp: new Date() }
      } else {
        const localCount = albums.length
        const remoteCount = remoteAlbums?.length || 0
        const match = localCount === remoteCount
        
        results[1] = {
          test: 'Album Sync Check',
          status: match ? 'success' : 'failed',
          details: `Local: ${localCount}, Remote: ${remoteCount}`,
          timestamp: new Date()
        }
      }
    } catch (error) {
      results[1] = { test: 'Album Sync Check', status: 'failed', details: 'Connection error', timestamp: new Date() }
    }

    setTestResults([...results])

    // Test 3: Real-time subscription
    results.push({ test: 'Real-time Connection', status: 'running' })
    setTestResults([...results])
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      // Test if we can subscribe to changes
      const subscription = supabase
        .channel('sync-test')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => {
          // Connection working
        })
        .subscribe()
      
      // Check connection status
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const state = subscription.state
      const isConnected = state.toString() === 'SUBSCRIBED'
      subscription.unsubscribe()
      
      results[2] = {
        test: 'Real-time Connection',
        status: isConnected ? 'success' : 'failed',
        details: `Status: ${state}`,
        timestamp: new Date()
      }
    } catch (error) {
      results[2] = { test: 'Real-time Connection', status: 'failed', details: 'Subscription failed', timestamp: new Date() }
    }

    setTestResults([...results])
    setIsRunningTests(false)
  }

  // Initialize
  useEffect(() => {
    registerDevice()
    loadDevices()
  }, [])

  // Update device status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      registerDevice()
      loadDevices()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Multi-Device Sync Tester"
      >
        <Monitor className="w-5 h-5" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 100 }}
      className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Multi-Device Sync Tester</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {/* Connected Devices */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connected Devices</h4>
          <div className="space-y-2">
            {devices.length === 0 ? (
              <p className="text-sm text-gray-500">No devices registered</p>
            ) : (
              devices.map(device => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {device.userAgent.includes('Mobile') ? (
                      <Smartphone className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Monitor className="w-4 h-4 text-blue-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                      <p className="text-xs text-gray-500">
                        {device.lastSeen.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      device.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sync Tests */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sync Tests</h4>
            <button
              onClick={runSyncTests}
              disabled={isRunningTests}
              className="text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-lg"
            >
              {isRunningTests ? 'Running...' : 'Run Tests'}
            </button>
          </div>

          <div className="space-y-2">
            {testResults.length === 0 ? (
              <p className="text-sm text-gray-500">No tests run yet</p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {result.status === 'running' && <Loader className="w-4 h-4 text-blue-500 animate-spin" />}
                    {result.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {result.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                    {result.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{result.test}</p>
                      {result.details && (
                        <p className="text-xs text-gray-500">{result.details}</p>
                      )}
                    </div>
                  </div>
                  {result.timestamp && (
                    <span className="text-xs text-gray-400">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{photos.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Local Photos</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{albums.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Albums</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MultiDeviceSyncTester