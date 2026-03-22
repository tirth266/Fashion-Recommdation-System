import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
     return useContext(AuthContext);
}

export function AuthProvider({ children }) {
     const [currentUser, setCurrentUser] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');

     // Check valid session on mount
     useEffect(() => {
          async function checkSession() {
               try {
                    const response = await fetch('/api/auth/user', {
                         // Important: Include credentials to send cookies
                         credentials: 'include'
                    });
                    if (response.ok) {
                         const data = await response.json();
                         setCurrentUser(data.user);
                    } else {
                         setCurrentUser(null);
                    }
               } catch (err) {
                    console.error("Session Check Failed:", err);
               } finally {
                    setLoading(false);
               }
          }
          checkSession();
     }, []);

     async function loginWithGoogle(token) {
          setLoading(true);
          setError('');

          try {
               const response = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token }),
                    credentials: 'include'
               });


               if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Server Error Response:", errorText);
                    try {
                         const errorJson = JSON.parse(errorText);
                         throw new Error(errorJson.error || 'Google Login failed');
                    } catch (e) {
                         throw new Error(`Google Login failed: ${response.status} ${response.statusText}`);
                    }
               }

               const data = await response.json();
               setCurrentUser(data.user);
               
               // Verify session was properly set before returning
               await new Promise(resolve => setTimeout(resolve, 500));
               const verifyResponse = await fetch('/api/auth/user', {
                    credentials: 'include'
               });
               if (verifyResponse.ok) {
                    const verifyData = await verifyResponse.json();
                    setCurrentUser(verifyData.user);
               }
               
               return data.user;
          } catch (err) {
               console.error("Login Error:", err);
               setError(err.message);
               return false;
          } finally {
               setLoading(false);
          }
     }

     async function login(email, password) {
          setLoading(true);
          setError('');
          try {
               // Validate inputs
               if (!email || !password) throw new Error('Email and password are required');

               const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
               });

               if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Login failed');
               }

               const data = await response.json();
               setCurrentUser(data.user);
               
               // Verify session was properly set before returning
               await new Promise(resolve => setTimeout(resolve, 500));
               const verifyResponse = await fetch('/api/auth/user', {
                    credentials: 'include'
               });
               if (verifyResponse.ok) {
                    const verifyData = await verifyResponse.json();
                    setCurrentUser(verifyData.user);
               }
               
               return true;
          } catch (err) {
               console.error("Login Error:", err);
               setError(err.message);
               return false;
          } finally {
               setLoading(false);
          }
     }

     async function register(userData) {
          setLoading(true);
          setError('');
          try {
               const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData),
                    credentials: 'include'
               });

               if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Registration failed');
               }

               const data = await response.json();
               setCurrentUser(data.user);
               
               // Verify session was properly set before returning
               await new Promise(resolve => setTimeout(resolve, 500));
               const verifyResponse = await fetch('/api/auth/user', {
                    credentials: 'include'
               });
               if (verifyResponse.ok) {
                    const verifyData = await verifyResponse.json();
                    setCurrentUser(verifyData.user);
               }
               
               return true;
          } catch (err) {
               console.error("Registration Error:", err);
               setError(err.message);
               return false;
          } finally {
               setLoading(false);
          }
     }

     async function logout() {
          try {
               await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
               });
               setCurrentUser(null);
          } catch (err) {
               console.error("Logout Error:", err);
          }
     }

     const value = {
          currentUser,
          updateUser: setCurrentUser,
          loginWithGoogle,
          login,
          register,
          logout,
          loading,
          error,
          setError
     };

     return (
          <AuthContext.Provider value={value}>
               {!loading && children}
          </AuthContext.Provider>
     );
}
