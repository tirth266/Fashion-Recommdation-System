// src/pages/GetRecommendation.jsx
import { useState, useRef } from 'react';

export default function GetRecommendation() {
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null); // 'text' or 'image'
  const fileInputRef = useRef(null);

  // Constants
  const MIN_TEXT_LENGTH = 20;
  const MAX_TEXT_LENGTH = 1500;
  const MAX_FILE_SIZE_MB = 8;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  // Handlers for Text
  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (textInput.length < MIN_TEXT_LENGTH) return;

    setIsLoading(true);
    setLoadingType('text');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLoadingType(null);
      alert(`Success! Searching for projects matching: "${textInput.substring(0, 30)}..."`);
      // In a real app, you would navigate to results page here
    }, 1500);
  };

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
    if (!selectedFile) return;

    setIsLoading(true);
    setLoadingType('image');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLoadingType(null);
      alert(`Success! Analyzing image: ${selectedFile.name}`);
      // In a real app, you would navigate to results page here
    }, 1500);
  };

  // Derived state
  const isTextValid = textInput.length >= MIN_TEXT_LENGTH;
  const isImageReady = !!selectedFile;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Find similar projects
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Describe your idea in text or upload an image to get relevant recommendations.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
          
          {/* Card 1: Text Description */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300 flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Text description</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Write what kind of project, features, style, or technologies you're looking for.
            </p>

            <div className="flex-1 flex flex-col relative">
              <textarea
                className="w-full flex-1 min-h-[12rem] lg:min-h-[16rem] p-4 text-gray-700 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none outline-none text-base leading-relaxed"
                placeholder="e.g. A minimalist e-commerce dashboard with dark mode support, built using React and Tailwind CSS..."
                value={textInput}
                onChange={handleTextChange}
                maxLength={MAX_TEXT_LENGTH}
                disabled={isLoading}
              />
              <div className={`absolute bottom-3 right-3 text-xs font-medium ${textInput.length >= MAX_TEXT_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                {textInput.length}/{MAX_TEXT_LENGTH}
              </div>
            </div>

            <button
              onClick={handleTextSubmit}
              disabled={!isTextValid || isLoading}
              className={`mt-8 w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-sm transition-all duration-200 flex items-center justify-center space-x-2
                ${!isTextValid || isLoading 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
              {loadingType === 'text' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Get Recommendations</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
            
            {/* Validation Message */}
            {!isTextValid && textInput.length > 0 && (
              <p className="mt-2 text-sm text-amber-600 text-center">
                Please enter at least {MIN_TEXT_LENGTH} characters.
              </p>
            )}
          </div>

          {/* Divider (Desktop) / Spacer (Mobile) */}
          <div className="relative flex items-center justify-center lg:flex-col lg:w-0">
            <div className="absolute inset-0 flex items-center lg:flex-col" aria-hidden="true">
              <div className="w-full h-px lg:w-px lg:h-full bg-gray-200"></div>
            </div>
            <div className="relative bg-gray-50 px-4 py-2 lg:px-2 lg:py-4">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-widest bg-gray-50 p-2">Or</span>
            </div>
          </div>

          {/* Card 2: Image Upload */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300 flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Upload reference image</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Upload a screenshot, moodboard, or sketch to find projects with a similar visual style.
            </p>

            <div className="flex-1 flex flex-col">
              {!previewUrl ? (
                <div
                  className={`flex-1 min-h-[12rem] lg:min-h-[16rem] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer
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
                <div className="flex-1 relative min-h-[12rem] lg:min-h-[16rem] rounded-xl overflow-hidden bg-gray-100 group">
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
              disabled={!isImageReady || isLoading}
              className={`mt-8 w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-sm transition-all duration-200 flex items-center justify-center space-x-2
                ${!isImageReady || isLoading 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
              {loadingType === 'image' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Get Recommendations from Image</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
            
            {/* Spacing holder for alignment if needed, or error message place */}
             {!isImageReady && (
              <p className="mt-2 text-sm text-gray-400 text-center opacity-0 select-none">
                Placeholder for alignment
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
