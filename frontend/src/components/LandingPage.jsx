import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function LandingPage() {
    // Animated counter state
    const [counters, setCounters] = useState({ companies: 0, cities: 0, placementRate: 0, placedCandidates: 0 });

    const topCompanies = [
        "Google", "Microsoft", "Amazon", "Meta", "Infosys", "TCS", "Wipro", "Accenture", "Reliance", "HDFC Bank"
    ];

    const testimonials = [
      {
        name: "Rahul Sharma",
        role: "Software Developer at TCS",
        text: "The Job Fair was a game-changer for me. I connected with my dream company and got placed within a week!",
        rating: 5
      },
      {
        name: "Priya Verma",
        role: "UI/UX Intern at Wipro",
        text: "Highly recommended for students looking for industry exposure. The workshops were incredibly helpful.",
        rating: 5
      },
      {
        name: "Amit Patel",
        role: "Data Analyst at Infosys",
        text: "Smooth process from registration to placement. Bhuvik Enterprises truly cares about student careers.",
        rating: 5
      }
    ];

    // Animate counters on mount
    useEffect(() => {
        const targets = { companies: 100, cities: 25, placementRate: 98, placedCandidates: 1200 };
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;

        let step = 0;
        const interval = setInterval(() => {
            step++;
            const progress = step / steps;
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounters({
                companies: Math.round(targets.companies * easeOut),
                cities: Math.round(targets.cities * easeOut),
                placementRate: Math.round(targets.placementRate * easeOut),
                placedCandidates: Math.round(targets.placedCandidates * easeOut)
            });

            if (step >= steps) clearInterval(interval);
        }, stepTime);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="premium-page">
            {/* Animated Background */}
            <div className="premium-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="grid-lines"></div>
            </div>

            {/* Premium Navbar */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-brand">
                        <img src="/logo.png" alt="Bhuvik Enterprises" className="nav-logo" />
                        <span className="nav-name">Bhuvik Enterprises</span>
                    </div>

                    <div className="nav-contact">
                        <a href="mailto:contact@bhuvikenterprises.in" className="nav-contact-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span>contact@bhuvikenterprises.in</span>
                        </a>
                        <a href="tel:+918059223222" className="nav-contact-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            <span>+91 80592 23222</span>
                        </a>
                    </div>
                </div>
            </nav>

            <div className="premium-container">
                {/* Hero Section */}
                <div className="story-section">
                    <div className="premium-hero-content">
                        <div className="hero-tag">
                            <span className="tag-dot"></span>
                            <span>Best Placement Agency</span>
                        </div>

                        <h1 className="hero-headline">
                            Your Career<br />
                            <span className="highlight">Starts Here.</span>
                        </h1>

                        <p className="hero-desc">
                            India's Leading Placement Agency Website.<br />
                            Join 500+ students connecting with top companies.
                        </p>

                        {/* Value Props Card */}
                        <div className="premium-content-card glass-card">
                            <div className="value-props">
                                <div className="value-item">
                                    <div className="value-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="7" width="20" height="14" rx="2" />
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                        </svg>
                                    </div>
                                    <div className="value-text">
                                        <span className="value-title">Jobs</span>
                                        <span className="value-sub">Full-time roles</span>
                                    </div>
                                </div>
                                <div className="value-item">
                                    <div className="value-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                        </svg>
                                    </div>
                                    <div className="value-text">
                                        <span className="value-title">Internships</span>
                                        <span className="value-sub">Industry exposure</span>
                                    </div>
                                </div>
                                <div className="value-item">
                                    <div className="value-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                    <div className="value-text">
                                        <span className="value-title">Networking</span>
                                        <span className="value-sub">Industry leaders</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="stats-row">
                                <div className="stat-block">
                                    <span className="stat-num">{counters.companies}+</span>
                                    <span className="stat-label">Companies</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-block">
                                    <span className="stat-num">{counters.cities}+</span>
                                    <span className="stat-label">Cities</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-block">
                                    <span className="stat-num">{counters.placementRate}%</span>
                                    <span className="stat-label">Placement Rate</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-block">
                                    <span className="stat-num">{counters.placedCandidates}+</span>
                                    <span className="stat-label">Placed Candidates</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Tag */}
                        <div className="price-tag">
                            <span className="price-label">Registration Fee</span>
                            <span className="price-amount">₹99</span>
                            <span className="price-note">One-time • Includes workshop + certificate</span>
                        </div>
                    </div>

                    {/* Companies Marquee */}
                    <div className="companies-section">
                        <h2 className="section-title">Partner Companies</h2>
                        <div className="companies-marquee-wrapper">
                            <div className="companies-marquee">
                                {[...topCompanies, ...topCompanies].map((company, index) => (
                                    <div key={index} className="company-tag glass-card">
                                        {company}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Student Reviews */}
                    <div className="reviews-section">
                        <h2 className="section-title">Student Success Stories</h2>
                        <div className="reviews-grid">
                            {testimonials.map((review, index) => (
                                <div key={index} className="review-card glass-card">
                                    <div className="review-rating">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <svg key={i} viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="review-text">"{review.text}"</p>
                                    <div className="review-author">
                                        <div className="author-info">
                                            <span className="author-name">{review.name}</span>
                                            <span className="author-role">{review.role}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mini-footer">
                <div className="footer-content">
                    <p className="footer-tagline">Connecting Students to Careers</p>
                    <p className="footer-services">🎯 Jobs | Internships | Trainings</p>
                    <p className="footer-location">📍 Rohtak | Pan India</p>
                    <div className="footer-contact-row">
                        <p className="footer-email">
                            📌 Email: <a href="mailto:contact@bhuvikenterprises.in">contact@bhuvikenterprises.in</a>
                        </p>
                        <p className="footer-phone">
                            📞 Phone: <a href="tel:+918059223222">+91 80592 23222</a>
                        </p>
                        <p className="footer-instagram">
                            📸 Instagram: <a href="https://www.instagram.com/bhuvik_enterprises?igsh=cjd1Y2QwbmRzdGxw" target="_blank" rel="noopener noreferrer">@bhuvik_enterprises</a>
                        </p>
                    </div>
                    <div className="footer-links">
                        <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;