import apiClient from './apiClient';

export const paymentService = {
  /**
   * Fetch all payments history with optional filters
   */
  getPayments: async (filters = {}) => {
    return apiClient.get('/payments', { params: filters });
  },

  /**
   * Fetch payment ledger for a specific loan
   */
  getLoanPayments: async (loanId) => {
    return apiClient.get(`/payments/loan/${loanId}`);
  },

  /**
   * Record a payment with auto or manual allocation
   */
  recordPayment: async (paymentData) => {
    return apiClient.post('/payments', paymentData);
  },
};

export default paymentService;
