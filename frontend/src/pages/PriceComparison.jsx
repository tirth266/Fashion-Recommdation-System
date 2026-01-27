import { useState } from 'react'

export default function PriceComparison() {
  const [productId, setProductId] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!productId.trim()) return

    setResults([])
    setError(null)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)

      const mockResults = [
        { retailer: 'Fashion Store A', price: '$45.99', stock: 'In Stock' },
        { retailer: 'Fashion Store B', price: '$49.99', stock: 'In Stock' },
        { retailer: 'Fashion Store C', price: '$42.99', stock: 'Low Stock' },
        { retailer: 'Fashion Store D', price: '$51.99', stock: 'Out of Stock' },
      ]

      setResults(mockResults)
    }, 1500)
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Price Comparison</h2>
        <p className="text-lg text-gray-600 mb-8">Compare prices for fashion items across different retailers</p>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label htmlFor="productId" className="block text-sm font-semibold text-gray-900 mb-2">Product ID</label>
            <input
              type="text"
              id="productId"
              placeholder="Enter product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Comparing...' : 'Compare Prices'}
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Comparing prices...</p>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Price Comparison Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Retailer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{result.retailer}</td>
                      <td className="px-6 py-4 font-semibold text-blue-600">{result.price}</td>
                      <td className="px-6 py-4 text-gray-600">{result.stock}</td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

