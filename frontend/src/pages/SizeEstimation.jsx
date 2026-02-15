// src/pages/SizeEstimation.jsx
import { useState, useRef, useMemo } from 'react';
import { Ruler, UploadCloud, Calculator, Image as ImageIcon, CheckCircle2, FileUp, X, RotateCcw } from 'lucide-react';

export default function SizeEstimation() {
     // --- Manual Entry State ---
     const [unit, setUnit] = useState('m'); // m, ft, cm
     const [mode, setMode] = useState('dimensions'); // 'dimensions' | 'area'

     // Dimensions inputs
     const [length, setLength] = useState('');
     const [width, setWidth] = useState('');
     const [height, setHeight] = useState('');

     // Direct area input
     const [manualArea, setManualArea] = useState('');

     // --- Photo Upload State ---
     const [selectedFile, setSelectedFile] = useState(null);
     const [previewUrl, setPreviewUrl] = useState(null);
     const [isDragOver, setIsDragOver] = useState(false);
     const fileInputRef = useRef(null);

     // --- Global State ---
     const [isLoading, setIsLoading] = useState(false);
     const [loadingType, setLoadingType] = useState(null); // 'manual' | 'photo'
     const [result, setResult] = useState(null); // { type, value, unit }

     // --- Constants ---
     const MAX_FILE_SIZE_MB = 10;
     const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
     const UNITS = {
          m: { label: 'Meters', suffix: 'm', areaSuffix: 'm²' },
          ft: { label: 'Feet', suffix: 'ft', areaSuffix: 'sq ft' },
          cm: { label: 'Centimeters', suffix: 'cm', areaSuffix: 'cm²' }
     };

     // --- Calculations ---
     const computedArea = useMemo(() => {
          if (mode === 'dimensions') {
               const l = parseFloat(length) || 0;
               const w = parseFloat(width) || 0;
               return l > 0 && w > 0 ? (l * w).toFixed(2) : null;
          }
          return parseFloat(manualArea) || null;
     }, [length, width, manualArea, mode]);

     const computedVolume = useMemo(() => {
          if (mode === 'dimensions') {
               const l = parseFloat(length) || 0;
               const w = parseFloat(width) || 0;
               const h = parseFloat(height) || 0;
               return l > 0 && w > 0 && h > 0 ? (l * w * h).toFixed(2) : null;
          }
          return null;
     }, [length, width, height, mode]);

     // --- Manual Handlers ---
     const handleManualSubmit = () => {
          if (!computedArea) return;

          setIsLoading(true);
          setLoadingType('manual');
          setResult(null);

          // Fake API delay
          setTimeout(() => {
               setIsLoading(false);
               setLoadingType(null);
               setResult({
                    type: 'manual',
                    area: computedArea,
                    volume: computedVolume,
                    unit: UNITS[unit]
               });
               // Scroll to result if needed or show toast
               // For this demo, we'll just show the result inline
          }, 1200);
     };

     const resetManual = () => {
          setLength('');
          setWidth('');
          setHeight('');
          setManualArea('');
          setResult(null);
     };

     // --- File Upload Handlers ---
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

          // Clean up old preview
          if (previewUrl) URL.revokeObjectURL(previewUrl);

          setSelectedFile(file);
          const objectUrl = URL.createObjectURL(file);
          setPreviewUrl(objectUrl);
          setResult(null);
     };

     const handleFileChange = (e) => {
          const file = e.target.files[0];
          validateAndSetFile(file);
     };

     const handleDragOver = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
     };

     const handleDragLeave = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
     };

     const handleDrop = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          const file = e.dataTransfer.files[0];
          validateAndSetFile(file);
     };

     const clearFile = () => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setSelectedFile(null);
          setPreviewUrl(null);
          setResult(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
     };

     const handlePhotoSubmit = () => {
          if (!selectedFile) return;

          setIsLoading(true);
          setLoadingType('photo');
          setResult(null);

          // Fake API delay
          setTimeout(() => {
               setIsLoading(false);
               setLoadingType(null);
               // Mock result from AI analysis
               setResult({
                    type: 'photo',
                    area: '24.5', // Fake estimated value
                    unit: UNITS.m,
                    confidence: '85%'
               });
          }, 1500);
     };

     // --- Derived ---
     const isDimensionsValid = mode === 'dimensions' && length && width;
     const isAreaValid = mode === 'area' && manualArea;
     const canSubmitManual = (isDimensionsValid || isAreaValid) && !isLoading;
     const canSubmitPhoto = selectedFile && !isLoading;

     return (
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
               <div className="max-w-6xl mx-auto space-y-10">

                    {/* Header / Hero */}
                    <div className="text-center space-y-3 pb-4">
                         <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 shadow-sm">
                              <Ruler className="w-8 h-8" />
                         </div>
                         <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                              Estimate Project Size
                         </h1>
                         <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                              Enter dimensions manually or upload a photo of your space to get precise size estimations.
                         </p>
                    </div>

                    {/* Start Main Grid */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">

                         {/* Card 1: Manual Calculation */}
                         <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-md transition-shadow duration-300 relative z-10">
                              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                   <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                        <Calculator className="w-6 h-6" />
                                   </div>
                                   <div>
                                        <h2 className="text-xl font-bold text-gray-900">Manual Entry</h2>
                                        <p className="text-sm text-gray-500">Calculate area & volume</p>
                                   </div>
                              </div>

                              <div className="space-y-6">
                                   {/* Unit Selection */}
                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measurement</label>
                                        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                             {Object.keys(UNITS).map((u) => (
                                                  <button
                                                       key={u}
                                                       onClick={() => setUnit(u)}
                                                       className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${unit === u
                                                                 ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                                                                 : 'text-gray-500 hover:text-gray-900'
                                                            }`}
                                                  >
                                                       {UNITS[u].label} ({UNITS[u].suffix})
                                                  </button>
                                             ))}
                                        </div>
                                   </div>

                                   {/* Mode Toggle */}
                                   <div className="flex space-x-6 text-sm">
                                        <label className="inline-flex items-center cursor-pointer group">
                                             <input
                                                  type="radio"
                                                  className="form-radio text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-gray-300"
                                                  name="mode"
                                                  checked={mode === 'dimensions'}
                                                  onChange={() => setMode('dimensions')}
                                             />
                                             <span className="ml-2 font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">By Dimensions</span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer group">
                                             <input
                                                  type="radio"
                                                  className="form-radio text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-gray-300"
                                                  name="mode"
                                                  checked={mode === 'area'}
                                                  onChange={() => setMode('area')}
                                             />
                                             <span className="ml-2 font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Total Area</span>
                                        </label>
                                   </div>

                                   {/* Inputs */}
                                   <div className="space-y-4">
                                        {mode === 'dimensions' ? (
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div className="col-span-1">
                                                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Length</label>
                                                       <div className="relative">
                                                            <input
                                                                 type="number"
                                                                 value={length}
                                                                 onChange={(e) => setLength(e.target.value)}
                                                                 placeholder="0"
                                                                 min="0"
                                                                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                            />
                                                            <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">{UNITS[unit].suffix}</span>
                                                       </div>
                                                  </div>
                                                  <div className="col-span-1">
                                                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Width</label>
                                                       <div className="relative">
                                                            <input
                                                                 type="number"
                                                                 value={width}
                                                                 onChange={(e) => setWidth(e.target.value)}
                                                                 placeholder="0"
                                                                 min="0"
                                                                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                            />
                                                            <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">{UNITS[unit].suffix}</span>
                                                       </div>
                                                  </div>
                                                  <div className="col-span-2">
                                                       <label className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                                            <span>Height</span>
                                                            <span className="text-gray-400 font-normal normal-case tracking-normal">(Optional)</span>
                                                       </label>
                                                       <div className="relative">
                                                            <input
                                                                 type="number"
                                                                 value={height}
                                                                 onChange={(e) => setHeight(e.target.value)}
                                                                 placeholder="0"
                                                                 min="0"
                                                                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                            />
                                                            <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">{UNITS[unit].suffix}</span>
                                                       </div>
                                                  </div>
                                             </div>
                                        ) : (
                                             <div>
                                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Area</label>
                                                  <div className="relative">
                                                       <input
                                                            type="number"
                                                            value={manualArea}
                                                            onChange={(e) => setManualArea(e.target.value)}
                                                            placeholder="0"
                                                            min="0"
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                       />
                                                       <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">{UNITS[unit].areaSuffix}</span>
                                                  </div>
                                             </div>
                                        )}
                                   </div>

                                   {/* Live Preview / Result Card */}
                                   <div className={`rounded-xl p-4 transition-all duration-300 ${result?.type === 'manual' ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
                                        {!result ? (
                                             <div className="flex justify-between items-center text-gray-500">
                                                  <span className="text-sm font-medium">Estimated Area:</span>
                                                  <span className="text-lg font-bold text-gray-700">
                                                       {computedArea ? computedArea : '--'} <span className="text-sm font-normal text-gray-500">{UNITS[unit].areaSuffix}</span>
                                                  </span>
                                             </div>
                                        ) : (
                                             <div className="space-y-1 animate-fadeIn">
                                                  <div className="flex items-center text-emerald-700 font-medium mb-2">
                                                       <CheckCircle2 className="w-5 h-5 mr-2" />
                                                       Calculation Complete
                                                  </div>
                                                  <div className="flex justify-between items-end border-b border-emerald-100 pb-2 mb-2">
                                                       <span className="text-emerald-800 text-sm">Area</span>
                                                       <span className="text-2xl font-bold text-emerald-900">{result.area} <span className="text-base font-medium">{result.unit.areaSuffix}</span></span>
                                                  </div>
                                                  {result.volume && (
                                                       <div className="flex justify-between items-end">
                                                            <span className="text-emerald-800 text-sm">Volume</span>
                                                            <span className="text-lg font-bold text-emerald-900">{result.volume} <span className="text-sm font-medium">{result.unit.suffix}³</span></span>
                                                       </div>
                                                  )}
                                             </div>
                                        )}
                                   </div>
                              </div>

                              <div className="mt-8">
                                   <button
                                        onClick={handleManualSubmit}
                                        disabled={!canSubmitManual}
                                        className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-semibold shadow-sm transition-all duration-200
                  ${!canSubmitManual
                                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:transform active:scale-[0.98]'
                                             }
                `}
                                   >
                                        {loadingType === 'manual' ? (
                                             <>
                                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                  <span>Calculating...</span>
                                             </>
                                        ) : (
                                             <>
                                                  <span>Estimate from Manual Input</span>
                                                  <span className="text-indigo-200">→</span>
                                             </>
                                        )}
                                   </button>

                                   {result?.type === 'manual' && (
                                        <button onClick={resetManual} className="w-full mt-3 text-sm text-gray-400 hover:text-indigo-600 flex items-center justify-center">
                                             <RotateCcw className="w-3 h-3 mr-1" /> Reset
                                        </button>
                                   )}
                              </div>
                         </div>

                         {/* Divider with OR */}
                         <div className="relative flex items-center justify-center lg:flex-col lg:w-0 w-full py-4 lg:py-0 self-stretch z-0">
                              <div className="absolute inset-0 flex items-center lg:flex-col lg:justify-center" aria-hidden="true">
                                   <div className="w-full h-px lg:w-px lg:h-full bg-gray-200"></div>
                              </div>
                              <div className="relative z-10 bg-gray-50 px-3 py-1 lg:py-3">
                                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">Or</span>
                              </div>
                         </div>


                         {/* Card 2: Photo Upload */}
                         <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-md transition-shadow duration-300 flex flex-col relative z-10">
                              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                   <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                                        <ImageIcon className="w-6 h-6" />
                                   </div>
                                   <div>
                                        <h2 className="text-xl font-bold text-gray-900">Upload Photo</h2>
                                        <p className="text-sm text-gray-500">Auto-estimate from plan or image</p>
                                   </div>
                              </div>

                              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                   Upload a floor plan, site photo, or room picture. Our AI will analyze objects to estimate dimensions.
                                   <br /><span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Pro tip: Include a known object (e.g. door) for scale.</span>
                              </p>

                              <div className="flex-1 flex flex-col">
                                   {!previewUrl ? (
                                        <div
                                             className={`flex-1 min-h-[14rem] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer relative overflow-hidden
                    ${isDragOver
                                                       ? 'border-emerald-500 bg-emerald-50'
                                                       : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
                                                  }
                    ${isLoading ? 'opacity-50 pointer-events-none' : ''}
                  `}
                                             onDragOver={handleDragOver}
                                             onDragLeave={handleDragLeave}
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
                                             <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragOver ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                  <UploadCloud className="w-8 h-8" />
                                             </div>
                                             <p className="text-base font-semibold text-gray-900 mb-1">Click to upload or drag & drop</p>
                                             <p className="text-xs text-gray-500">JPG, PNG, WebP up to {MAX_FILE_SIZE_MB}MB</p>
                                        </div>
                                   ) : (
                                        <div className="flex-1 relative min-h-[14rem] rounded-xl overflow-hidden bg-gray-900 group shadow-inner">
                                             <img
                                                  src={previewUrl}
                                                  alt="Preview"
                                                  className="w-full h-full object-contain bg-gray-900/50 backdrop-blur-sm"
                                             />

                                             {/* Result Overlay */}
                                             {result?.type === 'photo' && (
                                                  <div className="absolute inset-0 z-20 bg-green-900/40 backdrop-blur-sm flex items-center justify-center">
                                                       <div className="bg-white rounded-2xl p-6 shadow-2xl transform scale-100 animate-fadeIn text-center max-w-[80%]">
                                                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                 <CheckCircle2 className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Estimation Ready!</h3>
                                                            <div className="text-3xl font-extrabold text-emerald-600 my-2">~{result.area} {result.unit.areaSuffix}</div>
                                                            <p className="text-xs text-gray-500">Confidence: {result.confidence}</p>
                                                            <button onClick={clearFile} className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-900">Try another photo</button>
                                                       </div>
                                                  </div>
                                             )}

                                             {/* Close button */}
                                             {!result && (
                                                  <button
                                                       onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                                       className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors z-10"
                                                  >
                                                       <X className="w-4 h-4" />
                                                  </button>
                                             )}

                                             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                                  <p className="text-white text-xs truncate max-w-full font-medium flex items-center">
                                                       <FileUp className="w-3 h-3 mr-2 opacity-75" />
                                                       {selectedFile?.name}
                                                  </p>
                                             </div>
                                        </div>
                                   )}
                              </div>

                              <div className="mt-8">
                                   <button
                                        onClick={handlePhotoSubmit}
                                        disabled={!canSubmitPhoto || result?.type === 'photo'}
                                        className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-semibold shadow-sm transition-all duration-200
                  ${!canSubmitPhoto || result?.type === 'photo'
                                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 active:transform active:scale-[0.98]'
                                             }
                `}
                                   >
                                        {loadingType === 'photo' ? (
                                             <>
                                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                  <span>Analyzing Image...</span>
                                             </>
                                        ) : result?.type === 'photo' ? (
                                             <>
                                                  <span>Analysis Complete</span>
                                                  <CheckCircle2 className="w-5 h-5" />
                                             </>
                                        ) : (
                                             <>
                                                  <span>Estimate Size from Photo</span>
                                                  <span className="text-emerald-200">→</span>
                                             </>
                                        )}
                                   </button>
                              </div>
                         </div>

                    </div>
               </div>
          </div>
     );
}
