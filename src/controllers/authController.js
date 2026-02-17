const { matchedData } = require('express-validator');
const authService = require('../services/authService');

// Helper to set cookie and send response
const sendTokenResponse = (authData, statusCode, res) => {
    const { user, accessToken, refreshToken } = authData;

    // Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.status(statusCode)
        .cookie('refreshToken', refreshToken, options)
        .json({
            success: true,
            data: {
                ...user,
                accessToken
            }
        });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const userData = matchedData(req, { locations: ['body'] });
        const authData = await authService.registerUser(userData);
        sendTokenResponse(authData, 201, res);
    } catch (error) {
        res.status(400); // Bad Request for registration errors
        throw new Error(error.message);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const credentials = matchedData(req, { locations: ['body'] });
        const authData = await authService.loginUser(credentials.email, credentials.password);
        sendTokenResponse(authData, 200, res);
    } catch (error) {
        res.status(401); // Unauthorized
        throw new Error(error.message);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public (Cookie based)
const refreshToken = async (req, res) => {
    try {
        const { accessToken } = await authService.refreshAccessToken(req.cookies.refreshToken);

        res.json({
            success: true,
            accessToken
        });
    } catch (error) {
        res.status(401);
        throw new Error(error.message);
    }
};

// @desc    Logout user / Clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};

module.exports = {
    register,
    login,
    getMe,
    refreshToken,
    logout
};