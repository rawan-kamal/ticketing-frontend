import React, { useState, useEffect } from 'react';
import { ticketAPI, replyAPI, API_URL } from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faUserTie, faUser } from '@fortawesome/free-solid-svg-icons';
import './TicketSidebar.css';

const TicketSidebar = ({ ticket, onClose }) => {
    const [status, setStatus] = useState(ticket.status);
    const [replies, setReplies] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchReplies();
    }, [ticket._id]);

    const fetchReplies = async () => {
        try {
            const response = await replyAPI.getReplies(ticket._id);
            setReplies(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setLoading(true);
        try {
            await replyAPI.sendReply(ticket._id, replyMessage);
            setReplyMessage('');
            fetchReplies();
            toast.success('Reply sent! 💬');
        } catch (err) {
            toast.error('Failed to send reply');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await ticketAPI.updateStatus(ticket._id, newStatus);
            setStatus(newStatus);
            toast.success('Status updated!');
        } catch (err) {
            toast.error('Failed to update status');
            console.error(err);
        }
    };


    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <>
            <div className="sidebar-overlay" onClick={onClose}></div>
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Ticket Details</h2>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <div className="sidebar-body">
                    <div className="ticket-info">
                        <div className="ticket-number">{ticket.ticketNumber}</div>

                        <div className="info-row">
                            <span className="info-label">Customer:</span>
                            <span className="info-value">{ticket.customerName}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{ticket.customerEmail}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Created:</span>
                            <span className="info-value">{formatTime(ticket.createdAt)}</span>
                        </div>

                        <h3 className="ticket-subject">{ticket.subject}</h3>
                        <div className="ticket-description">{ticket.description}</div>

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

                        <div className="actions-section">
                            <select
                                className="action-select"
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="New">New</option>
                                <option value="Pending">Pending</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>
                    </div>

                    <div className="replies-section">
                        <h3 className="section-title">
                            <FontAwesomeIcon icon={faComments} /> Conversation ({replies.length})
                        </h3>

                        <div className="replies-list">
                            {replies.length === 0 ? (
                                <div className="empty-replies">No replies yet. Be the first to respond!</div>
                            ) : (
                                replies.map((reply) => (
                                    <div key={reply._id} className={`reply-item ${reply.sender.toLowerCase()}`}>
                                        <div className="reply-header">
                                            <span className="reply-sender">
                                                <FontAwesomeIcon icon={reply.sender === 'Agent' ? faUserTie : faUser} />{' '}
                                                {reply.senderName}
                                            </span>
                                            <span className="reply-time">{formatTime(reply.createdAt)}</span>
                                        </div>
                                        <div className="reply-message">{reply.message}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleSendReply} className="reply-form">
                            <textarea
                                className="reply-textarea"
                                placeholder="Type your reply to the customer..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                required
                            />
                            <button type="submit" className="reply-submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reply'}
                            </button>
                        </form>
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
};

export default TicketSidebar;