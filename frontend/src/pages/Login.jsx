import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Login() {
     const { currentUser, error } = useAuth();
     const navigate = useNavigate();

     useEffect(() => {
          if (currentUser) {
               navigate('/recommendations');
          }
     }, [currentUser, navigate]);

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
               <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center">
                         <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                         </div>
                         <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                              Welcome Back
                         </h2>
                         <p className="mt-2 text-sm text-gray-600">
                              Sign in to access your fashion dashboard
                         </p>
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

                    <div className="mt-8 space-y-6">
                         <div className="flex justify-center">
                              <GoogleLoginButton />
                         </div>
                    </div>
               </div>
          </div>
     );
}
