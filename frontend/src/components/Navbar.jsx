import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/image-search', label: 'Image Search' },
    { path: '/price-comparison', label: 'Price Comparison' },
    { path: '/recommendations', label: 'Recommendations' },
    { path: '/size-estimation', label: 'Size Estimation' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Fashion Recommendation</h1>
          <div className="flex gap-4 flex-wrap">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
