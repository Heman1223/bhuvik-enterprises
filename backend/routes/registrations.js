const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const Registration = require('../models/Registration');
const upload = require('../config/upload');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/registrations/create-order
// @desc    Create Razorpay order
// @access  Public
router.post('/create-order', async (req, res) => {
    try {
        // Check if keys are valid, otherwise use mock
        const isMock = !process.env.RAZORPAY_KEY_ID ||
            process.env.RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID' ||
            process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY');

        if (isMock) {
            console.log('Using Mock Payment Flow');
            return res.status(200).json({
                success: true,
                order: {
                    id: `order_mock_${Date.now()}`,
                    amount: 99 * 100,
                    currency: 'INR'
                },
                key: 'mock_key'
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

        const order = await razorpay.orders.create(options);

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
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order'
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
        let isAuthentic = false;

        // Check for mock payment
        if (razorpay_order_id.startsWith('order_mock_')) {
            isAuthentic = true;
        } else {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            isAuthentic = expectedSignature === razorpay_signature;
        }

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
