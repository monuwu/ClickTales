import { useState, useRef, useCallback, useEffect } from 'react'
import type { CameraSettings, CaptureResult } from '../types'

export const useCamera = (settings: CameraSettings) => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Get available camera devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)
    } catch {
      setError('Failed to get camera devices')
    }
  }, [])

  // Start camera stream
  const startStream = useCallback(async () => {
    try {
      setError(null)
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: settings.width,
          height: settings.height,
          deviceId: settings.deviceId ? { exact: settings.deviceId } : undefined
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
      }
    } catch {
      setError('Failed to access camera')
      setIsStreaming(false)
    }
  }, [settings])

  // Stop camera stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsStreaming(false)
  }, [])

  // Capture photo from video stream
  const capturePhoto = useCallback((): CaptureResult => {
    if (!videoRef.current || !isStreaming) {
      return { success: false, error: 'Camera not ready' }
    }

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        return { success: false, error: 'Failed to create canvas context' }
      }

      canvas.width = settings.width
      canvas.height = settings.height
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

      return { success: true, imageData: dataUrl }
    } catch {
      return { success: false, error: 'Failed to capture photo' }
    }
  }, [isStreaming, settings])

  // Initialize devices on mount
  useEffect(() => {
    getDevices()
  }, [getDevices])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return {
    videoRef,
    isStreaming,
    error,
    devices,
    startStream,
    stopStream,
    capturePhoto,
    getDevices
  }
}
