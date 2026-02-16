import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faComments, faSearch } from '@fortawesome/free-solid-svg-icons';
import './CustomerHome.css';

const CustomerHome = () => {
    return (
        <div className="customer-home">
            <div className="home-container">
                <div className="home-hero">
                    <div className="home-icon"><FontAwesomeIcon icon={faTicket} /></div>
                    <h1 className="home-title">Customer Support Portal</h1>
                    <p className="home-subtitle">
                        Need help? We're here for you! Submit a support ticket or track your existing request.
                    </p>
                </div>

                <div className="home-actions">
                    <Link to="/submit" className="action-card">
                        <div className="action-icon"><FontAwesomeIcon icon={faComments} /></div>
                        <h2 className="action-title">Submit a Ticket</h2>
                        <p className="action-description">
                            Report an issue or request assistance
                        </p>
                    </Link>

                    <Link to="/track" className="action-card">
                        <div className="action-icon"><FontAwesomeIcon icon={faSearch} /></div>
                        <h2 className="action-title">Track Your Ticket</h2>
                        <p className="action-description">
                            Check the status of your support request
                        </p>
                    </Link>
                </div>
                <div className="admin-link">
                    <Link to="/admin">Are you a support agent? Click here to login →</Link>
                </div>
            </div>
        </div>
    );
};

export default CustomerHome;