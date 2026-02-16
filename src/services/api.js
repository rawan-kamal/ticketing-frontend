import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Export it so other files can use it
export { API_URL };

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  // Register agent
  register: (data) => api.post('/auth/register', data),

  // Login agent
  login: (data) => api.post('/auth/login', data),

  // Get current agent
  getMe: () => api.get('/auth/me'),
};

export const ticketAPI = {
  // PUBLIC: Customer submits ticket (no auth) - supports FormData for images
  submitTicket: (data) => api.post('/tickets/submit', data),

  // PUBLIC: Track ticket by number and emails
  trackTicket: (ticketNumber, customerEmail) =>
    api.post('/tickets/track', { ticketNumber, customerEmail }),

  // PROTECTED: Get all tickets (agents only)
  getAllTickets: (params) => api.get('/tickets', { params }),

  // PROTECTED: Get single ticket
  getTicket: (id) => api.get(`/tickets/${id}`),

  // PROTECTED: Update status
  updateStatus: (id, status) => api.put(`/tickets/${id}/status`, { status }),

  // PROTECTED: Update priority
  updatePriority: (id, priority) => api.put(`/tickets/${id}/priority`, { priority }),

  // PROTECTED: Delete ticket
  deleteTicket: (id) => api.delete(`/tickets/${id}`),

  // PROTECTED: Get statistics
  getStats: () => api.get('/tickets/stats/overview'),
};

export const replyAPI = {
  // PUBLIC: Get replies for tracking (no auth)
  getPublicReplies: (ticketNumber, customerEmail) =>
    api.post(`/replies/track/${ticketNumber}`, { customerEmail }),

  // PUBLIC: Customer sends reply
  sendCustomerReply: (ticketNumber, customerEmail, message) =>
    api.post(`/replies/customer/${ticketNumber}`, { customerEmail, message }),

  // PROTECTED: Get all replies for a ticket (agents)
  getReplies: (ticketId) => api.get(`/replies/ticket/${ticketId}`),

  // PROTECTED: Agent sends reply
  sendReply: (ticketId, message) => api.post(`/replies/ticket/${ticketId}`, { message }),

  // PROTECTED: Delete reply
  deleteReply: (id) => api.delete(`/replies/${id}`),
};