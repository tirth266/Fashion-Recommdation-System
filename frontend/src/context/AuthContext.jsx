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
                    const response = await fetch('http://localhost:5000/api/auth/user', {
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
               const response = await fetch('http://localhost:5000/api/auth/google', {
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
               return true;
          } catch (err) {
               console.error("Login Error:", err);
               setError('Failed to login with Google');
               return false;
          } finally {
               setLoading(false);
          }
     }

     async function logout() {
          try {
               await fetch('http://localhost:5000/api/auth/logout', {
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
          loginWithGoogle,
          logout,
          loading,
          error
     };

     return (
          <AuthContext.Provider value={value}>
               {!loading && children}
          </AuthContext.Provider>
     );
}
