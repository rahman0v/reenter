const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { pool, testConnection } = require('./config/db');

// Load environment variables
dotenv.config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// Initialize express app
const app = express();

// Configure CORS for different environments
if (isProduction) {
  // In production, be more restrictive with CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://yourdomain.com', // Replace with your actual domain
    'http://localhost:5000' // Allow local testing
  ];
  
  app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }));
} else {
  // In development, allow all origins
  app.use(cors());
}

// Security headers for production
if (isProduction) {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
}

// Body parser middleware - must be before routes
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true }));

// Request logging for development
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leases', require('./routes/leases'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve static files from frontend/dist in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    if (req.url.startsWith('/api')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
} else {
  // Basic route for testing in development
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Welcome to Reenter API',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Only log full error details in development
  if (isDevelopment) {
    console.error('Error:', err);
  } else {
    // In production, log minimal information
    console.error(`Error: ${err.message}`);
  }
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      message: 'Invalid JSON format',
      error: isDevelopment ? err.message : 'Request body contains invalid JSON'
    });
  }
  
  // Send appropriate error response
  res.status(statusCode).json({ 
    message: 'Something went wrong!',
    error: isDevelopment ? err.message : 'An error occurred processing your request'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Test database connection before starting server
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to the database. Please check your configuration.');
      console.log('Run "npm run check-db" for detailed diagnostics.');
      process.exit(1);
    }
    
    console.log(`Database connection successful in ${process.env.NODE_ENV || 'development'} mode!`);
    
    // Start the server after successful database connection
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
        startServer(PORT + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 