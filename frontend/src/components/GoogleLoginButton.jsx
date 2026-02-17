import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton() {
     const { loginWithGoogle, setError } = useAuth();
     const navigate = useNavigate();

     const handleSuccess = async (credentialResponse) => {
          console.log("Google Login Success:", credentialResponse);
          try {
               const user = await loginWithGoogle(credentialResponse.credential);
               if (user) {
                    const stored = sessionStorage.getItem('intendedDestination');
                    const target = stored || '/profile';
                    sessionStorage.removeItem('intendedDestination');
                    navigate(target);
               } else {
                    console.error("Login failed after Google success");
                    // Error is already set inside loginWithGoogle
               }
          } catch (err) {
               console.error("Exception in handleSuccess:", err);
               setError('An unexpected error occurred during login. Please try again.');
          }
     };

     const handleError = () => {
          console.error("Google Login Failed");
          setError('Google Login failed. Please check your internet connection or disable ad blockers.');
     };

     return (
          <div className="w-full flex justify-center">
               <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    theme="outline"
                    size="large"
                    shape="pill"
               />
          </div>
     );
}
