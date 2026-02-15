
import { useState } from 'react'

export default function SmartSize() {
     const [imageFile, setImageFile] = useState(null)
     const [imagePreview, setImagePreview] = useState(null)
     const [realHeight, setRealHeight] = useState('')
     const [result, setResult] = useState(null)
     const [loading, setLoading] = useState(false)
     const [error, setError] = useState(null)

     const handleImageChange = (e) => {
          const file = e.target.files[0]
          if (file) {
               setImageFile(file)
               setImagePreview(URL.createObjectURL(file))
               setResult(null)
               setError(null)
          }
     }

     const handleAnalyze = async () => {
          if (!imageFile) return

          setLoading(true)
          setError(null)

          const formData = new FormData()
          formData.append('image', imageFile)
          if (realHeight) formData.append('height_cm', realHeight)

          try {
               const res = await fetch('/api/size/estimate-from-image', {
                    method: 'POST',
                    body: formData
               })
               const data = await res.json()

               if (!res.ok) throw new Error(data.error || 'Failed to analyze image')

               setResult(data)
          } catch (err) {
               console.error(err)
               setError(err.message)
          } finally {
               setLoading(false)
          }
     }

     const handleReset = () => {
          setImageFile(null)
          setImagePreview(null)
          setRealHeight('')
          setResult(null)
          setError(null)
     }

     return (
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
               <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-10">
                         <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                              Upload Your Photo for <span className="text-teal-600">Smart Size Prediction</span>
                         </h1>
                         <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                              Take or upload a full-body frontal photo standing straight, arms slightly away from body, with good lighting. We will estimate your measurements and suggest your size.
                         </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

                         {!result ? (
                              /* Upload State */
                              <div className="p-8 sm:p-12">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                                        {/* Image Upload Area */}
                                        <div className="order-2 md:order-1">
                                             <div className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors h-80 ${imagePreview ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-500 hover:bg-gray-50'}`}>

                                                  {imagePreview ? (
                                                       <div className="relative h-full w-full flex items-center justify-center">
                                                            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
                                                            <button onClick={handleReset} className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md">
                                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                       </div>
                                                  ) : (
                                                       <div className="pointer-events-none">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                 <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <p className="mt-2 text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                                                            <p className="mt-1 text-xs text-gray-500">JPG, PNG up to 5MB</p>
                                                       </div>
                                                  )}
                                                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" disabled={loading} />
                                             </div>
                                        </div>

                                        {/* Form Controls */}
                                        <div className="order-1 md:order-2 space-y-6">
                                             <div>
                                                  <label className="block text-sm font-semibold text-gray-900 mb-1">Your Height (cm)</label>
                                                  <div className="relative">
                                                       <input
                                                            type="number"
                                                            placeholder="e.g. 175"
                                                            value={realHeight}
                                                            onChange={(e) => setRealHeight(e.target.value)}
                                                            className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                                                       />
                                                       <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">cm</span>
                                                       </div>
                                                  </div>
                                                  <p className="mt-2 text-xs text-gray-500">Optional, but recommended for better accuracy.</p>
                                             </div>

                                             {error && (
                                                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                                       <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                 </svg>
                                                            </div>
                                                            <div className="ml-3">
                                                                 <p className="text-sm text-red-700">{error}</p>
                                                            </div>
                                                       </div>
                                                  </div>
                                             )}

                                             <button
                                                  onClick={handleAnalyze}
                                                  disabled={!imageFile || loading}
                                                  className={`nav-btn w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all ${(!imageFile || loading) ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
                                             >
                                                  {loading ? (
                                                       <span className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                            Processing...
                                                       </span>
                                                  ) : 'Analyze Photo'}
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         ) : (
                              /* Result State */
                              <div className="grid grid-cols-1 md:grid-cols-2">

                                   {/* Left: Annotated Image */}
                                   <div className="bg-gray-100 p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
                                        {result.annotated_image ? (
                                             <img src={result.annotated_image} alt="Analysis Result" className="max-h-[600px] w-auto max-w-full rounded-lg shadow-lg" />
                                        ) : (
                                             <div className="text-gray-400">No visualization available</div>
                                        )}
                                   </div>

                                   {/* Right: Metrics */}
                                   <div className="p-8 flex flex-col justify-center">
                                        <div className="mb-8">
                                             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Recommended Size</h3>
                                             <div className="text-5xl font-extrabold text-gray-900">{result.recommended_size}</div>
                                             <div className="flex items-center mt-2">
                                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                       <div className="h-full bg-green-500 rounded-full" style={{ width: `${(result.confidence || 0) * 100}%` }}></div>
                                                  </div>
                                                  <span className="ml-3 text-sm text-gray-600 font-medium">{Math.round((result.confidence || 0) * 100)}% Confidence</span>
                                             </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                             <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Your Measurements</h4>
                                             {result.measurements && Object.entries(result.measurements).map(([key, val]) => (
                                                  <div key={key} className="flex justify-between items-center group">
                                                       <span className="text-gray-600 capitalize group-hover:text-teal-600 transition-colors">
                                                            {key.replace('_width_cm', '').replace('_cm', '').replace(/_/g, ' ')}
                                                       </span>
                                                       <span className="font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100">{val} cm</span>
                                                  </div>
                                             ))}
                                        </div>

                                        {result.notes && (
                                             <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl mb-8">
                                                  <p className="text-sm text-yellow-800 flex">
                                                       <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                       {result.notes}
                                                  </p>
                                             </div>
                                        )}

                                        <button
                                             onClick={handleReset}
                                             className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                        >
                                             Try Another Photo
                                        </button>
                                   </div>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     )
}
