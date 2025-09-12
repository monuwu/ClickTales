import React from 'react'
import Navigation from '../components/Navigation'
import UserProfile from '../components/UserProfile'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const Profile: React.FC = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Navigation />
      <UserProfile />
    </>
  )
}

export default Profile
