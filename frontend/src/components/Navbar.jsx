import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/image-search', label: 'Image Search' },
    { path: '/price-comparison', label: 'Price Comparison' },
    { path: '/recommendations', label: 'Recommendations' },
    { path: '/size-estimation', label: 'Size Estimation' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FashionAI
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 relative ${
                    isActive(item.path)
                      ? 'text-purple-600 bg-purple-50 shadow-sm'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Profile Icon */}
          <div className="flex items-center">
            <Link
              to="/profile"
              className={`p-2 rounded-full transition-all duration-300 ${
                isActive('/profile')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>

          {/* Mobile Profile Icon and Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link
              to="/profile"
              className={`p-2 rounded-full transition-all duration-300 ${
                isActive('/profile')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors duration-200"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
