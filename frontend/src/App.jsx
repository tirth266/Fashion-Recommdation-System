import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ImageSearch from './pages/ImageSearch'
import PriceComparison from './pages/PriceComparison'
import Recommendations from './pages/Recommendations'

import SmartSize from './pages/SmartSize'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { AuthProvider, useAuth } from './context/AuthContext'
import GetRecommendation from './pages/GetRecommendation'
import SizeEstimation from './pages/SizeEstimation'
import APITest from './pages/APITest'


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

            {/* Public but maybe should be protected? Image Search is core feature? 
                User said "All recommendation features... must be locked".
                /image-search seems to be a feature. 
            */}
            <Route path="/image-search" element={<AuthGuard><ImageSearch /></AuthGuard>} />
            <Route path="/price-comparison" element={<AuthGuard><PriceComparison /></AuthGuard>} />

            {/* Protected Features */}
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/recommendations" element={<AuthGuard><Recommendations /></AuthGuard>} />
            <Route path="/smart-size-estimation" element={<AuthGuard><SmartSize /></AuthGuard>} />
            <Route path="/get-recommendations" element={<AuthGuard><GetRecommendation /></AuthGuard>} />
            <Route path="/size-estimation" element={<AuthGuard><SizeEstimation /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />

            <Route path="/api-test" element={<APITest />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
