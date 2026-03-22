import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to handle protected navigation
 * If user is not authenticated, redirects to login page
 * @param {string} destination - The route to navigate to
 * @returns {Function} navigateToProtected - Function to call with destination
 */
export function useProtectedNavigation() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const navigateToProtected = (destination, message = 'Please log in to access this feature.') => {
        if (!currentUser) {
            // Store intended destination
            sessionStorage.setItem('intendedDestination', destination);
            
            // Show notification
            alert(message);
            
            // Redirect to login
            navigate('/login');
            return false;
        }
        
        // User is authenticated, allow navigation
        navigate(destination);
        return true;
    };

    return navigateToProtected;
}
