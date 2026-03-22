import { useState, useRef } from 'react';
import MainLayout from '../components/MainLayout';

export default function RecommendationPage() {
  const [recImagePreview, setRecImagePreview] = useState(null);
  const [recImageFile, setRecImageFile] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recResults, setRecResults] = useState(null);
  const recFileInputRef = useRef(null);

  const handleRecFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      alert("Please upload a JPG, JPEG, or PNG image.");
      return;
    }
    setRecImageFile(file);
    setRecImagePreview(URL.createObjectURL(file));
    setRecResults(null); 
  };

  const handleRemoveRecImage = () => {
    setRecImageFile(null);
    setRecImagePreview(null);
    setRecResults(null);
    if(recFileInputRef.current) recFileInputRef.current.value = '';
  };

  const handleAnalyzeRec = async () => {
    if (!recImageFile) return;
    setRecLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', recImageFile);

      const response = await fetch('/api/recommend', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        const imagesList = Array.isArray(data.recommended_products) ? data.recommended_products : [];
        setRecResults({
          size: data.recommended_size || 'M',
          bodyShape: data.body_type || 'Athletic',
          products: imagesList
        });
      } else {
        alert(data.error || 'Failed to get recommendations.');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      alert(`Error computing recommendation: ${err.message}`);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="px-6 lg:px-8 py-12 max-w-7xl mx-auto animate-fade-in min-h-[80vh]">
        <div className="bg-white dark:bg-gray-800/80 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:p-12">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              AI Style Recommendation
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload a photo to receive personalized clothing recommendations.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            {!recImagePreview ? (
              <div 
                onClick={() => recFileInputRef.current?.click()}
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
                  <img src={recImagePreview} alt="Upload preview" className="w-full h-full object-contain" />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => recFileInputRef.current?.click()}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors border border-transparent flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Change Image
                  </button>
                  <button 
                    onClick={handleRemoveRecImage}
                    className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-xl font-medium transition-colors border border-transparent flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Remove
                  </button>
                </div>

                {!recResults && (
                  <button
                    onClick={handleAnalyzeRec}
                    disabled={recLoading}
                    className={`w-full py-4 text-white dark:text-black text-lg font-bold rounded-2xl shadow-lg transition-transform flex items-center justify-center ${recLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95'}`}
                  >
                    {recLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Image...
                      </>
                    ) : (
                      "Analyze & Get Recommendation"
                    )}
                  </button>
                )}
              </div>
            )}
            <input type="file" className="hidden" ref={recFileInputRef} onChange={handleRecFileSelect} accept="image/jpeg, image/jpg, image/png"/>
          </div>

          {/* RESULTS UI */}
          {recResults && (
            <div className="mt-16 animate-fade-in border-t border-gray-100 dark:border-gray-700 pt-16">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {/* Body Analysis Card */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-3xl p-8 border border-purple-100 dark:border-purple-800 shadow-sm flex flex-col justify-center transition-colors">
                  <h3 className="text-2xl font-bold font-serif text-purple-900 dark:text-purple-100 mb-6">Body Analysis Card</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-purple-200 dark:border-purple-800">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">Body Type</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-purple-800/80 px-4 py-1.5 rounded-full shadow-sm">{recResults.bodyShape}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">Recommended Size</span>
                      <span className="text-2xl font-black text-purple-900 dark:text-white">{recResults.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                    Based on our AI's analysis, we have assembled the perfect collection of outfits that match your exact parameters. Explore the recommended products below.
                  </p>
                </div>
              </div>

              {/* Display Recommended Products Grid */}
              <h3 className="text-3xl font-serif font-bold mb-8 dark:text-white text-center">Recommended Products</h3>
              
              {recResults.products?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                   {recResults.products.map((item, i) => (
                    <div key={i} className="group cursor-pointer relative bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                        <img 
                          src={item.image || item.url || item.image_url} 
                          alt={item.name || `Recommendation ${i}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop';
                          }}
                        />

                        {/* Size Badge */}
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm text-white border border-white/20">
                          Size {item.size || recResults.size}
                        </div>

                        {/* Overlay -> View Button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button className="bg-white text-black px-6 py-2.5 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:scale-105">
                            View Product
                          </button>
                        </div>
                      </div>
                      <div className="px-1 pb-2">
                        <h3 className="font-serif text-lg font-bold text-primary dark:text-white line-clamp-1">{item.name || 'Curated Style Item'}</h3>
                        <p className="text-secondary text-xs uppercase tracking-wider mt-1.5 dark:text-gray-400 font-medium">AI Match</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                  Our AI couldn't find exact matches for your profile at this moment. You can try exploring the trending items below!
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
