import React, { useState, useEffect } from 'react'
import { usePhotos } from '../contexts/PhotoContext'
import { useAuth } from '../contexts/AuthContext'
import type { Photo } from '../types'

interface UserProfile {
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

interface UserProfileProps {
  onClose?: () => void
}

const UserProfileComponent: React.FC<UserProfileProps> = ({ onClose }) => {
  const { photos } = usePhotos()
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || 'user-1',
    name: user?.name || 'Photobooth User',
    email: user?.email || 'user@photobooth.com',
    favoritePhotos: [],
    sessionCount: 0,
    totalPhotos: 0,
    lastActive: new Date(),
    preferences: {
      defaultFilter: 'none',
      autoSave: true,
      showTimestamp: true
    }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(profile)

  useEffect(() => {
    // Update profile when user changes (after login/signup)
    if (user) {
      setProfile(prev => ({
        ...prev,
        id: user.id,
        name: user.name,
        email: user.email
      }))
      setEditForm(prev => ({
        ...prev,
        id: user.id,
        name: user.name,
        email: user.email
      }))
    }
  }, [user])

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('photobooth-profile')
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        // Merge with current user data to ensure consistency
        const mergedProfile = {
          ...parsed,
          id: user?.id || parsed.id,
          name: user?.name || parsed.name,
          email: user?.email || parsed.email
        }
        setProfile(mergedProfile)
        setEditForm(mergedProfile)
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    } else if (user) {
      // If no saved profile but user is authenticated, create initial profile
      const initialProfile: UserProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        favoritePhotos: [],
        sessionCount: 0,
        totalPhotos: 0,
        lastActive: new Date(),
        preferences: {
          defaultFilter: 'none',
          autoSave: true,
          showTimestamp: true
        }
      }
      setProfile(initialProfile)
      setEditForm(initialProfile)
      // Auto-save the initial profile
      localStorage.setItem('photobooth-profile', JSON.stringify(initialProfile))
    }
  }, [user])

  useEffect(() => {
    // Update profile stats based on photos
    setProfile(prev => ({
      ...prev,
      totalPhotos: photos.length,
      lastActive: new Date()
    }))
  }, [photos])

  useEffect(() => {
    // Save profile to localStorage whenever it changes
    if (profile.id !== 'user-1') { // Don't save dummy data
      localStorage.setItem('photobooth-profile', JSON.stringify(profile))
    }
  }, [profile])

  const toggleFavorite = (photoId: string) => {
    setProfile(prev => ({
      ...prev,
      favoritePhotos: prev.favoritePhotos.includes(photoId)
        ? prev.favoritePhotos.filter(id => id !== photoId)
        : [...prev.favoritePhotos, photoId]
    }))
  }

  const handleSaveProfile = () => {
    setProfile(editForm)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  const getFavoritePhotos = (): Photo[] => {
    return photos.filter(photo => profile.favoritePhotos.includes(photo.id))
  }

  const getRecentPhotos = (): Photo[] => {
    return photos.slice(0, 6)
  }

  const getSessionStats = () => {
    const today = new Date()
    const todayPhotos = photos.filter(photo => {
      const photoDate = new Date(photo.timestamp)
      return photoDate.toDateString() === today.toDateString()
    })

    return {
      todayPhotos: todayPhotos.length,
      totalPhotos: photos.length,
      favoriteCount: profile.favoritePhotos.length
    }
  }

  const stats = getSessionStats()
  const favoritePhotos = getFavoritePhotos()
  const recentPhotos = getRecentPhotos()

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>
  }

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>User Profile</h2>
          {onClose && (
            <button onClick={onClose} className="close-btn">×</button>
          )}
        </div>

        <div className="profile-content">
          {!isEditing ? (
            <>
              <div className="profile-info">
                <div className="avatar-section">
                  <div className="avatar">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h3>{profile.name}</h3>
                    <p>{profile.email}</p>
                    <p className="last-active">
                      Last active: {profile.lastActive.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-btn"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="stats-section">
                  <div className="stat-card">
                    <span className="stat-number">{stats.todayPhotos}</span>
                    <span className="stat-label">Photos Today</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats.totalPhotos}</span>
                    <span className="stat-label">Total Photos</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats.favoriteCount}</span>
                    <span className="stat-label">Favorites</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{profile.sessionCount}</span>
                    <span className="stat-label">Sessions</span>
                  </div>
                </div>
              </div>

              <div className="preferences-section">
                <h4>Preferences</h4>
                <div className="preference-item">
                  <span>Default Filter:</span>
                  <span>{profile.preferences.defaultFilter}</span>
                </div>
                <div className="preference-item">
                  <span>Auto Save:</span>
                  <span>{profile.preferences.autoSave ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="preference-item">
                  <span>Show Timestamp:</span>
                  <span>{profile.preferences.showTimestamp ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="photos-section">
                <div className="section-header">
                  <h4>Favorite Photos ({favoritePhotos.length})</h4>
                </div>
                <div className="photos-grid">
                  {favoritePhotos.length > 0 ? (
                    favoritePhotos.slice(0, 6).map(photo => (
                      <div key={photo.id} className="photo-item">
                        <img src={photo.thumbnail || photo.url} alt="Favorite" />
                        <button
                          onClick={() => toggleFavorite(photo.id)}
                          className="favorite-btn active"
                        >
                          ❤️
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-photos">No favorite photos yet</p>
                  )}
                </div>

                <div className="section-header">
                  <h4>Recent Photos</h4>
                </div>
                <div className="photos-grid">
                  {recentPhotos.map(photo => (
                    <div key={photo.id} className="photo-item">
                      <img src={photo.thumbnail || photo.url} alt="Recent" />
                      <button
                        onClick={() => toggleFavorite(photo.id)}
                        className={`favorite-btn ${profile.favoritePhotos.includes(photo.id) ? 'active' : ''}`}
                      >
                        {profile.favoritePhotos.includes(photo.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="edit-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Default Filter</label>
                <select
                  value={editForm.preferences.defaultFilter}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, defaultFilter: e.target.value }
                  }))}
                >
                  <option value="none">None</option>
                  <option value="sepia">Sepia</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="vintage">Vintage</option>
                  <option value="blur">Blur</option>
                </select>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.preferences.autoSave}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, autoSave: e.target.checked }
                    }))}
                  />
                  Auto Save Photos
                </label>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.preferences.showTimestamp}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, showTimestamp: e.target.checked }
                    }))}
                  />
                  Show Timestamp on Photos
                </label>
              </div>

              <div className="form-actions">
                <button onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleSaveProfile} className="save-btn">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .profile-modal {
          background: white;
          border-radius: 12px;
          max-width: 800px;
          width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .profile-header h2 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          color: #666;
        }

        .profile-content {
          padding: 1.5rem;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #007bff;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
        }

        .user-details {
          flex: 1;
        }

        .user-details h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .user-details p {
          margin: 0.25rem 0;
          color: #666;
          font-size: 0.875rem;
        }

        .last-active {
          font-size: 0.75rem !important;
          color: #999 !important;
        }

        .edit-btn {
          padding: 0.5rem 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .edit-btn:hover {
          background: #0056b3;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #666;
        }

        .preferences-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .preferences-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .preference-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .preference-item:last-child {
          border-bottom: none;
        }

        .photos-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .section-header {
          margin-bottom: 1rem;
        }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .photo-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #ddd;
        }

        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .favorite-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .favorite-btn.active {
          background: rgba(255, 255, 255, 1);
        }

        .no-photos {
          grid-column: 1 / -1;
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 2rem;
        }

        .edit-form {
          max-width: 400px;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .form-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-group.checkbox input {
          width: auto;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-btn,
        .save-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-btn {
          background: #f5f5f5;
          color: #333;
        }

        .save-btn {
          background: #007bff;
          color: white;
        }

        .cancel-btn:hover {
          background: #e9ecef;
        }

        .save-btn:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  )
}

export default UserProfileComponent
