import { useState } from 'react'
import axios from 'axios'

export default function Recommendations() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setResults([]) // Clear previous results
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const response = await axios.post('/api/recommendations/recommend', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.recommended_images) {
        setResults(response.data.recommended_images)
      } else {
        setError('No recommendations returned.')
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err.response?.data?.error || 'Failed to get recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Visual Fashion Search
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an image to find similar fashion items from our collection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Image</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Image
                  </label>
                  <div className="relative">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100
                      "
                    />
                  </div>
                </div>

                {preview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img src={preview} alt="Upload preview" className="w-full rounded-lg shadow-md max-h-64 object-cover" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || loading}
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
                  ) : 'Find Similar Items'}
                </button>
              </form>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Image</h3>
                <p className="text-gray-600">Finding the best matches from our collection...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
                <p>{error}</p>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Recommended for You</h3>
                    <p className="text-gray-600 mt-1">
                      Found {results.length} similar items
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((imagePath, idx) => (
                    <div
                      key={idx}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2"
                    >
                      <div className="relative overflow-hidden aspect-square">
                        <img
                          src={imagePath}
                          alt={`Recommendation ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                          }}
                        />
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-2">Similarity Match</p>
                        <div className="flex justify-between items-center">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            #{idx + 1} Match
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && results.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h3>
                <p className="text-gray-600">Upload an image to see visually similar products.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
