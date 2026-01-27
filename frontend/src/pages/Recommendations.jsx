import { useState } from 'react'

export default function Recommendations() {
  const [userId, setUserId] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userId.trim()) return

    setResults([])
    setError(null)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)

      const mockResults = [
        { name: 'Casual Blazer', price: '$79.99', category: 'Outerwear' },
        { name: 'Denim Jeans', price: '$54.99', category: 'Bottoms' },
        { name: 'White Shirt', price: '$34.99', category: 'Tops' },
        { name: 'Leather Jacket', price: '$129.99', category: 'Outerwear' },
        { name: 'Summer Dress', price: '$49.99', category: 'Dresses' },
        { name: 'Sports Shoes', price: '$99.99', category: 'Footwear' },
      ]

      setResults(mockResults)
    }, 1500)
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Personalized Recommendations</h2>
        <p className="text-lg text-gray-600 mb-8">Get personalized product recommendations based on your profile</p>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label htmlFor="userId" className="block text-sm font-semibold text-gray-900 mb-2">User ID</label>
            <input
              type="text"
              id="userId"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading recommendations...</p>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:-translate-y-1">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">{item.category}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                    <div className="text-xl font-bold text-blue-600 mt-3">{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mt-6">
            {error}
          </div>
        )}
      </div>
    </main>
  )
}
