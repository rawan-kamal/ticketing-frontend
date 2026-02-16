import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ticketAPI, replyAPI, API_URL } from '../services/api';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faComments,
    faUserTie,
    faUser,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './TrackTicket.css';

const TrackTicket = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        ticketNumber: '',
        customerEmail: ''
    });
    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const isSubmittingRef = useRef(false);

    // Auto-fill from URL parameters
    useEffect(() => {
        const ticketFromUrl = searchParams.get('ticket');
        const emailFromUrl = searchParams.get('email');

        if (ticketFromUrl && emailFromUrl) {
            setFormData({
                ticketNumber: ticketFromUrl,
                customerEmail: emailFromUrl
            });

            // Auto-submit if both params are present
            handleAutoSubmit(ticketFromUrl, emailFromUrl);
        }
    }, [searchParams]);

    const handleAutoSubmit = async (ticketNum, email) => {
        setLoading(true);
        try {
            const ticketResponse = await ticketAPI.trackTicket(ticketNum, email);
            setTicket(ticketResponse.data);

            const repliesResponse = await replyAPI.getPublicReplies(ticketNum, email);
            setReplies(repliesResponse.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ticket not found. Please check your details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const ticketResponse = await ticketAPI.trackTicket(
                formData.ticketNumber,
                formData.customerEmail
            );
            setTicket(ticketResponse.data);

            const repliesResponse = await replyAPI.getPublicReplies(
                formData.ticketNumber,
                formData.customerEmail
            );
            setReplies(repliesResponse.data);

            toast.success('Ticket found! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ticket not found. Please check your details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewSearch = () => {
        setTicket(null);
        setReplies([]);
        setFormData({ ticketNumber: '', customerEmail: '' });
    };

    const handleSendReplyCore = async (messageToSend) => {
        if (!messageToSend || sendingReply || isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;
        setSendingReply(true);

        try {
            // Send the reply
            await replyAPI.sendCustomerReply(
                formData.ticketNumber,
                formData.customerEmail,
                messageToSend
            );

            // Wait a bit for backend to process
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Refresh replies with explicit state update
            const repliesResponse = await replyAPI.getPublicReplies(
                formData.ticketNumber,
                formData.customerEmail
            );

            // Force state update
            setReplies([...repliesResponse.data]);

            // Refresh ticket
            const ticketResponse = await ticketAPI.trackTicket(
                formData.ticketNumber,
                formData.customerEmail
            );
            setTicket({ ...ticketResponse.data });

            toast.success('Reply sent! 💬');
        } catch (err) {
            toast.error('Failed to send reply');
            console.error(err);
        } finally {
            setSendingReply(false);
            setTimeout(() => {
                isSubmittingRef.current = false;
            }, 2000);
        }
    };
    const handleSendReply = useCallback(
        debounce((e) => {
            e.preventDefault();
            e.stopPropagation();

            const messageToSend = replyMessage.trim();
            if (!messageToSend) return;

            setReplyMessage(''); // Clear immediately
            handleSendReplyCore(messageToSend);
        }, 1000, { leading: true, trailing: false }),
        [replyMessage, formData.ticketNumber, formData.customerEmail]
    );

    const formatTime = (dateString) => {
        const date = new Date(dateString);

        // For mobile - shorter format
        if (window.innerWidth < 768) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }

        // For desktop - full format
        return date.toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'var(--status-new)';
            case 'Pending': return 'var(--status-pending)';
            case 'Resolved': return 'var(--status-resolved)';
            default: return 'var(--text-medium)';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'var(--priority-high)';
            case 'Medium': return 'var(--priority-medium)';
            case 'Low': return 'var(--priority-low)';
            default: return 'var(--text-medium)';
        }
    };

    if (ticket) {
        return (
            <>
                <div className="track-page">
                    <div className="track-container">
                        <div className="track-header">
                            <div className="track-icon"><FontAwesomeIcon icon={faSearch} /></div>
                            <h1 className="track-title">Your Ticket</h1>
                            <p className="track-subtitle">Track your support request</p>
                        </div>

                        <div className="track-body">
                            <div className="ticket-details">
                                <div className="detail-card">
                                    <div className="detail-ticket-number">{ticket.ticketNumber}</div>

                                    <div className="detail-row">
                                        <span className="detail-label">Status:</span>
                                        <span
                                            className="detail-value"
                                            style={{
                                                color: getStatusColor(ticket.status),
                                                fontWeight: 700
                                            }}
                                        >
                                            {ticket.status}
                                        </span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">Priority:</span>
                                        <span
                                            className="detail-value"
                                            style={{
                                                color: getPriorityColor(ticket.priority),
                                                fontWeight: 700
                                            }}
                                        >
                                            {ticket.priority}
                                        </span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">Created:</span>
                                        <span className="detail-value">{formatTime(ticket.createdAt)}</span>
                                    </div>

                                    <h3 className="detail-subject">{ticket.subject}</h3>
                                    <div className="detail-description">{ticket.description}</div>

                                    {/* Display Images */}
                                    {ticket.images && ticket.images.length > 0 && (
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <h4 style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '700',
                                                color: 'var(--text-medium)',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                📎 Attachments ({ticket.images.length})
                                            </h4>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                                gap: '1rem'
                                            }}>
                                                {ticket.images.map((image, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => setSelectedImage(`${API_URL}/uploads/${image}`)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <img
                                                            src={`${API_URL}/uploads/${image}`}
                                                            alt={`Attachment ${index + 1}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                borderRadius: 'var(--radius-md)',
                                                                border: '3px solid var(--border-color)',
                                                                transition: 'all 0.3s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.target.style.transform = 'scale(1.05)';
                                                                e.target.style.borderColor = 'var(--primary-blue)';
                                                                e.target.style.boxShadow = 'var(--shadow-md)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.borderColor = 'var(--border-color)';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="conversation-section">
                                    <h3 className="conversation-title">
                                        <FontAwesomeIcon icon={faComments} /> Conversation ({replies.length})
                                    </h3>

                                    {replies.length === 0 ? (
                                        <div className="empty-conversation">
                                            No replies yet. Our team will respond within 24 hours.
                                        </div>
                                    ) : (
                                        <div className="conversation-list">
                                            {replies.map((reply) => (
                                                <div
                                                    key={reply._id}
                                                    className={`conversation-item ${reply.sender.toLowerCase()}`}
                                                >
                                                    <div className="conversation-header">
                                                        <span className="conversation-sender">
                                                            <FontAwesomeIcon icon={reply.sender === 'Agent' ? faUserTie : faUser} />{' '}
                                                            {reply.senderName}
                                                        </span>
                                                        <span className="conversation-time">
                                                            {formatTime(reply.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="conversation-message">{reply.message}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {ticket.status !== 'Resolved' && (
                                    <div style={{ marginTop: '2rem' }}>
                                        <h4 style={{
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            color: 'var(--text-dark)',
                                            marginBottom: '1rem'
                                        }}>
                                            <FontAwesomeIcon icon={faComments} /> Send a Reply
                                        </h4>
                                        <form onSubmit={handleSendReply}>
                                            <textarea
                                                className="form-textarea"
                                                placeholder="Type your message..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                required
                                                disabled={sendingReply}
                                                style={{
                                                    marginBottom: '1rem',
                                                    minHeight: '100px'
                                                }}
                                            />
                                            <button
                                                type="submit"
                                                className="track-button"
                                                disabled={sendingReply || !replyMessage.trim() || isSubmittingRef.current}
                                                style={{
                                                    marginTop: 0,
                                                    opacity: (sendingReply || isSubmittingRef.current) ? 0.6 : 1,
                                                    cursor: (sendingReply || isSubmittingRef.current) ? 'not-allowed' : 'pointer',
                                                    pointerEvents: (sendingReply || isSubmittingRef.current) ? 'none' : 'auto'
                                                }}
                                            >
                                                {sendingReply ? 'Sending...' : 'Send Reply'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {ticket.status === 'Resolved' && (
                                    <div style={{
                                        background: 'var(--gradient-soft)',
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        textAlign: 'center',
                                        color: 'var(--text-medium)',
                                        marginTop: '2rem',
                                        border: '2px solid var(--border-color)'
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--status-resolved)' }} />
                                        </div>
                                        <strong>This ticket has been resolved.</strong>
                                        <br />
                                        If you need further assistance, please submit a new ticket.
                                    </div>
                                )}

                                <button onClick={handleNewSearch} className="new-search-button">
                                    Track Another Ticket
                                </button>
                            </div>
                        </div>

                        <div className="track-footer">
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="back-link">
                                ← Back to Home
                            </a>
                        </div>
                    </div>
                </div>

                {/* Image Modal */}
                {selectedImage && (
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
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
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
                            src={selectedImage}
                            alt="Full size"
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
            </>
        );
    }

    return (
        <div className="track-page">
            <div className="track-container">
                <div className="track-header">
                    <div className="track-icon"><FontAwesomeIcon icon={faSearch} /></div>
                    <h1 className="track-title">Track Your Ticket</h1>
                    <p className="track-subtitle">Enter your details to check status</p>
                </div>

                <div className="track-body">
                    <form onSubmit={handleSubmit} className="track-form">
                        <div className="form-group">
                            <label className="form-label">Ticket Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.ticketNumber}
                                onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                                required
                                placeholder="TKT-000001"
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                required
                                placeholder="your@email.com"
                                autoComplete="email"
                            />
                        </div>

                        <button type="submit" className="track-button" disabled={loading}>
                            {loading ? 'Searching...' : 'Track Ticket'}
                        </button>
                    </form>
                </div>

                <div className="track-footer">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="back-link">
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default TrackTicket;