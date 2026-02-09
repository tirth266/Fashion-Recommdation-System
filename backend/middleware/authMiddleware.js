const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
     const authHeader = req.headers.authorization;

     if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ message: 'Authorization header missing or invalid' });
     }

     const token = authHeader.split(' ')[1];

     try {
          const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
          const decoded = jwt.verify(token, jwtSecret);

          req.user = decoded;
          next();
     } catch (error) {
          console.error('JWT Verification Error:', error.message);
          return res.status(401).json({ message: 'Invalid or expired token' });
     }
};

module.exports = authMiddleware;
