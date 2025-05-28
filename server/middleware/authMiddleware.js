import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect routes - checks for valid JWT
const protect = async (req, res, next) => {
  let token;

  // Read JWT from the httpOnly cookie
  token = req.cookies.token;

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      // The 'decoded.userId' comes from how we structured the token in generateToken.js
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        // Handle case where user belonging to token is not found (e.g., deleted user)
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to authorize based on roles
const authorize = (...roles) => { // Takes an array of allowed roles
  return (req, res, next) => {
    // This middleware should run after 'protect', so req.user should be available
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Not authorized, user role not found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this route. Allowed roles: ${roles.join(', ')}`,
      });
    }
    next(); // User has one of the allowed roles, proceed
  };
};

export { protect, authorize };
