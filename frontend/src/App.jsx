import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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


// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/image-search" element={<ImageSearch />} />
            <Route path="/price-comparison" element={<PriceComparison />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/smart-size-estimation" element={<SmartSize />} />
            <Route path="/get-recommendations" element={<GetRecommendation />} />
            <Route path="/size-estimation" element={<SizeEstimation />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/api-test" element={<APITest />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
