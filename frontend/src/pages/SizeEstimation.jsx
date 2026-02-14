import { useState } from 'react'

export default function SizeEstimation() {
  const [activeMode, setActiveMode] = useState('manual') // 'manual' or 'ai'

  // Manual State
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    height: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [estimatedSize, setEstimatedSize] = useState(null)
  const [sizeDetails, setSizeDetails] = useState(null)

  // AI State
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [realHeight, setRealHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [gender, setGender] = useState('male')
  const [aiResult, setAiResult] = useState(null)

  // --- Manual Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMeasurements(prev => ({ ...prev, [name]: value }))
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEstimatedSize(null)

    setTimeout(() => {
      setLoading(false)
      const chest = parseFloat(measurements.chest)

      // Simple logic for demo
      let size = 'M'
      if (chest < 34) size = 'XS'
      else if (chest < 36) size = 'S'
      else if (chest < 38) size = 'M'
      else if (chest < 40) size = 'L'
      else size = 'XL'

      setEstimatedSize(size)
      setSizeDetails({
        size,
        description: 'Estimated based on your manual inputs.',
        fitScore: 85,
      })
    }, 800)
  }

  // --- AI Handlers ---
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setAiResult(null)
      setError(null)
      setEstimatedSize(null)
    }
  }

  const handleAISubmit = async (e) => {
    e.preventDefault()
    if (!imageFile) {
      setError('Please select an image first.')
      return
    }

    setLoading(true)
    setError(null)
    setAiResult(null)
    setEstimatedSize(null)

    const formData = new FormData()
    formData.append('image', imageFile)
    if (realHeight) {
      formData.append('height_cm', realHeight)
    }
    if (weight) {
      formData.append('weight_kg', weight)
    }
    if (gender) {
      formData.append('gender', gender)
    }

    try {
      const response = await fetch('http://localhost:5000/api/size/estimate-from-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to estimate size')
      }

      setAiResult(data)
      setEstimatedSize(data.recommended_size)
      setSizeDetails({
        size: data.recommended_size,
        description: data.notes || 'Based on AI body analysis.',
        fitScore: Math.round(data.confidence * 100),
      })

    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-12 font-sans text-gray-800">

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

        {/* LEFT COLUMN: Visual / Marketing */}
        <div className="hidden lg:block relative h-[700px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
          {/* Male Model Image */}
          <img
            src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2187&auto=format&fit=crop"
            alt="Smart Sizing Model"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>

          {/* Floating UI Elements (Simulated Analysis) */}
          <div className="absolute top-12 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-white text-xs font-medium">AI Analysis</p>
                <p className="text-green-400 text-sm font-bold">Active</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="mb-6 flex gap-2">
              {['Height', 'Shoulders', 'Chest'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium border border-white/10">{tag}</span>
              ))}
            </div>
            <h2 className="text-4xl font-bold mb-3 leading-tight">Find Your <br />Perfect Fit</h2>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Our advanced computer vision technology analyzes unique body biometrics to recommend the perfect size for you.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Tool */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white w-full rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 relative">

            {/* Helper Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Beta</span>
            </div>

            <div className="p-8 flex flex-col h-full min-h-[600px]">

              {/* Header */}
              <header className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Smart Size Estimation</h1>
                <p className="text-gray-400 text-xs">Upload your full-body photo to get your perfect fit</p>
              </header>

              {/* Mode Tabs */}
              <div className="flex p-1 bg-gray-50 rounded-xl mb-6">
                <button
                  onClick={() => setActiveMode('manual')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeMode === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setActiveMode('ai')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeMode === 'ai' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  AI Analysis
                </button>
              </div>

              {/* AI MODE */}
              {activeMode === 'ai' ? (
                <div className="flex-1 flex flex-col">

                  {/* Upload / Preview Area */}
                  <div className="relative group flex-1 bg-gray-50 border-2 border-dashed border-blue-100 rounded-2xl overflow-hidden transition-all hover:border-blue-300 hover:bg-blue-50/30 mb-6 min-h-[320px]">
                    <form onSubmit={handleAISubmit} className="absolute inset-0 w-full h-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                        disabled={loading}
                        title="Upload an image"
                      />
                    </form>

                    {imagePreview ? (
                      <>
                        {/* Image Preview */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity ${loading ? 'opacity-50 blur-sm' : ''}`}
                        />

                        {/* Annotated Result Overlay */}
                        {aiResult && aiResult.annotated_image && !loading && (
                          <img src={aiResult.annotated_image} className="absolute inset-0 w-full h-full object-cover z-20" alt="Analysis Overlay" />
                        )}

                        {!aiResult && !loading && (
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent z-10">
                            <p className="text-white text-xs text-center font-medium">Click to change photo</p>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Upload Placeholder */
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                        <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-blue-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <p className="text-gray-900 font-medium text-sm">Upload Photo</p>
                        <p className="text-gray-400 text-xs mt-1">Drag & drop or click</p>
                        <p className="text-gray-300 text-[10px] mt-4">(Supports JPG, PNG)</p>
                      </div>
                    )}

                    {/* Loading Spinner */}
                    {loading && (
                      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                        <p className="text-blue-600 font-bold text-xs bg-white/90 px-3 py-1 rounded-full shadow-sm">Analyzing...</p>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-100 flex items-start">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                      </div>
                    )}

                    {!estimatedSize ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            placeholder="Height (cm)"
                            value={realHeight}
                            onChange={(e) => setRealHeight(e.target.value)}
                            className="w-full text-center py-3 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-blue-100 text-gray-600 placeholder-gray-400"
                          />
                          <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full text-center py-3 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-blue-100 text-gray-600 placeholder-gray-400"
                          />
                        </div>

                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-blue-100 text-gray-600"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="child">Child</option>
                        </select>
                        <button
                          onClick={handleAISubmit}
                          disabled={loading || !imageFile}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                        >
                          Estimate My Size
                        </button>
                        <p className="text-[10px] text-center text-gray-400">
                          Looking for an example? Try a photo of a male model standing straight.
                        </p>
                      </>
                    ) : (
                      /* Results Card */
                      <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-xl animate-fade-in-up">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Recommended Size</p>
                            <h2 className="text-3xl font-bold text-white mt-1">{estimatedSize}</h2>
                          </div>
                          <div className="text-right">
                            <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded uppercase">
                              {sizeDetails.fitScore}% Match
                            </span>
                          </div>
                        </div>

                        {/* Metrics */}
                        {aiResult && aiResult.measurements && (
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-gray-700 pt-3 mb-4">
                            {Object.entries(aiResult.measurements).slice(0, 4).map(([key, val]) => (
                              <div key={key} className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 capitalize">{key.replace('_cm', '').replace('_', ' ')}</span>
                                <span className="text-gray-200 font-mono">{val}cm</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => { setEstimatedSize(null); setAiResult(null); setImagePreview(null); setImageFile(null); }}
                          className="w-full bg-white text-gray-900 py-3 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors"
                        >
                          Scan Another Photo
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* MANUAL MODE */
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Chest (in)</label>
                      <input
                        type="number"
                        name="chest"
                        value={measurements.chest}
                        onChange={handleInputChange}
                        placeholder="40"
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Waist (in)</label>
                      <input
                        type="number"
                        name="waist"
                        value={measurements.waist}
                        onChange={handleInputChange}
                        placeholder="32"
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleManualSubmit}
                    disabled={loading}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg mt-4 disabled:opacity-50"
                  >
                    {loading ? 'Calculating...' : 'Calculate Size'}
                  </button>

                  {estimatedSize && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center mt-4">
                      <p className="text-blue-600 text-xs font-bold uppercase">Your Estimated Size</p>
                      <p className="text-3xl font-bold text-blue-900 my-1">{estimatedSize}</p>
                      <p className="text-blue-400 text-xs">{sizeDetails.description}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
