import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function GoogleLoginButton() {
     const { loginWithGoogle, setError } = useAuth();

     const handleSuccess = async (credentialResponse) => {
          console.log("Google Login Success: token received");
          try {
               const user = await loginWithGoogle(credentialResponse.credential);
               if (!user) {
                    console.error("Login failed after Google success - no user returned");
               }
               // Navigation is handled by Login.jsx's useEffect when currentUser changes
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
