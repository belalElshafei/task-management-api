/**
 * TASK MANAGEMENT API - MAIN ENTRY POINT
 * Architecture: Express.js with MongoDB & Redis
 */

require('./instrument.js');
const express = require('express');
const Sentry = require('@sentry/node');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Config & Utils
const connectDB = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const errorHandler = require('./src/middleware/errorMiddleware');
const logger = require('./src/utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// 1. Initialize App & Environment
dotenv.config();
const app = express();

// Trust proxy for secure cookies behind a proxy (e.g. Railway)
app.set('trust proxy', 1);

// 2. Database & Service Connections
if (process.env.NODE_ENV !== 'test') {
    connectDB();
    connectRedis();
}

// 3. Global Security & Parsing Middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));   // Allows cross-origin requests from frontend with cookies
app.use(express.json({ limit: '10kb' })); // Body limit to prevent DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 4. HTTP Request Logging (Integration with Winston)
app.use(morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const message = `${tokens.method(req, res)} ${tokens.url(req, res)} ${status} - ${tokens['response-time'](req, res)}ms`;

    if (status >= 400) {
        logger.error(message);
    } else {
        logger.info(message);
    }
}));

// 5. Documentation (Public Access)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Rate Limiting (Security against Brute Force)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per window (increased for SPA stability)
    message: { error: 'Too many requests, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 7. System & Health Routes (Not Rate-Limited)
app.use('/health', require('./src/routes/healthRoutes'));

// Discovery Root
app.get('/', (req, res) => {
    res.json({
        status: 'available',
        message: 'Task Management API Service',
        endpoints: {
            docs: '/api-docs',
            health: '/health'
        },
        system: {
            node_env: process.env.NODE_ENV || 'development',
            uptime: `${Math.floor(process.uptime())}s`,
            version: '1.0.0'
        }
    });
});

// 8. Business Routes (Apply Rate Limiting)
app.use('/api/auth', apiLimiter, require('./src/routes/authRoutes'));
app.use('/api/projects', apiLimiter, require('./src/routes/projectRoutes'));
app.use('/api/tasks', apiLimiter, require('./src/routes/taskRoutes'));

// 9. 404 Handler
app.use((req, res, next) => {
    res.status(404);
    next(new Error(`Route Not Found - ${req.originalUrl}`));
});

//10. Sentry Error Handler
Sentry.setupExpressErrorHandler(app);

// 11. Global Error Middleware (Must be last)
app.use(errorHandler);

// 12. Server Initialization
const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = { app, server };

// 13. Graceful Shutdown & Error Handling
// Handle unhandled promise rejections (e.g. DB connection issues)
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// Handle uncaught exceptions (e.g. a variable that doesn't exist)
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
});