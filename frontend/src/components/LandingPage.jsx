import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function LandingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(null);
    const [razorpayKey, setRazorpayKey] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [errors, setErrors] = useState({});

    // Animated counter state
    const [counters, setCounters] = useState({ students: 0, companies: 0, cities: 0 });

    // Form data state
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', gender: '', dateOfBirth: '',
        collegeName: '', course: '', specialization: '', yearOfPassing: '', currentSemester: '',
        keySkills: '', interestedJobRole: '', preferredLocation: '', hasExperience: '',
        resume: null, consent: false
    });

    // Animate counters on mount
    useEffect(() => {
        const targets = { students: 500, companies: 100, cities: 25 };
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;

        let step = 0;
        const interval = setInterval(() => {
            step++;
            const progress = step / steps;
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounters({
                students: Math.round(targets.students * easeOut),
                companies: Math.round(targets.companies * easeOut),
                cities: Math.round(targets.cities * easeOut)
            });

            if (step >= steps) clearInterval(interval);
        }, stepTime);

        return () => clearInterval(interval);
    }, []);

    // Load Razorpay script and config
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        fetch(`${API_URL}/registrations/config`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRazorpayKey(data.razorpayKey);
                    setWhatsappLink(data.whatsappLink);
                }
            })
            .catch(console.error);

        return () => document.body.removeChild(script);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') setFormData(prev => ({ ...prev, [name]: files[0] }));
        else if (type === 'checkbox') setFormData(prev => ({ ...prev, [name]: checked }));
        else setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = 'Required';
            if (!formData.phone.trim()) newErrors.phone = 'Required';
            else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter 10-digit number';
            if (!formData.email.trim()) newErrors.email = 'Required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
            if (!formData.gender) newErrors.gender = 'Required';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Required';
        }
        if (step === 2) {
            if (!formData.collegeName.trim()) newErrors.collegeName = 'Required';
            if (!formData.course.trim()) newErrors.course = 'Required';
            if (!formData.specialization.trim()) newErrors.specialization = 'Required';
            if (!formData.yearOfPassing) newErrors.yearOfPassing = 'Required';
            if (!formData.currentSemester.trim()) newErrors.currentSemester = 'Required';
        }
        if (step === 3) {
            if (!formData.keySkills.trim()) newErrors.keySkills = 'Required';
            if (!formData.interestedJobRole.trim()) newErrors.interestedJobRole = 'Required';
            if (!formData.preferredLocation.trim()) newErrors.preferredLocation = 'Required';
            if (!formData.hasExperience) newErrors.hasExperience = 'Required';
        }
        if (step === 4) {
            if (!formData.resume) newErrors.resume = 'Please upload your resume';
            else if (formData.resume.type !== 'application/pdf') newErrors.resume = 'PDF only';
            else if (formData.resume.size > 5 * 1024 * 1024) newErrors.resume = 'Max 5MB';
            if (!formData.consent) newErrors.consent = 'Required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(prev => prev + 1); };
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handlePayment = async () => {
        if (!validateStep(4)) return;
        setIsLoading(true);
        try {
            const orderRes = await fetch(`${API_URL}/registrations/create-order`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error('Failed to create order');

            // Check for Mock Payment
            if (orderData.key === 'mock_key') {
                await submitRegistration({
                    razorpay_order_id: orderData.order.id,
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_signature: 'mock_signature'
                });
                return;
            }

            const options = {
                key: razorpayKey,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: 'Bhuvik Enterprises',
                description: 'Student Job Fair 2026 Registration',
                order_id: orderData.order.id,
                handler: async (response) => await submitRegistration(response),
                prefill: { name: formData.name, email: formData.email, contact: formData.phone },
                theme: { color: '#0B2C5D' },
                modal: { ondismiss: () => setIsLoading(false) }
            };
            new window.Razorpay(options).open();
        } catch (error) {
            setErrors({ payment: 'Payment failed. Please try again.' });
            setIsLoading(false);
        }
    };

    const submitRegistration = async (paymentResponse) => {
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'resume') formDataToSend.append('resume', formData.resume);
                else formDataToSend.append(key, formData[key]);
            });
            formDataToSend.append('razorpay_order_id', paymentResponse.razorpay_order_id);
            formDataToSend.append('razorpay_payment_id', paymentResponse.razorpay_payment_id);
            formDataToSend.append('razorpay_signature', paymentResponse.razorpay_signature);

            const response = await fetch(`${API_URL}/registrations/verify-payment`, { method: 'POST', body: formDataToSend });
            const data = await response.json();
            if (data.success) {
                setPaymentComplete(true);
                setRegistrationSuccess(data.data);
                setCurrentStep(6);
            } else throw new Error(data.message);
        } catch (error) {
            setErrors({ payment: error.message || 'Registration failed.' });
        } finally {
            setIsLoading(false);
        }
    };

    const stepInfo = [
        { num: 1, label: 'Personal' },
        { num: 2, label: 'Education' },
        { num: 3, label: 'Career' },
        { num: 4, label: 'Documents' },
        { num: 5, label: 'Payment' }
    ];

    // Success Screen
    if (currentStep === 6 && registrationSuccess) {
        return (
            <div className="premium-page">
                <div className="premium-bg">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>

                <div className="success-container">
                    <div className="success-card">
                        <div className="success-check">
                            <svg viewBox="0 0 52 52">
                                <circle className="success-circle" cx="26" cy="26" r="25" />
                                <path className="success-tick" d="M14 27l7 7 16-16" />
                            </svg>
                        </div>

                        <h1 className="success-heading">You're In!</h1>
                        <p className="success-subtext">Registration successful for Student Job Fair 2026</p>

                        <div className="serial-box">
                            <span className="serial-label">Your Registration ID</span>
                            <span className="serial-number">{registrationSuccess.serialNumber}</span>
                        </div>

                        <div className="next-steps">
                            <h3>What Happens Next?</h3>
                            <div className="timeline">
                                <div className="timeline-item">
                                    <div className="timeline-dot active"></div>
                                    <div className="timeline-content">
                                        <span className="timeline-step">Step 1</span>
                                        <span className="timeline-text">Join WhatsApp Community</span>
                                    </div>
                                </div>
                                <div className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <span className="timeline-step">Step 2</span>
                                        <span className="timeline-text">Receive CV Workshop Link</span>
                                    </div>
                                </div>
                                <div className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <span className="timeline-step">Step 3</span>
                                        <span className="timeline-text">Attend Job Fair</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <a href={whatsappLink || registrationSuccess.whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp-cta">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            Join WhatsApp Community
                        </a>

                        <p className="save-note">Save your registration ID for future reference</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-page">
            {/* Animated Background */}
            <div className="premium-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="grid-lines"></div>
            </div>

            {/* Mini Navbar */}
            <nav className="mini-navbar">
                <div className="mini-nav-pill">
                    <img src="/logo.png" alt="Bhuvik Enterprises" className="mini-nav-logo" />
                    <span className="mini-nav-name">Bhuvik Enterprises</span>
                </div>
            </nav>

            <div className="premium-container">
                {/* LEFT SIDE - Story / Emotion */}
                <div className="story-section">
                    <div className="premium-hero-content">
                        <div className="hero-tag">
                            <span className="tag-dot"></span>
                            Student Job Fair 2026
                        </div>

                        <h1 className="hero-headline">
                            Your Career<br />
                            <span className="highlight">Starts Here.</span>
                        </h1>

                        <p className="hero-desc">
                            Join 500+ students connecting with top companies.
                            One registration. Unlimited opportunities.
                        </p>

                        {/* Form Section - Shows here in mobile, repositioned via CSS in desktop */}
                        <div className="form-section">
                            <div className="form-card glass-card">
                                {/* Step Progress */}
                                <div className="step-progress">
                                    {stepInfo.map((step, idx) => (
                                        <div key={step.num} className={`step-dot ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'done' : ''}`}>
                                            {currentStep > step.num ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                            ) : (
                                                <span>{step.num}</span>
                                            )}
                                            <span className="step-label">{step.label}</span>
                                            {idx < stepInfo.length - 1 && <div className="step-line"></div>}
                                        </div>
                                    ))}
                                </div>

                                {/* Step 1: Personal */}
                                {currentStep === 1 && (
                                    <div className="form-step fade-in">
                                        <div className="step-header">
                                            <h2>Personal Details</h2>
                                            <p>Let's start with the basics</p>
                                        </div>
                                        <div className="form-fields">
                                            <div className="field-group">
                                                <label>Full Name <span>*</span></label>
                                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className={errors.name ? 'error' : ''} />
                                                {errors.name && <span className="field-error">{errors.name}</span>}
                                            </div>
                                            <div className="field-row">
                                                <div className="field-group">
                                                    <label>Mobile Number <span>*</span></label>
                                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit number" className={errors.phone ? 'error' : ''} />
                                                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                                                </div>
                                                <div className="field-group">
                                                    <label>Email <span>*</span></label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className={errors.email ? 'error' : ''} />
                                                    {errors.email && <span className="field-error">{errors.email}</span>}
                                                </div>
                                            </div>
                                            <div className="field-row">
                                                <div className="field-group">
                                                    <label>Gender <span>*</span></label>
                                                    <select name="gender" value={formData.gender} onChange={handleChange} className={errors.gender ? 'error' : ''}>
                                                        <option value="">Select</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    {errors.gender && <span className="field-error">{errors.gender}</span>}
                                                </div>
                                                <div className="field-group">
                                                    <label>Date of Birth <span>*</span></label>
                                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={errors.dateOfBirth ? 'error' : ''} />
                                                    {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Education */}
                                {currentStep === 2 && (
                                    <div className="form-step fade-in">
                                        <div className="step-header">
                                            <h2>Education Details</h2>
                                            <p>Tell us about your academic background</p>
                                        </div>
                                        <div className="form-fields">
                                            <div className="field-group">
                                                <label>College / Institute <span>*</span></label>
                                                <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} placeholder="Enter college name" className={errors.collegeName ? 'error' : ''} />
                                                {errors.collegeName && <span className="field-error">{errors.collegeName}</span>}
                                            </div>
                                            <div className="field-row">
                                                <div className="field-group">
                                                    <label>Course <span>*</span></label>
                                                    <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="e.g., B.Tech, MBA" className={errors.course ? 'error' : ''} />
                                                    {errors.course && <span className="field-error">{errors.course}</span>}
                                                </div>
                                                <div className="field-group">
                                                    <label>Specialization <span>*</span></label>
                                                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g., Computer Science" className={errors.specialization ? 'error' : ''} />
                                                    {errors.specialization && <span className="field-error">{errors.specialization}</span>}
                                                </div>
                                            </div>
                                            <div className="field-row">
                                                <div className="field-group">
                                                    <label>Year of Passing <span>*</span></label>
                                                    <select name="yearOfPassing" value={formData.yearOfPassing} onChange={handleChange} className={errors.yearOfPassing ? 'error' : ''}>
                                                        <option value="">Select Year</option>
                                                        {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                    {errors.yearOfPassing && <span className="field-error">{errors.yearOfPassing}</span>}
                                                </div>
                                                <div className="field-group">
                                                    <label>Current Semester <span>*</span></label>
                                                    <input type="text" name="currentSemester" value={formData.currentSemester} onChange={handleChange} placeholder="e.g., 6th Semester" className={errors.currentSemester ? 'error' : ''} />
                                                    {errors.currentSemester && <span className="field-error">{errors.currentSemester}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Career */}
                                {currentStep === 3 && (
                                    <div className="form-step fade-in">
                                        <div className="step-header">
                                            <h2>Career Preferences</h2>
                                            <p>Help us match you with the right opportunities</p>
                                        </div>
                                        <div className="form-fields">
                                            <div className="field-group">
                                                <label>Key Skills <span>*</span></label>
                                                <textarea name="keySkills" value={formData.keySkills} onChange={handleChange} placeholder="e.g., Python, Communication, Data Analysis" rows="3" className={errors.keySkills ? 'error' : ''} />
                                                {errors.keySkills && <span className="field-error">{errors.keySkills}</span>}
                                            </div>
                                            <div className="field-row">
                                                <div className="field-group">
                                                    <label>Interested Role <span>*</span></label>
                                                    <input type="text" name="interestedJobRole" value={formData.interestedJobRole} onChange={handleChange} placeholder="e.g., Software Developer" className={errors.interestedJobRole ? 'error' : ''} />
                                                    {errors.interestedJobRole && <span className="field-error">{errors.interestedJobRole}</span>}
                                                </div>
                                                <div className="field-group">
                                                    <label>Preferred Location <span>*</span></label>
                                                    <input type="text" name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} placeholder="e.g., Bangalore, Remote" className={errors.preferredLocation ? 'error' : ''} />
                                                    {errors.preferredLocation && <span className="field-error">{errors.preferredLocation}</span>}
                                                </div>
                                            </div>
                                            <div className="field-group">
                                                <label>Work Experience <span>*</span></label>
                                                <div className="radio-options">
                                                    <label className={`radio-card ${formData.hasExperience === 'true' ? 'selected' : ''}`}>
                                                        <input type="radio" name="hasExperience" value="true" checked={formData.hasExperience === 'true'} onChange={handleChange} />
                                                        <span>Yes, I have experience</span>
                                                    </label>
                                                    <label className={`radio-card ${formData.hasExperience === 'false' ? 'selected' : ''}`}>
                                                        <input type="radio" name="hasExperience" value="false" checked={formData.hasExperience === 'false'} onChange={handleChange} />
                                                        <span>No, I'm a fresher</span>
                                                    </label>
                                                </div>
                                                {errors.hasExperience && <span className="field-error">{errors.hasExperience}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Upload */}
                                {currentStep === 4 && (
                                    <div className="form-step fade-in">
                                        <div className="step-header">
                                            <h2>Documents & Consent</h2>
                                            <p>Upload your resume and confirm details</p>
                                        </div>
                                        <div className="form-fields">
                                            <div className="field-group">
                                                <label>Resume (PDF only) <span>*</span></label>
                                                <div className={`upload-zone ${formData.resume ? 'has-file' : ''} ${errors.resume ? 'error' : ''}`}>
                                                    <input type="file" name="resume" accept=".pdf" onChange={handleChange} id="resume-input" />
                                                    <label htmlFor="resume-input" className="upload-label">
                                                        {formData.resume ? (
                                                            <>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                                <span className="file-name">{formData.resume.name}</span>
                                                                <span className="file-size">{(formData.resume.size / 1024).toFixed(0)} KB</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                                <span>Click to upload resume</span>
                                                                <span className="upload-hint">PDF format, max 5MB</span>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                                {errors.resume && <span className="field-error">{errors.resume}</span>}
                                            </div>
                                            <div className="field-group">
                                                <div className={`consent-check ${errors.consent ? 'error' : ''}`}>
                                                    <label>
                                                        <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} />
                                                        <span className="checkmark"></span>
                                                        <span className="consent-text">I confirm all information is accurate and agree to the terms and conditions of the Student Job Fair.</span>
                                                    </label>
                                                </div>
                                                {errors.consent && <span className="field-error">{errors.consent}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Payment */}
                                {currentStep === 5 && (
                                    <div className="form-step fade-in">
                                        <div className="step-header">
                                            <h2>Complete Registration</h2>
                                            <p>Final step - secure your spot</p>
                                        </div>
                                        <div className="payment-card">
                                            <div className="payment-summary">
                                                <div className="summary-line">
                                                    <span>Registration Fee</span>
                                                    <span>₹99</span>
                                                </div>
                                                <div className="summary-line">
                                                    <span>CV Workshop (Free)</span>
                                                    <span className="free-tag">Included</span>
                                                </div>
                                                <div className="summary-line">
                                                    <span>Digital Certificate</span>
                                                    <span className="free-tag">Included</span>
                                                </div>
                                                <div className="summary-total">
                                                    <span>Total</span>
                                                    <span className="total-amount">₹99</span>
                                                </div>
                                            </div>

                                            {errors.payment && <div className="payment-error">{errors.payment}</div>}

                                            <button onClick={handlePayment} className={`pay-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                                                {isLoading ? (
                                                    <span className="loading-spinner"></span>
                                                ) : (
                                                    <>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                                                        Pay ₹99 & Register
                                                    </>
                                                )}
                                            </button>

                                            <div className="secure-badge">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                <span>Secure payment via Razorpay</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="form-nav">
                                    {currentStep > 1 && currentStep < 6 && (
                                        <button onClick={prevStep} className="nav-btn back">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                            Back
                                        </button>
                                    )}
                                    {currentStep < 5 && (
                                        <button onClick={nextStep} className="nav-btn next">
                                            Continue
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="trust-footer">
                                <div className="trust-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                    <span>Secure & Private</span>
                                </div>
                                <div className="trust-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span>Instant Confirmation</span>
                                </div>
                            </div>
                        </div>

                        <div className="value-props">
                            <div className="value-item">
                                <div className="value-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                </div>
                                <div className="value-text">
                                    <span className="value-title">Jobs</span>
                                    <span className="value-sub">Full-time roles</span>
                                </div>
                            </div>
                            <div className="value-item">
                                <div className="value-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                                </div>
                                <div className="value-text">
                                    <span className="value-title">Internships</span>
                                    <span className="value-sub">Industry exposure</span>
                                </div>
                            </div>
                            <div className="value-item">
                                <div className="value-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                </div>
                                <div className="value-text">
                                    <span className="value-title">Networking</span>
                                    <span className="value-sub">Industry leaders</span>
                                </div>
                            </div>
                        </div>

                        <div className="stats-row">
                            <div className="stat-block">
                                <span className="stat-num">{counters.students}+</span>
                                <span className="stat-label">Students</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-block">
                                <span className="stat-num">{counters.companies}+</span>
                                <span className="stat-label">Companies</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-block">
                                <span className="stat-num">{counters.cities}+</span>
                                <span className="stat-label">Cities</span>
                            </div>
                        </div>

                        <div className="price-tag">
                            <span className="price-label">Registration Fee</span>
                            <span className="price-amount">₹99</span>
                            <span className="price-note">One-time • Includes workshop + certificate</span>
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
                    <p className="footer-email">📌 Email: careers.bhuvikenterprises@gmail.com</p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
