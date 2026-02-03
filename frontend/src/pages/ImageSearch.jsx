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
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
            <span className="gradient-text">Visual Search</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload an image and discover visually similar fashion items using our advanced AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl shadow-xl p-8 border border-white/20 sticky top-24 transform transition-all duration-300 hover:border-white/40">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">📤 Upload Image</h2>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-50/30 shadow-lg scale-105' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/20'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📸</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">Drag image here</p>
                  <p className="text-gray-600 mb-3">or click to browse</p>
                  <div className="inline-flex items-center px-3 py-1 bg-purple-100/50 rounded-full text-sm text-purple-700 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    PNG, JPG, GIF
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
                <div className="mb-6 animate-slide-up">
                  <div className="relative rounded-lg overflow-hidden border-2 border-purple-300/50 shadow-md">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <button 
                      onClick={clearResults}
                      className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-all transform hover:scale-110 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="glass rounded-xl p-5 border border-white/20">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">✨ How It Works</h3>
                <div className="space-y-2">
                  {[
                    'Upload a fashion image',
                    'AI analyzes visual features',
                    'Find similar items instantly',
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <span className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                        {idx + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {loading && (
              <div className="glass rounded-2xl shadow-xl p-12 text-center border border-white/20 animate-slide-up">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 animate-float">
                  <span className="text-3xl animate-pulse">🔍</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Image</h3>
                <p className="text-gray-600 mb-6">Our advanced AI is searching for visually similar items...</p>
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="glass rounded-2xl shadow-xl p-8 border border-white/20 animate-slide-up">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">✅ Found {results.length} Items</h3>
                    <p className="text-gray-600 mt-1">Ranked by visual similarity</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-gray-700 border border-white/20">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    AI Results
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((item) => (
                    <div 
                      key={item.id} 
                      className="group glass card-hover rounded-2xl shadow-lg overflow-hidden border border-white/20 hover:border-white/40"
                    >
                      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="aspect-square flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                              <span className="text-3xl">👗</span>
                            </div>
                            <span className="text-gray-600 font-semibold">{item.category}</span>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="glass px-4 py-2 rounded-full text-sm font-bold text-purple-600 border border-white/30 backdrop-blur-md">
                            {item.similarity}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors mb-3 line-clamp-2">
                          {item.name}
                        </h4>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-semibold text-purple-600 bg-purple-100/50 px-3 py-1 rounded-full">
                            {item.brand}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100/50 px-3 py-1 rounded-full font-medium">
                            {item.category}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-2xl font-black gradient-text">{item.price}</div>
                          <button className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && results.length === 0 && !uploadedImage && (
              <div className="glass rounded-2xl shadow-xl p-12 text-center border border-white/20">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-5xl">🖼️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Fashion by Image</h3>
                <p className="text-gray-600 mb-8">Upload a fashion image to discover visually similar items from our catalog</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                  <span>📤</span> Upload Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
