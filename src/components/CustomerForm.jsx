import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faCheckCircle, faTicket, faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';
import './CustomerForm.css';

const CustomerForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        subject: '',
        description: '',
        priority: 'Medium'
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ticketNumber, setTicketNumber] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedImageModal, setSelectedImageModal] = useState(null);
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);

        // Limit to 5 images
        if (files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        // Validate file sizes (5MB each)
        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            toast.error('Each image must be under 5MB');
            return;
        }

        setSelectedImages(files);

        // Create previews
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('customerName', formData.customerName);
            formDataToSend.append('customerEmail', formData.customerEmail);
            formDataToSend.append('subject', formData.subject);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('priority', formData.priority);

            // Append images
            selectedImages.forEach((image) => {
                formDataToSend.append('images', image);
            });

            const response = await ticketAPI.submitTicket(formDataToSend);
            setTicketNumber(response.data.ticketNumber);
            setSubmitted(true);
            toast.success('🎉 Ticket submitted successfully!');
        } catch (err) {
            toast.error('Failed to submit ticket. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            customerName: '',
            customerEmail: '',
            subject: '',
            description: '',
            priority: 'Medium'
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setSubmitted(false);
        setTicketNumber('');
    };


    if (submitted) {
        return (
            <div className="customer-page">
                <div className="customer-container">
                    <div className="customer-header">
                        <div className="customer-icon"><FontAwesomeIcon icon={faTicket} /></div>
                        <h1 className="customer-title">Ticket Submitted!</h1>
                    </div>
                    <div className="success-message">
                        <div className="success-icon"><FontAwesomeIcon icon={faCheckCircle} /></div>
                        <h2 className="success-title">Thank you for contacting us!</h2>
                        <div className="ticket-number">{ticketNumber}</div>
                        <p className="success-text">
                            Your ticket has been received. Our support team will respond within 24 hours.
                            <br />
                            Please save your ticket number for future reference.
                        </p>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            marginTop: '2rem',
                            width: '100%'
                        }}>
                            <button onClick={handleReset} className="submit-another">
                                Submit Another Ticket
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="submit-another"
                                style={{ background: 'var(--gradient-reverse)' }}
                            >
                                ← Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-page">
            <div className="customer-container">
                <div className="customer-header">
                    <div className="customer-icon">💬</div>
                    <h1 className="customer-title">Submit a Support Ticket</h1>
                    <p className="customer-subtitle">We're here to help! Tell us what's wrong.</p>
                </div>

                <div className="customer-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Your Name <span className="form-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    required
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Email Address <span className="form-required">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Subject <span className="form-required">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                                placeholder="Brief description of your issue"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Problem Description <span className="form-required">*</span>
                            </label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Please describe your issue in detail..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority Level</label>
                            <select
                                className="form-select"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Low">Low - General inquiry</option>
                                <option value="Medium">Medium - Issue needs attention</option>
                                <option value="High">High - Urgent problem</option>
                            </select>
                        </div>

                        {/* Image Upload Section */}
                        <div className="form-group">
                            <label className="form-label">
                                Attach Screenshots (Optional)
                            </label>

                            {/* Custom Upload Button */}
                            <label
                                htmlFor="image-upload"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    padding: '1.5rem',
                                    border: '2px dashed var(--primary-blue)',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--gradient-soft)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    marginBottom: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--primary-pink)';
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--primary-blue)';
                                    e.currentTarget.style.background = 'var(--gradient-soft)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--primary-blue)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontWeight: '700',
                                        color: 'var(--text-dark)',
                                        marginBottom: '0.25rem'
                                    }}>
                                        Click to upload images
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-medium)'
                                    }}>
                                        or drag and drop
                                    </div>
                                </div>
                            </label>

                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />

                            <small style={{
                                display: 'block',
                                marginTop: '0.5rem',
                                color: 'var(--text-medium)',
                                fontSize: '0.85rem',
                                textAlign: 'center'
                            }}>
                                Max 5 images, 5MB each • JPG, PNG, GIF, WebP
                            </small>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                    gap: '1rem',
                                    marginTop: '1.5rem'
                                }}>
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} style={{
                                            position: 'relative',
                                            animation: 'fadeInUp 0.3s ease-out'
                                        }}>
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                onClick={() => setSelectedImageModal(preview)}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '3px solid var(--primary-blue)',
                                                    boxShadow: 'var(--shadow-md)',
                                                    transition: 'all 0.3s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.transform = 'scale(1.05)';
                                                    e.target.style.boxShadow = 'var(--shadow-lg)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.transform = 'scale(1)';
                                                    e.target.style.boxShadow = 'var(--shadow-md)';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-10px',
                                                    right: '-10px',
                                                    background: 'var(--gradient-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: 'var(--shadow-pink)',
                                                    transition: 'all 0.3s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.transform = 'rotate(90deg) scale(1.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.transform = 'rotate(0deg) scale(1)';
                                                }}
                                            >
                                                ×
                                            </button>
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                left: '8px',
                                                background: 'rgba(0, 0, 0, 0.7)',
                                                color: 'white',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </form>
                </div>


                <div className="customer-footer">
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: 'var(--gradient-reverse)',
                            color: 'white',
                            border: 'none',
                            padding: '0.9rem 2rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: 'var(--shadow-md)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = 'var(--shadow-pink)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'var(--shadow-md)';
                        }}
                    >
                        <FontAwesomeIcon icon={faHome} />
                        <span>Back to Home</span>
                    </button>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImageModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '2rem',
                        animation: 'fadeIn 0.3s ease-out'
                    }}
                    onClick={() => setSelectedImageModal(null)}
                >
                    <button
                        onClick={() => setSelectedImageModal(null)}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-lg)',
                            transition: 'all 0.3s',
                            zIndex: 10001
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'rotate(90deg) scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'rotate(0deg) scale(1)';
                        }}
                    >
                        ×
                    </button>
                    <img
                        src={selectedImageModal}
                        alt="Full size preview"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                            objectFit: 'contain'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default CustomerForm;