import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleLoginButton from '../GoogleLoginButton';

export default function AuthModal({ isOpen, onClose, initialMode = 'register', onSuccess }) {
     const [mode, setMode] = useState(initialMode); // 'login' or 'register'
     const { login, register, error, setError } = useAuth();
     const navigate = useNavigate();
     const location = useLocation();

     // Form States
     const [formData, setFormData] = useState({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
     });

     // Remember dismissal
     useEffect(() => {
          if (!isOpen) return;
          // Reset form on open
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
          setError('');
     }, [isOpen]);

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     const handleSubmit = async (e) => {
          e.preventDefault();

          if (mode === 'register') {
               if (formData.password !== formData.confirmPassword) {
                    setError("Passwords don't match");
                    return;
               }
               if (formData.password.length < 6) {
                    setError("Password must be at least 6 characters");
                    return;
               }
               const success = await register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
               });
               if (success) {
                    if (onSuccess) {
                         onSuccess();
                    } else {
                         // Determine redirect path (default to dashboard or current protected route)
                         const from = location.state?.from?.pathname || '/profile';
                         navigate(from, { replace: true });
                         onClose();
                    }
               }
          } else {
               const success = await login(formData.email, formData.password);
               if (success) {
                    if (onSuccess) {
                         onSuccess();
                    } else {
                         const from = location.state?.from?.pathname || '/profile';
                         navigate(from, { replace: true });
                         onClose();
                    }
               }
          }
     };

     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               {/* Backdrop */}
               <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
               ></div>

               {/* Modal Content */}
               <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100">

                    {/* Close Button */}
                    <button
                         onClick={onClose}
                         className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
                    >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                         </svg>
                    </button>

                    <div className="p-8">
                         {/* Header */}
                         <div className="text-center mb-8">
                              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                                   {mode === 'register' ? 'Join FashionAI' : 'Welcome Back'}
                              </h2>
                              <p className="text-gray-600 dark:text-gray-300">
                                   {mode === 'register'
                                        ? "Unlock personalized recommendations and find your perfect fit! ✨"
                                        : "Sign in to access your wardrobe and saved styles."}
                              </p>
                         </div>

                         {/* Social Login */}
                         <div className="mb-6">
                              <GoogleLoginButton />
                         </div>

                         <div className="relative mb-6">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                              <div className="relative flex justify-center text-sm">
                                   <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with email</span>
                              </div>
                         </div>

                         {/* Error Message */}
                         {error && (
                              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                   <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                   {error}
                              </div>
                         )}

                         {/* Form */}
                         <form onSubmit={handleSubmit} className="space-y-4">
                              {mode === 'register' && (
                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                                        <input
                                             type="text"
                                             name="username"
                                             value={formData.username}
                                             onChange={handleInputChange}
                                             className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                             placeholder="Fashionista"
                                        />
                                   </div>
                              )}

                              <div>
                                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                   <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="you@example.com"
                                   />
                              </div>

                              <div>
                                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                   <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                   />
                              </div>

                              {mode === 'register' && (
                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                        <input
                                             type="password"
                                             name="confirmPassword"
                                             value={formData.confirmPassword}
                                             onChange={handleInputChange}
                                             required
                                             className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                             placeholder="••••••••"
                                        />
                                   </div>
                              )}

                              <button
                                   type="submit"
                                   className="w-full py-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition-opacity shadow-lg"
                              >
                                   {mode === 'register' ? 'Create Account' : 'Sign In'}
                              </button>
                         </form>

                         {/* Footer / Toggle */}
                         <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                              {mode === 'register' ? (
                                   <>
                                        Already have an account?{' '}
                                        <button onClick={() => setMode('login')} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                             Log in
                                        </button>
                                   </>
                              ) : (
                                   <>
                                        Don't have an account?{' '}
                                        <button onClick={() => setMode('register')} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                             Sign up
                                        </button>
                                   </>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}
