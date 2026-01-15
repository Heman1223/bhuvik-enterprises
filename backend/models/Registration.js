const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    // Personal Details
    name: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Other']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },

    // Education Details
    collegeName: {
        type: String,
        required: [true, 'College name is required'],
        trim: true
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true
    },
    yearOfPassing: {
        type: Number,
        required: [true, 'Year of passing is required']
    },
    currentSemester: {
        type: String,
        required: [true, 'Current semester is required'],
        trim: true
    },

    // Career Preferences
    keySkills: {
        type: String,
        required: [true, 'Key skills are required'],
        trim: true
    },
    interestedJobRole: {
        type: String,
        required: [true, 'Interested job role is required'],
        trim: true
    },
    preferredLocation: {
        type: String,
        required: [true, 'Preferred location is required'],
        trim: true
    },
    hasExperience: {
        type: Boolean,
        required: true,
        default: false
    },

    // Resume
    resumePath: {
        type: String,
        required: [true, 'Resume is required']
    },
    resumeOriginalName: {
        type: String,
        trim: true
    },

    // Consent
    consent: {
        type: Boolean,
        required: [true, 'Consent is required'],
        default: false
    },

    // Payment Details
    paymentOrderId: {
        type: String,
        trim: true
    },
    paymentId: {
        type: String,
        trim: true
    },
    paymentSignature: {
        type: String,
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    amount: {
        type: Number,
        default: 99
    },

    // Serial Number
    serialNumber: {
        type: String,
        unique: true,
        sparse: true
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate serial number before saving
registrationSchema.statics.generateSerialNumber = async function () {
    const year = new Date().getFullYear();
    const prefix = `JF${year}-`;

    // Find the last registration with a serial number for this year
    const lastRegistration = await this.findOne({
        serialNumber: new RegExp(`^${prefix}`)
    }).sort({ serialNumber: -1 });

    let nextNumber = 1;
    if (lastRegistration && lastRegistration.serialNumber) {
        const lastNumber = parseInt(lastRegistration.serialNumber.split('-')[1]);
        nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

module.exports = mongoose.model('Registration', registrationSchema);
