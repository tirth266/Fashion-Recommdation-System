import { useState, useRef } from 'react'

export default function ImageSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = (file) => {
    setResults([])
    setError(null)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      
      const mockResults = [
        { name: 'Similar Item 1', price: '$49.99', similarity: '95%' },
        { name: 'Similar Item 2', price: '$59.99', similarity: '88%' },
        { name: 'Similar Item 3', price: '$44.99', similarity: '82%' },
        { name: 'Similar Item 4', price: '$64.99', similarity: '79%' },
      ]

      setResults(mockResults)
    }, 2000)
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Image Search</h2>
        <p className="text-lg text-gray-600 mb-8">Upload an image to find similar fashion items in our catalog</p>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 mb-8 bg-white ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-semibold text-gray-700 mb-2">Drag and drop your image here</p>
          <p className="text-gray-600 mb-2">or click to select a file</p>
          <p className="text-sm text-gray-500">Supported formats: PNG, JPG, GIF</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Searching for similar items...</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Similar Items Found</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Image</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Similarity: {item.similarity}</p>
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

