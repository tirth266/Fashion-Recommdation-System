import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = "737685649419-2b6lgqusjcrqdusipt5o8ngn1orpdodr.apps.googleusercontent.com";

export default function GoogleLoginButton() {
     const { loginWithGoogle } = useAuth();
     const navigate = useNavigate();
     const buttonRef = useRef(null);

     useEffect(() => {
          // Load Google Script if not already loaded
          const script = document.createElement('script');
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);

          script.onload = () => {
               if (window.google) {
                    window.google.accounts.id.initialize({
                         client_id: GOOGLE_CLIENT_ID,
                         callback: handleCredentialResponse
                    });

                    // Render the button
                    window.google.accounts.id.renderButton(
                         buttonRef.current,
                         { theme: "outline", size: "large", text: "continue_with", shape: "pill", width: "100%" }
                    );
               }
          };

          return () => {
               // Cleanup script? Usually not necessary for single page apps 
               // but we might want to avoid duplicates
          }
     }, []);

     const handleCredentialResponse = async (response) => {
          console.log("Encoded JWT ID token: " + response.credential);
          try {
               const success = await loginWithGoogle(response.credential);
               if (success) {
                    navigate('/recommendations');
               } else {
                    console.error("Login failed in handleCredentialResponse");
               }
          } catch (err) {
               console.error("Exception in handleCredentialResponse:", err);
          }
     };

     return (
          <div className="w-full flex justify-center">
               <div ref={buttonRef} className="w-full"></div>
               {/* Fallback styling/loading if script delays */}
          </div>
     );
}
