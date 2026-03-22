import { useState, useRef } from 'react';
import MainLayout from '../components/MainLayout';

export default function SizeEstimationPage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert("Please upload a JPG, JPEG, or PNG image.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResults(null); 
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResults(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEstimateSize = async () => {
    if (!imageFile) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/size-estimation', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setResults({
          bodyType: data.body_type || 'Unknown',
          heightEstimate: data.height_estimate || 'Unknown',
          shoulderWidth: data.shoulder_width || 'Unknown',
          recommendedSize: data.recommended_size || 'Unknown'
        });
      } else {
        alert(data.error || 'Failed to estimate size.');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      alert(`Error computing size estimation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="px-6 lg:px-8 py-12 max-w-7xl mx-auto animate-fade-in min-h-[80vh]">
        <div className="bg-white dark:bg-gray-800/80 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:p-12">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              AI Size Estimation
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload a full body photo and our AI model will estimate your clothing size.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl p-16 cursor-pointer hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex flex-col items-center justify-center"
              >
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Click to upload photo</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Accepts JPG, JPEG, PNG</p>
              </div>
            ) : (
              <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
                <div className="relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-3/4 max-h-[60vh] max-w-sm mx-auto shadow-inner border border-gray-200 dark:border-gray-700">
                  <img src={imagePreview} alt="Upload preview" className="w-full h-full object-contain" />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors border border-transparent flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Replace Image
                  </button>
                  <button 
                    onClick={handleRemoveImage}
                    className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-xl font-medium transition-colors border border-transparent flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Remove
                  </button>
                </div>

                {!results && (
                  <button
                    onClick={handleEstimateSize}
                    disabled={loading}
                    className={`w-full py-4 text-white dark:text-black text-lg font-bold rounded-2xl shadow-lg transition-transform flex items-center justify-center ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Body Proportions...
                      </>
                    ) : (
                      "Estimate My Size"
                    )}
                  </button>
                )}
              </div>
            )}
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept="image/jpeg, image/jpg, image/png"/>
          </div>

          {/* RESULTS UI */}
          {results && (
            <div className="mt-16 animate-fade-in border-t border-gray-100 dark:border-gray-700 pt-16">
              
              <div className="max-w-3xl mx-auto">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-[2rem] p-8 md:p-12 border border-purple-100 dark:border-purple-800 shadow-lg flex flex-col justify-center transition-colors">
                  <div className="text-center mb-8">
                     <h3 className="text-3xl font-bold font-serif text-purple-900 dark:text-purple-100">Analysis Results</h3>
                     <p className="text-purple-700 dark:text-purple-300 mt-2">Based on our deeply trained AI estimation model.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-purple-200 dark:border-purple-800/50">
                      <span className="text-purple-700 dark:text-purple-300 font-medium text-lg">Body Type</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-purple-800/80 px-5 py-2 rounded-full shadow-sm">{results.bodyType}</span>
                    </div>

                    <div className="flex justify-between items-center pb-4 border-b border-purple-200 dark:border-purple-800/50">
                      <span className="text-purple-700 dark:text-purple-300 font-medium text-lg">Estimated Height</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{results.heightEstimate}</span>
                    </div>

                    <div className="flex justify-between items-center pb-6 border-b border-purple-200 dark:border-purple-800/50">
                      <span className="text-purple-700 dark:text-purple-300 font-medium text-lg">Shoulder Width</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{results.shoulderWidth}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white dark:bg-purple-800 p-6 rounded-3xl shadow-md border border-purple-100 dark:border-purple-700 mt-4 outline outline-2 outline-offset-4 outline-purple-400 dark:outline-purple-500">
                      <span className="text-purple-900 dark:text-purple-50 font-bold text-xl uppercase tracking-wider">Recommended Size</span>
                      <span className="text-5xl font-black text-purple-600 dark:text-white">{results.recommendedSize}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
