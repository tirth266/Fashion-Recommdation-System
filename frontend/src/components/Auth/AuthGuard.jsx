import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';

export default function AuthGuard({ children }) {
     const { currentUser, loading } = useAuth();
     const navigate = useNavigate();
     const location = useLocation();
     const [showModal, setShowModal] = useState(false);

     useEffect(() => {
          if (!loading && !currentUser) {
               setShowModal(true);
          }
     }, [currentUser, loading]);

     const handleClose = () => {
          setShowModal(false);
          // If the user dismisses the Login modal on a protected route, 
          // they should be redirected to a safe page (Home) 
          // because they cannot view the protected content.
          navigate('/', { replace: true });
     };

     if (loading) {
          return (
               <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
               </div>
          );
     }

     if (currentUser) {
          return children;
     }

     return (
          <div className="min-h-screen bg-gray-50 dark:bg-black p-8">
               <div className="max-w-7xl mx-auto opacity-20 filter blur-sm pointer-events-none select-none">
                    {/* Placeholder content to give the 'gated' feel? 
                    Or just blank. Let's make it look like they *almost* got there.
                */}
                    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
                         <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
                         <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
                    </div>
               </div>

               <AuthModal
                    isOpen={showModal}
                    onClose={handleClose}
                    initialMode="register"
                    onSuccess={() => setShowModal(false)}
               />
          </div>
     );
}
