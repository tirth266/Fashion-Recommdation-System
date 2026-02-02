import { useState, useRef } from 'react'

export default function ImageSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
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

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target.result)
    }
    reader.readAsDataURL(file)

    setTimeout(() => {
      setLoading(false)
      
      const mockResults = [
        { id: 1, name: 'Similar Designer Dress', price: '$49.99', similarity: '95%', brand: 'Fashion Forward', category: 'Dresses' },
        { id: 2, name: 'Casual Blouse', price: '$59.99', similarity: '88%', brand: 'Style Haven', category: 'Tops' },
        { id: 3, name: 'Denim Jacket', price: '$44.99', similarity: '82%', brand: 'Urban Classics', category: 'Outerwear' },
        { id: 4, name: 'Chic Midi Skirt', price: '$64.99', similarity: '79%', brand: 'Modern Trend', category: 'Skirts' },
        { id: 5, name: 'Business Pantsuit', price: '$129.99', similarity: '75%', brand: 'Elite Collections', category: 'Suits' },
        { id: 6, name: 'Summer Maxi Dress', price: '$39.99', similarity: '72%', brand: 'Breezy Wear', category: 'Dresses' },
      ]

      setResults(mockResults)
    }, 2000)
  }

  const clearResults = () => {
    setResults([])
    setUploadedImage(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Visual Search</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an image to find visually similar fashion items using our advanced AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Image</h2>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-50 shadow-lg' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-25'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Drag and drop your image</p>
                  <p className="text-gray-600 mb-3">or click to browse files</p>
                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    PNG, JPG, GIF supported
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>

              {uploadedImage && (
                <div className="mb-6">
                  <div className="relative rounded-lg overflow-hidden border-2 border-purple-200">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button 
                        onClick={clearResults}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-900 mb-2">How it works</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                    Upload your fashion image
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                    AI analyzes visual features
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                    Get similar items instantly
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Image</h3>
                <p className="text-gray-600">Our AI is searching for visually similar fashion items...</p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Similar Items Found ({results.length})</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    AI-Powered Results
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="group bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-gray-500 font-medium">{item.category}</span>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-purple-600 border border-purple-200">
                            {item.similarity}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors truncate">
                            {item.name}
                          </h4>
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {item.brand}
                          </span>
                          <span className="text-sm text-gray-500">{item.category}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-2xl font-bold text-purple-600">{item.price}</div>
                          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
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
            {!loading && results.length === 0 && !uploadedImage && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Fashion by Image</h3>
                <p className="text-gray-600 mb-6">Upload a fashion image to discover visually similar items in our catalog</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Upload Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

