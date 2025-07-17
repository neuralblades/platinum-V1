const jwt = require('jsonwebtoken');

// CORS middleware
const cors = (req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        process.env.CORS_ORIGIN,
        'https://platinumsquare.com',
        'https://www.platinumsquare.com'
      ].filter(Boolean)
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

// Error handling middleware
const errorHandler = (error, req, res) => {
  console.error('API Error:', error);

  // Validation errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }

  // Database connection errors
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error',
      error: 'Service temporarily unavailable'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Rate limiting middleware (simple implementation)
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const requestData = requests.get(ip);
    
    if (now > requestData.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (requestData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests'
      });
    }
    
    requestData.count++;
    next();
  };
};

// Async handler wrapper
const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      errorHandler(error, req, res);
    }
  };
};

// Method handler wrapper
const methodHandler = (handlers) => {
  return async (req, res) => {
    // Apply CORS first
    cors(req, res, async () => {
      const handler = handlers[req.method];
      
      if (!handler) {
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
      }
      
      try {
        await handler(req, res);
      } catch (error) {
        errorHandler(error, req, res);
      }
    });
  };
};

module.exports = {
  cors,
  errorHandler,
  authenticate,
  validateRequest,
  rateLimit,
  asyncHandler,
  methodHandler
};