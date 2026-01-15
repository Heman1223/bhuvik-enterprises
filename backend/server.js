const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Configuration - CRITICAL FOR PRODUCTION
const allowedOrigins = [
    'http://localhost:5173', // Local development
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // Production frontend URL from env
    'https://bhuvik-enterprises.vercel.app', // Replace with your actual Vercel URL
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
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
    res.json({ status: 'ok', message: 'Server is running' });
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
});