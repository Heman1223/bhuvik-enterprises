const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validation
        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and phone number'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        const lead = await Lead.create({
            name,
            email,
            phone,
            message: message || ''
        });

        res.status(201).json({
            success: true,
            message: 'Thank you! Your submission has been received.',
            data: lead
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// @route   GET /api/leads
// @desc    Get all leads (for admin)
// @access  Private (password protected on frontend)
router.get('/', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// @route   POST /api/leads/verify-admin
// @desc    Verify admin password
// @access  Public
router.post('/verify-admin', (req, res) => {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

module.exports = router;
