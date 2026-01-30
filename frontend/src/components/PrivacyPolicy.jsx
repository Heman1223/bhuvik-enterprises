import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="premium-page">
      <div className="premium-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <img src="/logo.png" alt="Bhuvik Enterprises" className="nav-logo" />
            <span className="nav-name">Bhuvik Enterprises</span>
          </Link>

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

      <div className="policy-container">
        <div className="policy-card glass-card">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: January 30, 2026</p>

          <section>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you register for the Job Fair or contact us via email/phone. This may include your name, email address, phone number, and academic details.</p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process your registration for the Job Fair.</li>
              <li>Communicate with you about event updates and opportunities.</li>
              <li>Connect you with potential employers and recruiting partners.</li>
              <li>Improve our services and website experience.</li>
            </ul>
          </section>

          <section>
            <h2>3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing and against accidental loss, destruction, or damage.</p>
          </section>

          <section>
            <h2>4. Third-Party Disclosure</h2>
            <p>We do not sell or trade your personal information. However, we may share relevant details with participating companies at the Job Fair for the purpose of recruitment and networking.</p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>You have the right to access, correct, or request the deletion of your personal data. Please contact us at the email provided below for any such requests.</p>
          </section>

          <section>
            <h2>6. Contact Us</h2>
            <div className="policy-contact">
              <p>For any questions regarding this Privacy Policy, you can reach us at:</p>
              <p>Email: <a href="mailto:contact@bhuvikenterprises.in">contact@bhuvikenterprises.in</a></p>
              <p>Phone: <a href="tel:+918059223222">+91 80592 23222</a></p>
            </div>
          </section>

          <div className="policy-footer">
            <Link to="/" className="back-btn">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
