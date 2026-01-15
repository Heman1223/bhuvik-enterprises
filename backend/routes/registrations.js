const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const Registration = require('../models/Registration');
const upload = require('../config/upload');

// Debug: Log environment variables (REMOVE AFTER TESTING)
console.log('🔑 Razorpay Key ID exists:', !!process.env.RAZORPAY_KEY_ID);
console.log('🔑 Razorpay Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);
if (process.env.RAZORPAY_KEY_ID) {
    console.log('🔑 Key ID starts with:', process.env.RAZORPAY_KEY_ID.substring(0, 10));
}

// Initialize Razorpay with validation
let razorpay;
try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ RAZORPAY KEYS NOT FOUND IN ENVIRONMENT');
        throw new Error('Razorpay credentials not configured');
    }

    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID.trim(),
        key_secret: process.env.RAZORPAY_KEY_SECRET.trim()
    });
    console.log('✅ Razorpay initialized successfully');
} catch (error) {
    console.error('❌ Razorpay initialization failed:', error.message);
}

// DEBUG ROUTE - Check configuration
router.get('/debug-config', (req, res) => {
    res.json({
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
        keyIdPrefix: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 10) : 'MISSING',
        nodeEnv: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(key => 
            key.includes('RAZORPAY') || key.includes('MONGODB') || key.includes('FRONTEND')
        )
    });
});

// @route   POST /api/registrations/create-order
// @desc    Create Razorpay order
// @access  Public
router.post('/create-order', async (req, res) => {
    try {
        console.log('📝 Create order request received');

        // Validate Razorpay instance
        if (!razorpay) {
            console.error('❌ Razorpay not initialized');
            return res.status(500).json({
                success: false,
                message: 'Payment system not configured. Please contact support.'
            });
        }

        // Validate keys
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('❌ Razorpay keys missing');
            return res.status(500).json({
                success: false,
                message: 'Payment credentials not configured'
            });
        }

        const options = {
            amount: 99 * 100, // Amount in paise (₹99)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                purpose: 'Student Job Fair Registration'
            }
        };

        console.log('🔄 Creating Razorpay order...');
        const order = await razorpay.orders.create(options);
        console.log('✅ Order created:', order.id);

        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
});

// @route   POST /api/registrations/verify-payment
// @desc    Verify payment and save registration
// @access  Public
router.post('/verify-payment', upload.single('resume'), async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            // Personal Details
            name,
            phone,
            email,
            gender,
            dateOfBirth,
            // Education Details
            collegeName,
            course,
            specialization,
            yearOfPassing,
            currentSemester,
            // Career Preferences
            keySkills,
            interestedJobRole,
            preferredLocation,
            hasExperience,
            // Consent
            consent
        } = req.body;

        // Verify payment signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            // Delete uploaded file if payment verification fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Check if resume was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Resume file is required'
            });
        }

        // Generate serial number
        const serialNumber = await Registration.generateSerialNumber();

        // Create registration
        const registration = await Registration.create({
            // Personal Details
            name,
            phone,
            email,
            gender,
            dateOfBirth: new Date(dateOfBirth),
            // Education Details
            collegeName,
            course,
            specialization,
            yearOfPassing: parseInt(yearOfPassing),
            currentSemester,
            // Career Preferences
            keySkills,
            interestedJobRole,
            preferredLocation,
            hasExperience: hasExperience === 'true' || hasExperience === true,
            // Resume
            resumePath: req.file.filename,
            resumeOriginalName: req.file.originalname,
            // Consent
            consent: consent === 'true' || consent === true,
            // Payment
            paymentOrderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            paymentSignature: razorpay_signature,
            paymentStatus: 'paid',
            amount: 99,
            // Serial Number
            serialNumber
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                serialNumber: registration.serialNumber,
                name: registration.name,
                email: registration.email,
                whatsappLink: 'https://whatsapp.com/channel/0029VbAnx634tRrrGdYf822d'
            }
        });
    } catch (error) {
        console.error('Error processing registration:', error);
        // Delete uploaded file on error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed. Please try again.'
        });
    }
});

// @route   GET /api/registrations
// @desc    Get all registrations (for admin)
// @access  Private
router.get('/', async (req, res) => {
    try {
        const registrations = await Registration.find({ paymentStatus: 'paid' })
            .sort({ createdAt: -1 })
            .select('-paymentSignature -__v');

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations'
        });
    }
});

// @route   GET /api/registrations/resume/:filename
// @desc    Download resume file
// @access  Private (admin)
router.get('/resume/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'Resume file not found'
        });
    }

    res.download(filePath);
});

// @route   GET /api/registrations/config
// @desc    Get public configuration (Razorpay key, etc.)
// @access  Public
router.get('/config', (req, res) => {
    res.json({
        success: true,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        whatsappLink: 'https://whatsapp.com/channel/0029VbAnx634tRrrGdYf822d'
    });
});

module.exports = router;