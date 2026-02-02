import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ImageSearch from './pages/ImageSearch'
import PriceComparison from './pages/PriceComparison'
import Recommendations from './pages/Recommendations'
import SizeEstimation from './pages/SizeEstimation'
import Profile from './pages/Profile'
import APITest from './pages/APITest'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/image-search" element={<ImageSearch />} />
          <Route path="/price-comparison" element={<PriceComparison />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/size-estimation" element={<SizeEstimation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/api-test" element={<APITest />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
