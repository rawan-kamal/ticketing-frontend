import React from 'react';
import './Navbar.css';

const Navbar = ({ totalTickets = 0, openTickets = 0 }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="navbar-brand">
            <span className="navbar-icon">🎫</span>
            <div>
              <h1 className="navbar-title">TicketFlow</h1>
              <p className="navbar-subtitle">Professional Issue Tracking</p>
            </div>
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="navbar-stats">
            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <div className="stat-content">
                <span className="stat-number">{totalTickets}</span>
                <span className="stat-label">Total Tickets</span>
              </div>
            </div>
            
            <div className="stat-card">
              <span className="stat-icon">🔥</span>
              <div className="stat-content">
                <span className="stat-number">{openTickets}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
          </div>
          
          <div className="navbar-user">
            <div className="user-avatar">R</div>
            <span>Rawan</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;