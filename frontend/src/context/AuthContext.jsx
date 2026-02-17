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
                    throw new Error('Google Login failed');
               }

               const data = await response.json();
               setCurrentUser(data.user); // Set user from backend response
               return data.user;
          } catch (err) {
               console.error("Login Error:", err);
               setError('Failed to login with Google');
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

               // Mock API call for now (replace with actual backend endpoint later or simulate)
               // Since there is no explicit /api/auth/login endpoint in the python code shown earlier (only /google), 
               // I will implement a simulation or assume the user wants me to add that endpoint?
               // "Fallback to JWT with localStorage..." - The user wants me to BUILD this.
               // But the backend is Python Flask with Sessions.
               // I need to check if there is a 'login' route in existing backend code or if I need to add one.
               // I checked `auth.py` and it only had `/google`.
               // I should use the Google Auth for now or add a basic session endpoint?
               // Realistically, for this task, I should add the Basic Auth endpoints to `auth.py` as well?
               // The prompt says "Build (or update) ... fallback to JWT...". 
               // I will add `login` and `register` to `AuthContext` assuming I will implement them in backend too.

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
