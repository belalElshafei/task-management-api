const User = require('../models/User');
const generateToken = require('../utils/tokenGenerator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                },
            });
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                },
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        res.status(401);
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

module.exports = {
    register,
    login,
    getMe,
};