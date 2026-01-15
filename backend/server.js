const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars only in development (Render provides env vars directly)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Connect to database
connectDB();

const app = express();

// CORS Configuration - CRITICAL FOR PRODUCTION
const allowedOrigins = [
    'http://localhost:5173', // Local development
    'http://localhost:5174',
    'http://localhost:3000',
    'https://bhuvik-enterprises.vercel.app', // Production frontend (no trailing slash)
    process.env.FRONTEND_URL // Backup from environment variable
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for resume downloads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/leads', require('./routes/leads'));
app.use('/api/registrations', require('./routes/registrations'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        env: process.env.NODE_ENV || 'development'
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bhuvik Enterprises API',
        status: 'running',
        endpoints: {
            health: '/api/health',
            leads: '/api/leads',
            registrations: '/api/registrations'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Allowed Origins:', allowedOrigins);
});