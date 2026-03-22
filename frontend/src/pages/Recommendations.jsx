import { useState } from 'react'
import axios from 'axios'

export default function Recommendations() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gender, setGender] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setResults([])
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile || !gender) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('gender', gender)

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
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Visual Fashion Search</h1>
          <p className="text-lg text-gray-600">Upload an image to find similar fashion items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Image</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Image
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label htmlFor="gender-select" className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Gender
                  </label>
                  <select
                    id="gender-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Gender</option>
                    <option value="Men">Male</option>
                    <option value="Women">Female</option>
                  </select>
                </div>

                {preview && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                    <img src={preview} alt="Preview" className="w-full rounded-lg" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || !gender || loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Find Similar Items'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">Analyzing image...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                {error}
              </div>
            )}

            {results.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended Items (Top 5)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={item.url}
                          alt={`Recommendation ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300'
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600">Match #{idx + 1}</p>
                        <p className="text-lg font-semibold text-indigo-600">{(item.similarity * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 text-lg">Select an image and gender to get recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
