const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorMiddleware');


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security & Production Middleware
app.use(require('helmet')());
app.use(require('cors')());

const limiter = require('express-rate-limit')({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);


// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/projects', require('./src/routes/projectRoutes'));


// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Task Management API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
