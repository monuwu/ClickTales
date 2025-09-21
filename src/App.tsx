import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PhotoProvider } from './contexts/PhotoContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ErrorBoundary } from './components'
import LandingPage from './pages/LandingPage'
import CameraPage from './pages/CameraPage'
import PreviewPage from './pages/PreviewPage'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import PhotoboothHome from './pages/PhotoboothHome'
import Gallery from './pages/Gallery'
import Admin from './pages/Admin'
import ComponentDemo from './pages/ComponentDemo'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import SessionsPage from './pages/SessionsPage'
import AlbumsPage from './pages/AlbumsPage'
import './App.css'
import './theme.css'

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading ClickTales...</p>
    </div>
  </div>
)

// App routes component that uses auth context
const AppRoutes: React.FC = () => {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <PhotoProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/photobooth" element={<PhotoboothHome />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/albums" element={<AlbumsPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/demo" element={<ComponentDemo />} />
          </Routes>
        </div>
      </Router>
    </PhotoProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
