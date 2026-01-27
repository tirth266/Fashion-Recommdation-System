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

      let size = 'M'
      
      if (chest < 34 || waist < 26) {
        size = 'XS'
      } else if (chest < 36 || waist < 28) {
        size = 'S'
      } else if (chest < 38 || waist < 30) {
        size = 'M'
      } else if (chest < 40 || waist < 32) {
        size = 'L'
      } else {
        size = 'XL'
      }

      setEstimatedSize(size)
    }, 1000)
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Size Estimation</h2>
        <p className="text-lg text-gray-600 mb-8">Find your perfect fit using your body measurements</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Enter Your Measurements</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="chest" className="block text-sm font-semibold text-gray-900 mb-2">Chest (inches)</label>
                <input
                  type="number"
                  id="chest"
                  name="chest"
                  placeholder="e.g., 38"
                  step="0.1"
                  value={measurements.chest}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="waist" className="block text-sm font-semibold text-gray-900 mb-2">Waist (inches)</label>
                <input
                  type="number"
                  id="waist"
                  name="waist"
                  placeholder="e.g., 32"
                  step="0.1"
                  value={measurements.waist}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="hips" className="block text-sm font-semibold text-gray-900 mb-2">Hips (inches)</label>
                <input
                  type="number"
                  id="hips"
                  name="hips"
                  placeholder="e.g., 40"
                  step="0.1"
                  value={measurements.hips}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-semibold text-gray-900 mb-2">Height (inches)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  placeholder="e.g., 70"
                  step="0.1"
                  value={measurements.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Estimating...' : 'Estimate Size'}
              </button>
            </form>
          </div>

          {/* Result Section */}
          {estimatedSize && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Estimated Size</h3>
              <div className="text-6xl font-bold text-blue-600 mb-6">{estimatedSize}</div>
              <p className="text-gray-700 leading-relaxed mb-8">
                Based on your measurements (Chest: {measurements.chest}", Waist: {measurements.waist}", Height: {measurements.height}"), 
                we recommend size <strong>{estimatedSize}</strong> for the best fit. 
                Please note that different brands may have different sizing standards, 
                so always check the specific brand's size chart before purchasing.
              </p>
              
              {/* Size Chart */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Size Chart</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Size</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">XS</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">S</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">M</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">L</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">XL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-gray-900">Chest</td>
                        <td className="px-4 py-3 text-gray-600">32-34</td>
                        <td className="px-4 py-3 text-gray-600">34-36</td>
                        <td className="px-4 py-3 text-gray-600">36-38</td>
                        <td className="px-4 py-3 text-gray-600">38-40</td>
                        <td className="px-4 py-3 text-gray-600">40-42</td>
                      </tr>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td className="px-4 py-3 text-gray-900">Waist</td>
                        <td className="px-4 py-3 text-gray-600">24-26</td>
                        <td className="px-4 py-3 text-gray-600">26-28</td>
                        <td className="px-4 py-3 text-gray-600">28-30</td>
                        <td className="px-4 py-3 text-gray-600">30-32</td>
                        <td className="px-4 py-3 text-gray-600">32-34</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
