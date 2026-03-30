// src/pages/GetRecommendation.jsx
import { useState, useRef } from 'react';

export default function GetRecommendation() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedImages, setRecommendedImages] = useState(null);
  const [gender, setGender] = useState('');
  const fileInputRef = useRef(null);

  // Constants
  const MAX_FILE_SIZE_MB = 8;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  // Handlers for Image
  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Invalid file type. Please upload a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSubmit = async () => {
    if (!selectedFile || !gender) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('gender', gender);

      const response = await fetch('/api/recommendations/recommend', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Recommendations received:', data);
        setRecommendedImages(data.recommended_images || []);
      } else if (response.status === 401) {
        alert('Unauthorized. Please sign in to get recommendations.');
        setRecommendedImages(null);
      } else {
        alert(`Error: ${data.error || 'Failed to get recommendations'}`);
        setRecommendedImages(null);
      }
    } catch (error) {
      console.error('Error calling API:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isImageReady = !!selectedFile;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-12">

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Get AI Recommendations
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Upload a fashion image to find similar items powered by our AI engine.
          </p>
        </div>

        {/* Image Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300 flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upload reference image</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Upload a photo of clothing or an outfit to find similar fashion items.
          </p>

          <div className="mb-6">
            <label htmlFor="gender-select" className="block text-sm font-semibold text-gray-900 mb-2">
              Your Gender (for accurate recommendations)
            </label>
            <select
              id="gender-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select Gender</option>
              <option value="Men">Male</option>
              <option value="Women">Female</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col">
            {!previewUrl ? (
              <div
                className={`flex-1 min-h-[14rem] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer
                  ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50 hover:border-emerald-400 border-gray-300'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp"
                />
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG, WebP up to {MAX_FILE_SIZE_MB}MB</p>
              </div>
            ) : (
              <div className="flex-1 relative min-h-[14rem] rounded-xl overflow-hidden bg-gray-100 group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={handleClearImage}
                    className="bg-white/90 text-red-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition-colors"
                    type="button"
                  >
                    Remove Image
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3">
                  <p className="text-white text-xs truncate text-center font-medium">
                    {selectedFile?.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleImageSubmit}
            disabled={!isImageReady || !gender || isLoading}
            className={`mt-8 w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-sm transition-all duration-200 flex items-center justify-center space-x-2
              ${!isImageReady || !gender || isLoading
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0'
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Get Recommendations</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {recommendedImages && recommendedImages.length > 0 && (
          <div className="mt-16 animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Similar Fashion Items Found!
              </h2>
              <p className="text-gray-600">
                We found {recommendedImages.length} similar items based on your image
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommendedImages.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={item.url}
                      alt={`Recommendation ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 truncate">
                      Similarity: {(item.similarity * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

