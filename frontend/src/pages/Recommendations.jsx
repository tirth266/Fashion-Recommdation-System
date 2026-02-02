import { useState } from 'react'

export default function Recommendations() {
  const [userId, setUserId] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userId.trim()) return

    setResults([])
    setError(null)
    setLoading(true)

    // Mock user profile
    const mockProfile = {
      name: 'Alex Johnson',
      style: 'Casual Elegance',
      preferences: ['Denim', 'Blazers', 'Sneakers'],
      budget: '$$',
      favoriteColors: ['Navy', 'White', 'Black']
    }

    setUserProfile(mockProfile)

    setTimeout(() => {
      setLoading(false)

      const mockResults = [
        { id: 1, name: 'Premium Denim Jacket', price: 79.99, category: 'Outerwear', brand: 'Urban Classics', rating: 4.8, tags: ['Trending', 'Bestseller'], image: 'denim-jacket' },
        { id: 2, name: 'Slim Fit Jeans', price: 54.99, category: 'Bottoms', brand: 'Style Denim', rating: 4.6, tags: ['New Arrival'], image: 'slim-jeans' },
        { id: 3, name: 'Classic White Shirt', price: 34.99, category: 'Tops', brand: 'Elegant Wear', rating: 4.7, tags: ['Essential'], image: 'white-shirt' },
        { id: 4, name: 'Genuine Leather Jacket', price: 129.99, category: 'Outerwear', brand: 'Premium Leather', rating: 4.9, tags: ['Luxury'], image: 'leather-jacket' },
        { id: 5, name: 'Summer Floral Dress', price: 49.99, category: 'Dresses', brand: 'Bloom Fashion', rating: 4.5, tags: ['Seasonal'], image: 'floral-dress' },
        { id: 6, name: 'Running Sneakers', price: 99.99, category: 'Footwear', brand: 'Active Gear', rating: 4.4, tags: ['Athletic'], image: 'sneakers' },
        { id: 7, name: 'Wool Blazer', price: 89.99, category: 'Outerwear', brand: 'Executive Style', rating: 4.7, tags: ['Professional'], image: 'wool-blazer' },
        { id: 8, name: 'Casual Chinos', price: 44.99, category: 'Bottoms', brand: 'Comfort Wear', rating: 4.3, tags: ['Comfort'], image: 'chinos' },
      ]

      setResults(mockResults)
    }, 1500)
  }

  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(item => item.category.toLowerCase() === activeFilter.toLowerCase())

  const categories = ['all', 'outerwear', 'bottoms', 'tops', 'dresses', 'footwear']

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Personalized Recommendations</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover fashion items tailored to your unique style and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="userId" className="block text-sm font-semibold text-gray-900 mb-2">
                    User ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="userId"
                      placeholder="Enter your user ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pl-10"
                      required
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </div>
                  ) : 'Get Recommendations'}
                </button>
              </form>

              {userProfile && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Your Style Profile</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Style</p>
                      <p className="font-medium text-gray-900">{userProfile.style}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preferences</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {userProfile.preferences.map((pref, idx) => (
                          <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Favorite Colors</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {userProfile.favoriteColors.map((color, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-6">
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Recommendations</h3>
                <p className="text-gray-600">Analyzing your style preferences and browsing history...</p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Filter by:</span>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeFilter === category
                            ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Recommended for You</h3>
                    <p className="text-gray-600 mt-1">
                      {filteredResults.length} items found {activeFilter !== 'all' && `in ${activeFilter}`}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    AI-Powered Recommendations
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2"
                    >
                      <div className="relative overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-white font-bold text-lg">
                                {item.category.charAt(0)}
                              </span>
                            </div>
                            <span className="text-gray-500 font-medium">{item.brand}</span>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="absolute top-4 left-4 space-y-2">
                          {item.tags && item.tags.map((tag, tagIdx) => (
                            <span 
                              key={tagIdx}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${{
                                'Trending': 'bg-orange-100 text-orange-800',
                                'Bestseller': 'bg-green-100 text-green-800',
                                'New Arrival': 'bg-blue-100 text-blue-800',
                                'Essential': 'bg-purple-100 text-purple-800',
                                'Luxury': 'bg-yellow-100 text-yellow-800',
                                'Seasonal': 'bg-pink-100 text-pink-800',
                                'Athletic': 'bg-teal-100 text-teal-800',
                                'Professional': 'bg-indigo-100 text-indigo-800',
                                'Comfort': 'bg-gray-100 text-gray-800',
                              }[tag] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Rating */}
                        <div className="absolute top-4 right-4 flex items-center bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                            {item.name}
                          </h4>
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-2xl font-bold text-indigo-600">${item.price}</div>
                            <div className="text-sm text-gray-500">by {item.brand}</div>
                          </div>
                          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Your Perfect Style</h3>
                <p className="text-gray-600 mb-6">Enter your user ID to get personalized fashion recommendations tailored to your unique taste</p>
                <button 
                  onClick={() => document.getElementById('userId').focus()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
