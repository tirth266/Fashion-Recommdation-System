import { useState } from 'react'

export default function PriceComparison() {
  const [productId, setProductId] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('price')
  const [sortOrder, setSortOrder] = useState('asc')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!productId.trim()) return

    setResults([])
    setError(null)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)

      const mockResults = [
        { id: 1, retailer: 'Fashion Hub Premium', price: 45.99, stock: 'In Stock', rating: 4.8, delivery: '2-3 days', logo: 'FH' },
        { id: 2, retailer: 'Style Marketplace', price: 49.99, stock: 'In Stock', rating: 4.6, delivery: '1-2 days', logo: 'SM' },
        { id: 3, retailer: 'Trendy Outlet', price: 42.99, stock: 'Low Stock', rating: 4.4, delivery: '3-5 days', logo: 'TO' },
        { id: 4, retailer: 'Fashion Central', price: 51.99, stock: 'Out of Stock', rating: 4.7, delivery: 'Not Available', logo: 'FC' },
        { id: 5, retailer: 'Elite Fashion', price: 39.99, stock: 'In Stock', rating: 4.9, delivery: 'Same Day', logo: 'EF' },
        { id: 6, retailer: 'Budget Styles', price: 54.99, stock: 'In Stock', rating: 4.2, delivery: '5-7 days', logo: 'BS' },
      ]

      setResults(mockResults)
    }, 1500)
  }

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    } else if (sortBy === 'rating') {
      return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating
    }
    return 0
  })

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getBestDeal = () => {
    if (results.length === 0) return null
    return results.reduce((best, current) => 
      current.price < best.price && current.stock === 'In Stock' ? current : best
    )
  }

  const bestDeal = getBestDeal()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Price Comparison</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare prices across multiple retailers and find the best deals for your favorite fashion items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Product</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="productId" className="block text-sm font-semibold text-gray-900 mb-2">
                    Product ID or Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="productId"
                      placeholder="Enter product ID or keywords"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                      required
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </div>
                  ) : 'Compare Prices'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Comparison Features</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Real-time price tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Stock availability check
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Delivery time estimates
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Customer ratings
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-6">
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Comparing Prices</h3>
                <p className="text-gray-600">Scanning multiple retailers for the best deals...</p>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-6">
                {/* Best Deal Banner */}
                {bestDeal && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-lg font-bold">Best Deal Found!</span>
                        </div>
                        <p className="text-lg">
                          <span className="font-bold text-2xl">${bestDeal.price.toFixed(2)}</span> at {bestDeal.retailer}
                        </p>
                        <p className="text-green-100 mt-1">Save ${(Math.max(...results.map(r => r.price)) - bestDeal.price).toFixed(2)} compared to others</p>
                      </div>
                      <button className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors">
                        Get This Deal
                      </button>
                    </div>
                  </div>
                )}

                {/* Sort Controls */}
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <button
                      onClick={() => toggleSort('price')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        sortBy === 'price' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => toggleSort('rating')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        sortBy === 'rating' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">Price Comparison Results</h3>
                    <p className="text-gray-600 mt-1">{results.length} retailers found</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Retailer</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Delivery</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedResults.map((result, idx) => (
                          <tr 
                            key={result.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                              result.id === bestDeal?.id ? 'bg-green-50' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                                  {result.logo}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{result.retailer}</div>
                                  {result.id === bestDeal?.id && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                      Best Price
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-lg text-blue-600">${result.price.toFixed(2)}</div>
                              {result.price === Math.min(...results.map(r => r.price)) && result.stock === 'In Stock' && (
                                <span className="text-xs text-green-600">Lowest Price</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <svg 
                                      key={i} 
                                      className={`w-4 h-4 ${i < Math.floor(result.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-600">{result.rating}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                result.stock === 'In Stock' 
                                  ? 'bg-green-100 text-green-800' 
                                  : result.stock === 'Low Stock' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {result.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {result.delivery}
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                  result.stock === 'In Stock' 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105' 
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={result.stock !== 'In Stock'}
                              >
                                {result.stock === 'In Stock' ? 'View Deal' : 'Out of Stock'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Find the Best Prices</h3>
                <p className="text-gray-600 mb-6">Enter a product ID or name to compare prices across multiple retailers</p>
                <button 
                  onClick={() => document.getElementById('productId').focus()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Search Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

