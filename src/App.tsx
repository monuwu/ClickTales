import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PhotoProvider } from './contexts/PhotoContext'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ErrorBoundary } from './components'
import FloatingDock from './components/FloatingDock'
import LandingPage from './pages/LandingPage'
import CameraPage from './pages/CameraPage'
import PreviewPage from './pages/PreviewPage'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import PhotoboothHome from './pages/PhotoboothHome'
import Gallery from './pages/Gallery'
import CollagePage from './pages/CollagePage'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Albums from './pages/Albums'
import ForgotPassword from './pages/ForgotPassword'
import './App.css'
import './theme.css'

// App routes component that uses auth context
const AppRoutes: React.FC = () => {
  return (
    <NotificationProvider>
      <PhotoProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* All routes now public - accessible without authentication */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/photobooth" element={<PhotoboothHome />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="/collage" element={<CollagePage />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
            
            {/* Floating Dock Navigation - appears on all pages except landing */}
            <FloatingDock />
          </div>
        </Router>
      </PhotoProvider>
    </NotificationProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
