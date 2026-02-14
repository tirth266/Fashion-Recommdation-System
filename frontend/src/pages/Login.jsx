import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Login() {
     const { currentUser, error } = useAuth();
     const navigate = useNavigate();
     const [step, setStep] = useState(1);

     // Form State
     const [formData, setFormData] = useState({
          gender: 'female',
          favoriteColor: '#000000',
          chest: '',
          shoulder: '',
          wrist: '',
          height: '',
          weight: '',
          brands: []
     });

     useEffect(() => {
          if (currentUser) {
               // If user is already logged in, check if they need to complete onboarding (Step 2)
               // For now, we'll just redirect to recommendations if they are done
               // You might want to add logic here to check a 'profile.completed_onboarding' flag
               navigate('/recommendations');
          }
     }, [currentUser, navigate]);

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     const handleColorSelect = (color) => {
          setFormData(prev => ({ ...prev, favoriteColor: color }));
     };

     const handleNext = () => {
          setStep(2);
     };

     const handleComplete = async () => {
          // Here you would typically save the extended profile data to your backend
          console.log("Onboarding Complete:", formData);
          // After saving, navigate to the main app
          navigate('/profile');
     };

     const colors = ['#000000', '#FFFFFF', '#F5F5DC', '#000080', '#556B2F', '#8B0000', '#FFC0CB', '#808080'];

     return (
          <div className="min-h-screen flex bg-white">
               {/* LEFT SIDE - HERO IMAGE */}
               <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
                    <img
                         src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                         alt="Fashion Model"
                         className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
                         <h1 className="text-5xl font-serif font-bold mb-4">Discover Your <br />Perfect Style</h1>
                         <p className="text-lg text-gray-200 max-w-md">Join our community and get personalized fashion recommendations tailored just for you.</p>
                    </div>
                    {/* Logo Overlay */}
                    <div className="absolute top-8 left-8">
                         <span className="text-2xl font-serif font-bold text-white tracking-widest">FASHION.AI</span>
                    </div>
               </div>

               {/* RIGHT SIDE - FORM AREA */}
               <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
                    <div className="max-w-md w-full space-y-8">

                         {/* Progress Indicator */}
                         <div className="flex items-center gap-2 mb-8">
                              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-black' : 'bg-gray-200'}`}></div>
                              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
                         </div>

                         <div className="text-center lg:text-left">
                              <h2 className="text-3xl font-bold text-gray-900">
                                   {step === 1 ? 'Welcome Back' : 'Get Your Perfect Fit'}
                              </h2>
                              <p className="mt-2 text-gray-600">
                                   {step === 1 ? 'Please enter your details to sign in.' : 'Help us find clothes that fit you perfectly.'}
                              </p>
                         </div>

                         {error && (
                              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 text-sm">
                                   {error}
                              </div>
                         )}

                         {/* STEP 1: LOGIN & BASIC DETAILS */}
                         {step === 1 && (
                              <div className="space-y-6">
                                   {/* Social Login */}
                                   <div className="w-full">
                                        <GoogleLoginButton />
                                   </div>

                                   <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                             <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                             <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                                        </div>
                                   </div>

                                   <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                                             <input type="email" required className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm" placeholder="you@example.com" />
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                             <input type="password" required className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm" placeholder="••••••••" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                                  <select
                                                       name="gender"
                                                       value={formData.gender}
                                                       onChange={handleInputChange}
                                                       className="block w-full rounded-xl border-gray-300 py-3 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm border"
                                                  >
                                                       <option value="female">Female</option>
                                                       <option value="male">Male</option>
                                                       <option value="other">Other</option>
                                                  </select>
                                             </div>
                                             <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Color</label>
                                                  <div className="flex items-center gap-2 h-[46px]">
                                                       {colors.slice(0, 5).map(c => (
                                                            <button
                                                                 key={c}
                                                                 type="button"
                                                                 onClick={() => handleColorSelect(c)}
                                                                 className={`w-6 h-6 rounded-full border border-gray-200 focus:outline-none transition-transform hover:scale-110 ${formData.favoriteColor === c ? 'ring-2 ring-offset-2 ring-black scale-110' : ''}`}
                                                                 style={{ backgroundColor: c }}
                                                            />
                                                       ))}
                                                  </div>
                                             </div>
                                        </div>

                                        <button
                                             type="submit"
                                             className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                             Next Step
                                             <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </button>
                                   </form>
                              </div>
                         )}

                         {/* STEP 2: MEASUREMENTS & ONBOARDING */}
                         {step === 2 && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                   <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>

                                        <div className="grid grid-cols-2 gap-6">
                                             <div>
                                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chest (cm)</label>
                                                  <input
                                                       type="number"
                                                       name="chest"
                                                       value={formData.chest}
                                                       onChange={handleInputChange}
                                                       placeholder="e.g. 90"
                                                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                                  />
                                             </div>
                                             <div>
                                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shoulder (cm)</label>
                                                  <input
                                                       type="number"
                                                       name="shoulder"
                                                       value={formData.shoulder}
                                                       onChange={handleInputChange}
                                                       placeholder="e.g. 40"
                                                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                                  />
                                             </div>
                                             <div>
                                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Wrist (cm)</label>
                                                  <input
                                                       type="number"
                                                       name="wrist"
                                                       value={formData.wrist}
                                                       onChange={handleInputChange}
                                                       placeholder="e.g. 16"
                                                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                                  />
                                             </div>
                                             <div>
                                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Height (cm)</label>
                                                  <input
                                                       type="number"
                                                       name="height"
                                                       value={formData.height}
                                                       onChange={handleInputChange}
                                                       placeholder="e.g. 175"
                                                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                                  />
                                             </div>
                                        </div>

                                        <div>
                                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Weight (kg) <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                                             <input
                                                  type="number"
                                                  name="weight"
                                                  value={formData.weight}
                                                  onChange={handleInputChange}
                                                  placeholder="e.g. 70"
                                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                             />
                                        </div>

                                        <div>
                                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Favorite Brands</label>
                                             <div className="flex flex-wrap gap-2">
                                                  {['Nike', 'Zara', 'H&M', 'Gucci', 'Adidas', 'Uniqlo'].map(brand => (
                                                       <button
                                                            key={brand}
                                                            type="button"
                                                            onClick={() => {
                                                                 setFormData(prev => {
                                                                      const brands = prev.brands.includes(brand)
                                                                           ? prev.brands.filter(b => b !== brand)
                                                                           : [...prev.brands, brand];
                                                                      return { ...prev, brands };
                                                                 });
                                                            }}
                                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${formData.brands.includes(brand)
                                                                 ? 'bg-black text-white border-black'
                                                                 : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                                                 }`}
                                                       >
                                                            {brand}
                                                       </button>
                                                  ))}
                                             </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                             <button
                                                  type="button"
                                                  onClick={() => setStep(1)}
                                                  className="flex-1 py-3.5 px-4 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                             >
                                                  Back
                                             </button>
                                             <button
                                                  type="submit"
                                                  className="flex-[2] py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                             >
                                                  Complete Setup
                                             </button>
                                        </div>
                                   </form>
                              </div>
                         )}

                    </div>
               </div>
          </div>
     );
}
