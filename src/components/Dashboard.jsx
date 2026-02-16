import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../services/api';
import toast from 'react-hot-toast';
import TicketSidebar from './TicketSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTicket,
    faChartBar,
    faPlusCircle,
    faClock,
    faCheckCircle,
    faComments,
    faUser,
    faUserTie,
    faHandPaper,
    faInbox
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { agent, logout } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        pending: 0,
        resolved: 0,
        customerReplies: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

    useEffect(() => {
        setSelectedTicket(null);
    }, []);

    useEffect(() => {
        fetchTickets();
        fetchStats();
    }, [filters]);

    const fetchTickets = async () => {
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.search) params.search = filters.search;

            const response = await ticketAPI.getAllTickets(params);
            setTickets(response.data);

            // Calculate customer replies count
            const customerRepliesCount = response.data.filter(
                ticket => ticket.lastReplyBy === 'Customer'
            ).length;

            setStats(prev => ({
                ...prev,
                customerReplies: customerRepliesCount
            }));

            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch tickets');
            console.error(err);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await ticketAPI.getStats();
            setStats(prev => ({
                ...response.data,
                customerReplies: prev.customerReplies || 0
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleCloseSidebar = () => {
        setSelectedTicket(null);
        fetchTickets();
        fetchStats();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="dashboard-nav-content">
                    <div className="nav-brand">
                        <span className="nav-icon"><FontAwesomeIcon icon={faTicket} /></span>
                        <h1 className="nav-title">Support Dashboard</h1>
                    </div>

                    <div className="nav-right">
                        <div className="agent-info">
                            <div className="agent-avatar">{agent?.name?.charAt(0) || 'A'}</div>
                            <span className="agent-name">{agent?.name}</span>
                        </div>
                        <button onClick={() => {
                            logout();
                            navigate('/admin');
                        }} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2 className="dashboard-title">
                        Welcome back, {agent?.name}! <FontAwesomeIcon icon={faHandPaper} className="wave-icon" />
                    </h2>
                    <p className="dashboard-subtitle">Here's what's happening with customer support today</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Total Tickets</span>
                            <span className="stat-icon"><FontAwesomeIcon icon={faChartBar} /></span>
                        </div>
                        <div className="stat-number">{stats.total}</div>
                    </div>

                    <div className="stat-card new">
                        <div className="stat-header">
                            <span className="stat-label">New</span>
                            <span className="stat-icon"><FontAwesomeIcon icon={faPlusCircle} /></span>
                        </div>
                        <div className="stat-number">{stats.new}</div>
                    </div>

                    <div className="stat-card pending">
                        <div className="stat-header">
                            <span className="stat-label">Awaiting Reply</span>
                            <span className="stat-icon"><FontAwesomeIcon icon={faComments} /></span>
                        </div>
                        <div className="stat-number" style={{
                            color: stats.customerReplies > 0 ? 'var(--primary-pink)' : 'var(--text-light)'
                        }}>
                            {stats.customerReplies || 0}
                        </div>
                    </div>

                    <div className="stat-card pending">
                        <div className="stat-header">
                            <span className="stat-label">Pending</span>
                            <span className="stat-icon"><FontAwesomeIcon icon={faClock} /></span>
                        </div>
                        <div className="stat-number">{stats.pending}</div>
                    </div>

                    <div className="stat-card resolved">
                        <div className="stat-header">
                            <span className="stat-label">Resolved</span>
                            <span className="stat-icon"><FontAwesomeIcon icon={faCheckCircle} /></span>
                        </div>
                        <div className="stat-number">{stats.resolved}</div>
                    </div>
                </div>

                <div className="tickets-section">
                    <div className="tickets-header">
                        <h3 className="tickets-title">All Support Tickets</h3>
                        <div className="filters">
                            <select
                                className="filter-select"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Status</option>
                                <option value="New">New</option>
                                <option value="Pending">Pending</option>
                                <option value="Resolved">Resolved</option>
                            </select>

                            <select
                                className="filter-select"
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            >
                                <option value="">All Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>

                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search tickets..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <FontAwesomeIcon icon={faInbox} />
                            </div>
                            <p className="empty-text">No tickets found</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="tickets-table-wrapper">
                                <table className="tickets-table">
                                    <thead>
                                        <tr>
                                            <th>Ticket ID</th>
                                            <th>Customer</th>
                                            <th>Subject</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Last Reply</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.map((ticket) => (
                                            <tr
                                                key={ticket._id}
                                                onClick={() => handleTicketClick(ticket)}
                                                data-status={ticket.status}
                                                data-customer-reply={ticket.lastReplyBy === 'Customer' ? 'true' : 'false'}
                                            >
                                                <td>
                                                    <span className="ticket-id">{ticket.ticketNumber}</span>
                                                </td>
                                                <td>
                                                    <div className="customer-name">{ticket.customerName}</div>
                                                    <div className="customer-email">{ticket.customerEmail}</div>
                                                </td>
                                                <td>{ticket.subject}</td>
                                                <td>
                                                    <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {ticket.lastReplyBy === 'Customer' && (
                                                        <span style={{
                                                            background: 'var(--primary-pink)',
                                                            color: 'white',
                                                            padding: '0.35rem 0.9rem',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '700',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem'
                                                        }}>
                                                            <FontAwesomeIcon icon={faUser} /> Customer
                                                        </span>
                                                    )}
                                                    {ticket.lastReplyBy === 'Agent' && (
                                                        <span style={{
                                                            background: 'var(--primary-blue)',
                                                            color: 'white',
                                                            padding: '0.35rem 0.9rem',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '700',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem'
                                                        }}>
                                                            <FontAwesomeIcon icon={faUserTie} /> You
                                                        </span>
                                                    )}
                                                    {!ticket.lastReplyBy && (
                                                        <span style={{
                                                            color: 'var(--text-light)',
                                                            fontSize: '0.85rem',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            No replies
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="tickets-mobile-cards">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket._id}
                                        className="ticket-card-mobile"
                                        onClick={() => handleTicketClick(ticket)}
                                        data-status={ticket.status}
                                        data-customer-reply={ticket.lastReplyBy === 'Customer' ? 'true' : 'false'}
                                    >
                                        <div className="ticket-card-header">
                                            <span className="ticket-card-id">{ticket.ticketNumber}</span>
                                            <div className="ticket-card-badges">
                                                <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                                                    {ticket.priority}
                                                </span>
                                                <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="ticket-card-subject">{ticket.subject}</div>
                                        <div className="ticket-card-customer">
                                            {ticket.customerName} • {ticket.customerEmail}
                                        </div>

                                        <div className="ticket-card-footer">
                                            <span className="ticket-card-date">{formatDate(ticket.createdAt)}</span>
                                            {ticket.lastReplyBy === 'Customer' && (
                                                <span style={{
                                                    background: 'var(--primary-pink)',
                                                    color: 'white',
                                                    padding: '0.3rem 0.7rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700'
                                                }}>
                                                    <FontAwesomeIcon icon={faUser} /> Reply
                                                </span>
                                            )}
                                            {ticket.lastReplyBy === 'Agent' && (
                                                <span style={{
                                                    background: 'var(--primary-blue)',
                                                    color: 'white',
                                                    padding: '0.3rem 0.7rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700'
                                                }}>
                                                    <FontAwesomeIcon icon={faUserTie} /> You
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedTicket && selectedTicket._id && selectedTicket.ticketNumber ? (
                <TicketSidebar ticket={selectedTicket} onClose={handleCloseSidebar} />
            ) : null}
        </div>
    );
};

export default Dashboard;