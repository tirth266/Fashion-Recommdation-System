const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
// detailed instructions: https://firebase.google.com/docs/admin/setup
try {
     // If SERVICE_ACCOUNT_KEY is provided in env (as base64 or path), use it.
     // For this demo, we'll try to use application default credentials or a placeholder.
     // In a real app, you would require('./serviceAccountKey.json')

     // NOTE: REPLACE THIS WITH YOUR ACTUAL SERVICE ACCOUNT CONFIGURATION
     // const serviceAccount = require('./serviceAccountKey.json');

     if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          admin.initializeApp({
               credential: admin.credential.cert(serviceAccount)
          });
          console.log('Firebase Admin Initialized with Service Account');
     } else {
          console.warn('WARNING: FIREBASE_SERVICE_ACCOUNT not found. Token verification will fail unless configured.');
          // Initialize with default application credentials if available on the system
          admin.initializeApp();
     }
} catch (error) {
     console.error('Firebase Admin Initialization Error:', error.message);
}

// Routes
app.post('/api/auth/google', async (req, res) => {
     const { token } = req.body;

     if (!token) {
          return res.status(400).json({ message: 'No token provided' });
     }

     try {
          // 1. Verify Google Token (Firebase ID Token)
          // If Admin SDK is not configured correctly, this will throw
          const decodedToken = await admin.auth().verifyIdToken(token);

          // 2. Extract User Info
          const { name, email, picture, uid } = decodedToken;

          // 3. Generate Backend JWT
          // We use a simple secret for this demo. In production, use a strong env var.
          const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

          const userPayload = {
               uid,
               name,
               email,
               picture
          };

          const jwtToken = jwt.sign(userPayload, jwtSecret, { expiresIn: '1h' });

          // 4. Return Token + User
          res.json({
               token: jwtToken,
               user: userPayload
          });

     } catch (error) {
          console.error('Auth Error:', error);

          // Fallback for demo purposes if backend is not fully configured with service account
          // This allows the UI flow to complete even if backend verification fails due to missing keys
          if (process.env.NODE_ENV !== 'production' && error.code === 'app/no-credential') {
               console.warn('DEMO MODE: Bylassing verification due to missing credentials');
               // Decode without verification just to extract data (NOT SECURE for production)
               const jwtDecode = require('jsonwebtoken').decode;
               const decoded = jwtDecode(token);

               if (decoded) {
                    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
                    const userPayload = {
                         uid: decoded.user_id || decoded.sub,
                         name: decoded.name,
                         email: decoded.email,
                         picture: decoded.picture
                    };
                    const jwtToken = jwt.sign(userPayload, jwtSecret, { expiresIn: '1h' });
                    return res.json({ token: jwtToken, user: userPayload });
               }
          }

          res.status(401).json({ message: 'Invalid token' });
     }
});

// Protected Route Example
const authMiddleware = require('./middleware/authMiddleware'); // will create next

app.get('/api/dashboard', authMiddleware, (req, res) => {
     res.json({ message: `Welcome to the dashboard, ${req.user.name}` });
});

app.get('/', (req, res) => {
     res.send('Fashion Recommendation Auth Server Running');
});

app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
});
