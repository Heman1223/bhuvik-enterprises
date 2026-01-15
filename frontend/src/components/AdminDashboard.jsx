import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setIsLoggingIn(true);

        try {
            const response = await fetch(`${API_URL}/leads/verify-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                setIsAuthenticated(true);
                sessionStorage.setItem('adminAuth', 'true');
            } else {
                setLoginError('Invalid password. Please try again.');
            }
        } catch (err) {
            setLoginError('Unable to connect to server. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const fetchRegistrations = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/registrations`);
            const data = await response.json();

            if (data.success) {
                setRegistrations(data.data);
            } else {
                setError('Failed to fetch registrations');
            }
        } catch (err) {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRegistrations();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('adminAuth');
        setPassword('');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadResume = (filename, originalName) => {
        const link = document.createElement('a');
        link.href = `${API_URL}/registrations/resume/${filename}`;
        link.download = originalName || filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // SVG Icons
    const icons = {
        download: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
        ),
        check: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
        clock: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        )
    };

    if (!isAuthenticated) {
        return (
            <div className="login-overlay">
                <div className="login-card">
                    <h2>Admin Access</h2>
                    <p>Enter password to view registrations</p>

                    {loginError && (
                        <div className="alert alert-error">
                            <span className="alert-icon">✕</span>
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="form-input"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${isLoggingIn ? 'loading' : ''}`}
                            disabled={isLoggingIn || !password}
                        >
                            {isLoggingIn ? 'Verifying...' : 'Login'}
                        </button>
                    </form>

                    <Link to="/" className="back-link" style={{ marginTop: '1.5rem', display: 'block', textAlign: 'center' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="container">
                <Link to="/" className="back-link">← Back to Home</Link>

                <div className="admin-header">
                    <h1 className="admin-title">Job Fair Registrations</h1>
                    <p className="admin-subtitle">View and manage all student registrations</p>
                </div>

                <div className="leads-container">
                    <div className="leads-header">
                        <h3>All Registrations</h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span className="leads-count">{registrations.length} registrations</span>
                            <button onClick={fetchRegistrations} className="refresh-btn" title="Refresh">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 4v6h-6M1 20v-6h6" />
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                            </button>
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading registrations...</p>
                        </div>
                    ) : error ? (
                        <div className="no-leads">
                            <div className="alert alert-error" style={{ display: 'inline-flex' }}>
                                <span className="alert-icon">✕</span>
                                {error}
                            </div>
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="no-leads">
                            <div className="no-leads-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <p>No registrations yet. New registrations will appear here.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="leads-table registrations-table">
                                <thead>
                                    <tr>
                                        <th>Serial No.</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>College</th>
                                        <th>Course</th>
                                        <th>Payment</th>
                                        <th>Resume</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map((reg) => (
                                        <tr key={reg._id}>
                                            <td className="serial-cell">
                                                <span className="serial-badge">{reg.serialNumber}</span>
                                            </td>
                                            <td className="name-cell">
                                                <div className="name-info">
                                                    <span className="name-text">{reg.name}</span>
                                                    <span className="email-text">{reg.email}</span>
                                                </div>
                                            </td>
                                            <td className="phone-cell">{reg.phone}</td>
                                            <td className="college-cell" title={reg.collegeName}>
                                                {reg.collegeName.length > 25
                                                    ? reg.collegeName.substring(0, 25) + '...'
                                                    : reg.collegeName}
                                            </td>
                                            <td className="course-cell">
                                                <span>{reg.course}</span>
                                                <span className="specialization-text">{reg.specialization}</span>
                                            </td>
                                            <td className="status-cell">
                                                <span className={`status-badge ${reg.paymentStatus}`}>
                                                    {reg.paymentStatus === 'paid' ? icons.check : icons.clock}
                                                    {reg.paymentStatus === 'paid' ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="resume-cell">
                                                <button
                                                    className="download-btn"
                                                    onClick={() => handleDownloadResume(reg.resumePath, reg.resumeOriginalName)}
                                                    title="Download Resume"
                                                >
                                                    {icons.download}
                                                    <span>PDF</span>
                                                </button>
                                            </td>
                                            <td className="date-cell">{formatDate(reg.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                {registrations.length > 0 && (
                    <div className="stats-summary">
                        <div className="stat-item">
                            <span className="stat-value">{registrations.length}</span>
                            <span className="stat-label-text">Total Registrations</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                ₹{registrations.filter(r => r.paymentStatus === 'paid').length * 99}
                            </span>
                            <span className="stat-label-text">Total Revenue</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {registrations.filter(r => r.paymentStatus === 'paid').length}
                            </span>
                            <span className="stat-label-text">Paid Registrations</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
