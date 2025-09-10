import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PhotoProvider } from './contexts/PhotoContext'
import { AuthProvider } from './contexts/AuthContext'
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
import './App.css'
import './theme.css'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
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
              <Route path="/admin" element={<Admin />} />
              <Route path="/demo" element={<ComponentDemo />} />
            </Routes>
          </div>
        </Router>
        </PhotoProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
