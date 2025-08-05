const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['buyer', 'seller']).withMessage('Role must be either buyer or seller')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Only include fields that are present and not empty
    const userData = {};
    ["name", "email", "password", "role", "preferredPropertyType", "budgetRange", "preferredLocation", "companyName", "licenseNumber", "experience", "specialization"].forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        userData[field] = req.body[field];
      }
    });

    // Check if user already exists
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().notEmpty().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().notEmpty().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().notEmpty().trim().isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 characters'),
  // Buyer specific validation
  body('preferredPropertyType').optional().notEmpty().isIn(['house', 'apartment', 'condo', 'villa', 'land', 'commercial']).withMessage('Invalid property type'),
  body('budgetRange').optional().notEmpty().isIn(['under-10lakh', '10lakh-25lakh', '25lakh-50lakh', '50lakh-1crore', '1crore-2crore', 'over-2crore']).withMessage('Invalid budget range'),
  body('preferredLocation').optional().notEmpty().trim().isLength({ max: 100 }).withMessage('Location cannot be more than 100 characters'),
  // Seller specific validation
  body('companyName').optional().notEmpty().trim().isLength({ max: 100 }).withMessage('Company name cannot be more than 100 characters'),
  body('licenseNumber').optional().notEmpty().trim().isLength({ max: 50 }).withMessage('License number cannot be more than 50 characters'),
  body('experience').optional().notEmpty().isIn(['beginner', 'intermediate', 'experienced', 'expert']).withMessage('Invalid experience level'),
  body('specialization').optional().notEmpty().trim().isLength({ max: 100 }).withMessage('Specialization cannot be more than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      phone, 
      preferredPropertyType, 
      budgetRange, 
      preferredLocation,
      companyName, 
      licenseNumber, 
      experience, 
      specialization 
    } = req.body;

    // Check if email is being updated and if it already exists
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    
    // Add buyer fields if user is a buyer
    if (req.user.role === 'buyer') {
      if (preferredPropertyType !== undefined) updateData.preferredPropertyType = preferredPropertyType;
      if (budgetRange !== undefined) updateData.budgetRange = budgetRange;
      if (preferredLocation !== undefined) updateData.preferredLocation = preferredLocation;
    }
    
    // Add seller fields if user is a seller
    if (req.user.role === 'seller') {
      if (companyName !== undefined) updateData.companyName = companyName;
      if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
      if (experience !== undefined) updateData.experience = experience;
      if (specialization !== undefined) updateData.specialization = specialization;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Google OAuth routes
// @route   GET /api/auth/google
// @access  Public
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  }
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router; 