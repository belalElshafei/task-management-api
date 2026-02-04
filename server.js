const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const errorHandler = require('./src/middleware/errorMiddleware');
const logger = require('./src/utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// Load environment variables
dotenv.config();

// Connect to Services
connectDB();
connectRedis();

const app = express();

// 1. Global Middleware (Security & Parsing)
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. HTTP Request Logging
app.use(morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const message = `${tokens.method(req, res)} ${tokens.url(req, res)} ${status} - ${tokens['response-time'](req, res)}ms`;
    if (status >= 400) {
        logger.error(message); // Sends to error.log AND combined.log
    } else {
        logger.info(message);  // Sends ONLY to combined.log
    }
}));

// 3. Documentation (Excluded from rate limiting)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// 4. Rate Limiter (Apply only to actual API endpoints)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// 5. Business Routes
app.use('/api/auth', limiter, require('./src/routes/authRoutes'));
app.use('/api/projects', limiter, require('./src/routes/projectRoutes'));

// 6. Health Check
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

// 7. Catch-all for routes that don't exist
app.use((req, res, next) => {
    res.status(404);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});