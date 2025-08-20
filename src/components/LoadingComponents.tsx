import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  text?: string
  overlay?: boolean
}

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
}

interface PhotoSkeletonProps {
  count?: number
  layout?: 'grid' | 'list'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#007bff', 
  text,
  overlay = false 
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return '20px'
      case 'large': return '48px'
      default: return '32px'
    }
  }

  const spinner = (
    <div className={`loading-spinner ${overlay ? 'overlay' : ''}`}>
      <div className="spinner-container">
        <div 
          className="spinner" 
          style={{ 
            width: getSizeValue(), 
            height: getSizeValue(),
            borderTopColor: color
          }}
        />
        {text && <p className="loading-text">{text}</p>}
      </div>
      
      <style>{`
        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        
        .loading-spinner.overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          z-index: 1000;
        }
        
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .spinner {
          border: 3px solid #f3f3f3;
          border-radius: 50%;
          border-top: 3px solid ${color};
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          margin: 0;
          color: #666;
          font-size: 0.875rem;
          text-align: center;
        }
      `}</style>
    </div>
  )

  return spinner
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <>
      <div 
        className={`skeleton ${className}`}
        style={{ 
          width, 
          height, 
          borderRadius 
        }}
      />
      
      <style>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  )
}

export const PhotoSkeleton: React.FC<PhotoSkeletonProps> = ({ 
  count = 6, 
  layout = 'grid' 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className="photo-skeleton-item">
      <Skeleton height="200px" borderRadius="8px" />
      <div className="photo-skeleton-details">
        <Skeleton height="16px" width="60%" />
        <Skeleton height="14px" width="40%" />
      </div>
    </div>
  ))

  return (
    <div className={`photo-skeleton-container ${layout}`}>
      {skeletons}
      
      <style>{`
        .photo-skeleton-container {
          padding: 1rem;
        }
        
        .photo-skeleton-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .photo-skeleton-container.list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .photo-skeleton-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .photo-skeleton-container.list .photo-skeleton-item {
          flex-direction: row;
          align-items: center;
        }
        
        .photo-skeleton-container.list .photo-skeleton-item > div:first-child {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }
        
        .photo-skeleton-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }
        
        .photo-skeleton-container.list .photo-skeleton-details {
          margin-left: 1rem;
        }
      `}</style>
    </div>
  )
}

interface CameraLoadingProps {
  message?: string
}

export const CameraLoading: React.FC<CameraLoadingProps> = ({ 
  message = 'Initializing camera...' 
}) => {
  return (
    <div className="camera-loading">
      <div className="camera-loading-content">
        <div className="camera-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        </div>
        <LoadingSpinner size="medium" />
        <p>{message}</p>
      </div>
      
      <style>{`
        .camera-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }
        
        .camera-loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
          color: #6c757d;
        }
        
        .camera-icon {
          opacity: 0.5;
        }
        
        .camera-loading-content p {
          margin: 0;
          font-size: 1rem;
        }
      `}</style>
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  label?: string
  color?: string
  height?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  color = '#007bff',
  height = '8px'
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  
  return (
    <div className="progress-bar-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar-track" style={{ height }}>
        <div 
          className="progress-bar-fill"
          style={{ 
            width: `${clampedProgress}%`,
            backgroundColor: color,
            height: '100%'
          }}
        />
      </div>
      <div className="progress-percentage">{Math.round(clampedProgress)}%</div>
      
      <style>{`
        .progress-bar-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .progress-label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }
        
        .progress-bar-track {
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-bar-fill {
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-percentage {
          font-size: 0.75rem;
          color: #666;
          text-align: right;
        }
      `}</style>
    </div>
  )
}

export default {
  LoadingSpinner,
  Skeleton,
  PhotoSkeleton,
  CameraLoading,
  ProgressBar
}
