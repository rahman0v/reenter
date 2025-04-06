const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token and adds user data to request
 */
const auth = (req, res, next) => {
  // Get token from different possible sources
  const token = 
    req.header('x-auth-token') || 
    (req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null);

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No authentication token provided' 
    });
  }

  try {
    // Get JWT secret from environment with fallback
    const secret = process.env.JWT_SECRET || 'reenterSecretKey2025';
    
    // Verify token
    const decoded = jwt.verify(token, secret);
    
    // Set user data in request
    req.user = decoded.user;
    
    // Continue to next middleware or route handler
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    
    // Handle different JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please login again' 
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Please login again' 
      });
    }
    
    // Generic error
    res.status(401).json({ 
      success: false,
      message: 'Authentication failed. Please login again' 
    });
  }
};

module.exports = auth;