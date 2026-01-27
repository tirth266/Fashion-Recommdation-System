import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ImageSearch from './pages/ImageSearch'
import PriceComparison from './pages/PriceComparison'
import Recommendations from './pages/Recommendations'
import SizeEstimation from './pages/SizeEstimation'

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
        </Routes>
      </div>
    </Router>
  )
}

export default App
