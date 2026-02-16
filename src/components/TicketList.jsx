import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../services/api';
import './TicketList.css';

const TicketList = ({ refresh }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [refresh]);

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.getAllTickets();
      setTickets(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tickets');
      setLoading(false);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await ticketAPI.deleteTicket(id);
        fetchTickets();
      } catch (err) {
        alert('Failed to delete ticket');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ticketAPI.updateTicket(id, { status: newStatus });
      fetchTickets();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading-message">Loading tickets...</div>;
  if (error) return <div className="error-message-list">{error}</div>;

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h2>All Tickets</h2>
        <span className="ticket-count">{tickets.length} Tickets</span>
      </div>
      
      {tickets.length === 0 ? (
        <div className="empty-message">
          No tickets yet. Create your first ticket above! 🎫
        </div>
      ) : (
        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="ticket-card">
              <div className="ticket-header">
                <div className="ticket-content">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-description">{ticket.description}</p>
                  
                  <div className="ticket-badges">
                    <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                    <span className={`badge badge-${ticket.status === 'In Progress' ? 'progress' : ticket.status.toLowerCase()}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <div className="ticket-actions">
                  <select
                    className="status-select"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                  
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(ticket._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="ticket-footer">
                Created: {new Date(ticket.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;