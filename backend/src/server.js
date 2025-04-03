const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());

// Body parser middleware - must be before routes
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leases', require('./routes/leases'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Reenter API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parsing error:', err.body);
    return res.status(400).json({ 
      message: 'Invalid JSON format',
      error: err.message
    });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT); 