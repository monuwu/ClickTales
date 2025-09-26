import React, { useState } from 'react'
import PhotoEditor from '../components/PhotoEditor'
import PhotoUpload from '../components/PhotoUpload'
import PhotoShare from '../components/PhotoShare'
import UserProfile from '../components/UserProfile'
import Settings from '../components/Settings'
import { LoadingSpinner, PhotoSkeleton, CameraLoading, ProgressBar } from '../components/LoadingComponents'
import AccessibilityHelper from '../components/AccessibilityHelper'
import { usePhoto } from '../contexts/PhotoContext'
import type { Photo, PhotoboothConfig } from '../types'

const ComponentDemo: React.FC = () => {
  const { } = usePhoto()
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [samplePhoto] = useState<Photo>({
    id: 'demo-photo',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TYW1wbGUgUGhvdG8gZm9yIERlbW88L3RleHQ+PC9zdmc+',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TYW1wbGU8L3RleHQ+PC9zdmc+',
    timestamp: new Date(),
    filename: 'sample-photo.jpg',
    filter: 'none'
  })

  const [loadingProgress, setLoadingProgress] = useState(45)

  const handlePhotoEdit = (editedImageUrl: string) => {
    console.log('Photo edited:', editedImageUrl)
    setActiveDemo(null)
  }

  const handleConfigChange = (config: PhotoboothConfig) => {
    console.log('Config changed:', config)
  }

  const handleUploadComplete = (uploadedPhotos: Photo[]) => {
    console.log('Upload complete:', uploadedPhotos)
  }

  const demoComponents = [
    {
      id: 'photo-editor',
      name: '📝 Photo Editor',
      description: 'Edit photos with brightness, contrast, saturation, and rotation controls',
      component: activeDemo === 'photo-editor' ? (
        <PhotoEditor
          imageUrl={samplePhoto.url}
          onSave={handlePhotoEdit}
          onCancel={() => setActiveDemo(null)}
        />
      ) : null
    },
    {
      id: 'photo-upload',
      name: '📤 Photo Upload',
      description: 'Drag and drop or click to upload photos from device',
      component: (
        <PhotoUpload onUploadComplete={handleUploadComplete} />
      )
    },
    {
      id: 'photo-share',
      name: '📱 Photo Share',
      description: 'Share photos via social media, email, or download',
      component: activeDemo === 'photo-share' ? (
        <PhotoShare
          photo={samplePhoto}
          onClose={() => setActiveDemo(null)}
        />
      ) : null
    },
    {
      id: 'user-profile',
      name: '👤 User Profile',
      description: 'User profile with favorites, stats, and preferences',
      component: activeDemo === 'user-profile' ? (
        <UserProfile onClose={() => setActiveDemo(null)} />
      ) : null
    },
    {
      id: 'settings',
      name: '⚙️ Settings',
      description: 'Comprehensive settings panel for camera, features, and preferences',
      component: activeDemo === 'settings' ? (
        <Settings 
          onClose={() => setActiveDemo(null)}
          onConfigChange={handleConfigChange}
        />
      ) : null
    },
    {
      id: 'loading-components',
      name: '⏳ Loading Components',
      description: 'Various loading states including spinners, skeletons, and progress bars',
      component: (
        <div className="loading-demo">
          <div className="demo-section">
            <h4>Loading Spinner</h4>
            <LoadingSpinner size="medium" text="Loading photos..." />
          </div>
          
          <div className="demo-section">
            <h4>Camera Loading</h4>
            <CameraLoading message="Initializing camera..." />
          </div>
          
          <div className="demo-section">
            <h4>Photo Skeleton</h4>
            <PhotoSkeleton count={4} layout="grid" />
          </div>
          
          <div className="demo-section">
            <h4>Progress Bar</h4>
            <ProgressBar 
              progress={loadingProgress} 
              label="Processing photos..." 
              color="#28a745"
            />
            <button 
              onClick={() => setLoadingProgress(prev => Math.min(100, prev + 10))}
              style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', background: '#007bff', color: 'white', cursor: 'pointer' }}
            >
              Advance Progress
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'accessibility',
      name: '♿ Accessibility Helper',
      description: 'Accessibility controls for font size, contrast, and navigation',
      component: (
        <div className="accessibility-demo">
          <p>The accessibility helper provides a floating button and comprehensive controls for:</p>
          <ul>
            <li>Font size adjustment</li>
            <li>High contrast mode</li>
            <li>Reduced motion settings</li>
            <li>Keyboard navigation enhancements</li>
            <li>Screen reader optimizations</li>
          </ul>
          <p>Look for the floating ♿ button in the bottom-right corner!</p>
        </div>
      )
    }
  ]

  return (
    <div className="component-demo">
      <div className="demo-header">
        <h1>Component Demo</h1>
        <p>Explore the new photobooth components and their features</p>
      </div>

      <div className="demo-grid">
        {demoComponents.map(demo => (
          <div key={demo.id} className="demo-card">
            <div className="demo-card-header">
              <h3>{demo.name}</h3>
              <p>{demo.description}</p>
            </div>
            
            <div className="demo-card-body">
              {demo.id === 'photo-editor' || demo.id === 'photo-share' || demo.id === 'user-profile' || demo.id === 'settings' ? (
                <button
                  onClick={() => setActiveDemo(demo.id)}
                  className="demo-trigger-btn"
                >
                  Open {demo.name.replace(/📝|📱|👤|⚙️/g, '').trim()}
                </button>
              ) : (
                demo.component
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Render modal components */}
      {demoComponents.find(d => d.id === activeDemo)?.component}

      {/* Always render accessibility helper */}
      <AccessibilityHelper />

      <style>{`
        .component-demo {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .demo-header h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .demo-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .demo-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .demo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .demo-card-header {
          padding: 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .demo-card-header h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.25rem;
        }

        .demo-card-header p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .demo-card-body {
          padding: 1.5rem;
        }

        .demo-trigger-btn {
          width: 100%;
          padding: 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .demo-trigger-btn:hover {
          background: #0056b3;
        }

        .loading-demo {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .demo-section {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          background: #fafafa;
        }

        .demo-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .accessibility-demo {
          color: #666;
          line-height: 1.6;
        }

        .accessibility-demo ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .accessibility-demo li {
          margin: 0.5rem 0;
        }

        @media (max-width: 768px) {
          .component-demo {
            padding: 1rem;
          }

          .demo-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .demo-card-header,
          .demo-card-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ComponentDemo
