const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Property = require('../models/Property');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Properties route is working' });
});

// @desc    Get all properties with filtering and pagination
// @route   GET /api/properties
// @access  Public
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('propertyType').optional().isIn(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'other']),
  query('listingType').optional().isIn(['sale', 'rent']),
  query('city').optional().isString(),
  query('state').optional().isString(),
  query('bedrooms').optional().isInt({ min: 0 }),
  query('bathrooms').optional().isInt({ min: 0 }),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.propertyType) filter.propertyType = req.query.propertyType;
    if (req.query.listingType) filter.listingType = req.query.listingType;
    if (req.query.city) filter['location.city'] = new RegExp(req.query.city, 'i');
    if (req.query.state) filter['location.state'] = new RegExp(req.query.state, 'i');
    if (req.query.bedrooms) filter['features.bedrooms'] = { $gte: parseInt(req.query.bedrooms) };
    if (req.query.bathrooms) filter['features.bathrooms'] = { $gte: parseInt(req.query.bathrooms) };

    // Text search
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const properties = await Property.find(filter)
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments(filter);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email avatar phone')
      .populate('favorites', 'name');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Sellers only)
router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 10), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('propertyType').isIn(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'other']),
  body('listingType').isIn(['sale', 'rent']),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.zipCode').notEmpty().withMessage('ZIP code is required')
], async (req, res) => {
  try {
    console.log('Property creation request received');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const propertyData = {
      ...req.body,
      owner: req.user._id,
      features: (() => {
        try {
          return JSON.parse(req.body.features || '{}');
        } catch (error) {
          console.log('Error parsing features JSON:', error);
          console.log('Features string:', req.body.features);
          return {};
        }
      })(),
      contactInfo: {
        phone: req.user.phone || req.body.contactPhone,
        email: req.user.email,
        preferredContact: req.body.preferredContact || 'both'
      }
    };

    console.log('Property data to create:', propertyData);

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: index === 0
      }));
    }

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
router.put('/:id', protect, upload.array('images', 10), async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    const updateData = { ...req.body };
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: index === 0
      }));
      
      // Keep existing images and add new ones
      updateData.images = [...property.images, ...newImages];
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar');

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Toggle favorite property
// @route   POST /api/properties/:id/favorite
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const isFavorited = property.favorites.includes(req.user._id);

    if (isFavorited) {
      property.favorites = property.favorites.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      property.favorites.push(req.user._id);
    }

    await property.save();

    res.json({
      success: true,
      data: {
        isFavorited: !isFavorited,
        favoritesCount: property.favorites.length
      }
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's properties
// @route   GET /api/properties/user/my-properties
// @access  Private
router.get('/user/my-properties', protect, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's favorite properties
// @route   GET /api/properties/user/favorites
// @access  Private
router.get('/user/favorites', protect, async (req, res) => {
  try {
    const properties = await Property.find({ favorites: req.user._id })
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 