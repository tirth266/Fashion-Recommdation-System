import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton() {
     const { loginWithGoogle } = useAuth();
     const navigate = useNavigate();

     const handleSuccess = async (credentialResponse) => {
          console.log("Google Login Success:", credentialResponse);
          try {
               const user = await loginWithGoogle(credentialResponse.credential);
               if (user) {
                    navigate('/profile');
               } else {
                    console.error("Login failed after Google success");
               }
          } catch (err) {
               console.error("Exception in handleSuccess:", err);
          }
     };

     const handleError = () => {
          console.error("Google Login Failed");
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
