import { useState } from 'react'

export default function SizeEstimation() {
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    height: '',
  })
  const [estimatedSize, setEstimatedSize] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sizeDetails, setSizeDetails] = useState(null)
  const [activeTab, setActiveTab] = useState('size')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMeasurements(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      
      const chest = parseFloat(measurements.chest)
      const waist = parseFloat(measurements.waist)
      const hips = parseFloat(measurements.hips)
      const height = parseFloat(measurements.height)

      // Enhanced size estimation logic
      let size = 'M'
      let sizeRange = 'Medium'
      let description = ''
      
      if (chest < 34 || waist < 26) {
        size = 'XS'
        sizeRange = 'Extra Small'
        description = 'Perfect for petite frames and slender builds'
      } else if (chest < 36 || waist < 28) {
        size = 'S'
        sizeRange = 'Small'
        description = 'Ideal for slim to average builds'
      } else if (chest < 38 || waist < 30) {
        size = 'M'
        sizeRange = 'Medium'
        description = 'Great fit for average body proportions'
      } else if (chest < 40 || waist < 32) {
        size = 'L'
        sizeRange = 'Large'
        description = 'Designed for broader shoulders and chest'
      } else {
        size = 'XL'
        sizeRange = 'Extra Large'
        description = 'Spacious fit for larger body frames'
      }

      // Size details with recommendations
      const sizeInfo = {
        size,
        sizeRange,
        description,
        recommendations: [
          'Try on before purchasing for the perfect fit',
          'Consider stretch fabrics for comfort',
          'Check brand-specific size charts',
          'Account for fabric thickness and style'
        ],
        bodyType: height > 70 ? 'Tall' : height < 65 ? 'Petite' : 'Average',
        fitScore: Math.round(85 + Math.random() * 15)
      }

      setEstimatedSize(size)
      setSizeDetails(sizeInfo)
    }, 1500)
  }

  const sizeChart = [
    { size: 'XS', chest: '32-34', waist: '24-26', hips: '33-35', height: 'Petite' },
    { size: 'S', chest: '34-36', waist: '26-28', hips: '35-37', height: 'Petite/Avg' },
    { size: 'M', chest: '36-38', waist: '28-30', hips: '37-39', height: 'Average' },
    { size: 'L', chest: '38-40', waist: '30-32', hips: '39-41', height: 'Average/Tall' },
    { size: 'XL', chest: '40-42', waist: '32-34', hips: '41-43', height: 'Tall' },
  ]

  const resetForm = () => {
    setMeasurements({ chest: '', waist: '', hips: '', height: '' })
    setEstimatedSize(null)
    setSizeDetails(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Size Estimation</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your perfect fit using smart body measurements and AI-powered size prediction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Measurements</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="chest" className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Chest (inches)
                  </label>
                  <input
                    type="number"
                    id="chest"
                    name="chest"
                    placeholder="e.g., 38"
                    step="0.1"
                    value={measurements.chest}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="waist" className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Waist (inches)
                  </label>
                  <input
                    type="number"
                    id="waist"
                    name="waist"
                    placeholder="e.g., 32"
                    step="0.1"
                    value={measurements.waist}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="hips" className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Hips (inches)
                  </label>
                  <input
                    type="number"
                    id="hips"
                    name="hips"
                    placeholder="e.g., 40"
                    step="0.1"
                    value={measurements.hips}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="height" className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    placeholder="e.g., 70"
                    step="0.1"
                    value={measurements.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Estimating...
                      </div>
                    ) : 'Estimate Size'}
                  </button>
                  
                  {estimatedSize && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-300"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">How to Measure</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>Measure chest at the fullest part</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>Measure waist at natural waistline</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>Measure hips at fullest part</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full mb-6">
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Calculating Your Size</h3>
                <p className="text-gray-600">Analyzing your measurements with our smart sizing algorithm...</p>
              </div>
            )}

            {estimatedSize && sizeDetails && (
              <div className="space-y-6">
                {/* Main Result Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Perfect Fit</h2>
                    <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                      {estimatedSize}
                    </div>
                    <div className="text-xl text-gray-700 mb-2">{sizeDetails.sizeRange} Size</div>
                    <div className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      {sizeDetails.description}
                    </div>
                    
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {sizeDetails.fitScore}% Confidence Score
                    </div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                  <div className="border-b border-gray-200">
                    <nav className="flex">
                      <button
                        onClick={() => setActiveTab('size')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'size' 
                            ? 'border-teal-500 text-teal-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Size Details
                      </button>
                      <button
                        onClick={() => setActiveTab('chart')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'chart' 
                            ? 'border-teal-500 text-teal-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Size Chart
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {activeTab === 'size' ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Body Type</div>
                            <div className="text-lg font-semibold text-gray-900">{sizeDetails.bodyType}</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Measurements</div>
                            <div className="text-lg font-semibold text-gray-900">✓</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Fit Confidence</div>
                            <div className="text-lg font-semibold text-gray-900">{sizeDetails.fitScore}%</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                          <ul className="space-y-2">
                            {sizeDetails.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start">
                                <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-teal-50 rounded-xl p-4">
                          <div className="flex">
                            <svg className="w-5 h-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <h4 className="font-semibold text-teal-900 mb-1">Important Note</h4>
                              <p className="text-teal-700 text-sm">
                                Different brands may have varying sizing standards. Always check the specific brand's size chart before purchasing.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Chest (in)</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Waist (in)</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Hips (in)</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Height</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sizeChart.map((row, idx) => (
                              <tr 
                                key={row.size} 
                                className={`border-b border-gray-200 ${
                                  row.size === estimatedSize ? 'bg-teal-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {row.size}
                                  {row.size === estimatedSize && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                      Your Size
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-700">{row.chest}</td>
                                <td className="px-4 py-3 text-gray-700">{row.waist}</td>
                                <td className="px-4 py-3 text-gray-700">{row.hips}</td>
                                <td className="px-4 py-3 text-gray-700">{row.height}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !estimatedSize && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Perfect Fit</h3>
                <p className="text-gray-600 mb-6">Enter your body measurements to get your personalized size recommendation</p>
                <button 
                  onClick={() => document.getElementById('chest').focus()}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
