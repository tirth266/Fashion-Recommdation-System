import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Login from './pages/Login'
import SizeEstimation from './pages/SizeEstimation'
import RecommendationPage from './pages/RecommendationPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthGuard from './components/Auth/AuthGuard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/size-estimation" element={<SizeEstimation />} />
            <Route path="/recommendation" element={<RecommendationPage />} />
            {/* Profile Route */}
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
