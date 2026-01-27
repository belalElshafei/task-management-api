const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorMiddleware');


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const logger = require('./src/utils/logger');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// HTTP Request Logging
app.use(morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const message = `${tokens.method(req, res)} ${tokens.url(req, res)} ${status} - ${tokens['response-time'](req, res)}ms`;

    if (status >= 400) {
        logger.error(message); // Sends to error.log AND combined.log
    } else {
        logger.info(message);  // Sends ONLY to combined.log
    }
}));
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


// Basic route for health check
app.get('/health', async (req, res) => {
    res.json({
        status: 'available',
        systemInfo: {
            env: process.env.NODE_ENV,
            uptime: process.uptime(), // How long the server has been running
            version: '1.0.0'
        }
    });
});

// Catch-all for routes that don't exist
app.use((req, res, next) => {
    res.status(404);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error); // This "pushes" the error into your errorHandler
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
