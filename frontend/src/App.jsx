import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ImageSearch from './pages/ImageSearch'
import PriceComparison from './pages/PriceComparison'
import Recommendations from './pages/Recommendations'
import SizeEstimation from './pages/SizeEstimation'
import Profile from './pages/Profile'
import APITest from './pages/APITest'


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
          {/* Navbar removed to avoid duplication */}
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
