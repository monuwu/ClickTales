export interface Photo {
  id: string
  url: string
  thumbnail: string
  timestamp: Date
  filename: string
  filter?: string
  isCollage?: boolean
}

export interface CameraSettings {
  width: number
  height: number
  deviceId?: string
  timerEnabled: boolean
  timerDuration: number
}

export interface PhotoFilter {
  id: string
  name: string
  effect: string
  cssFilter: string
}

export interface PhotoboothConfig {
  cameraSettings: CameraSettings
  enableFilters: boolean
  enableGallery: boolean
  enablePrint: boolean
  enableTimer: boolean
  enableCollage: boolean
  autoSave: boolean
}

export interface CaptureResult {
  success: boolean
  imageData?: string
  photo?: Photo
  error?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  favoritePhotos: string[]
  sessionCount: number
  totalPhotos: number
  lastActive: Date
  preferences: {
    defaultFilter: string
    autoSave: boolean
    showTimestamp: boolean
  }
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'normal' | 'large' | 'xl'
  contrast: 'normal' | 'high'
  reducedMotion: boolean
  screenReader: boolean
  focusVisible: boolean
  keyboardNavigation: boolean
}
