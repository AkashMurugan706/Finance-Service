import apiClient from './apiClient';

export const loanService = {
  /**
   * Fetch all loans with optional status and customer filters
   */
  getLoans: async (filters = {}) => {
    return apiClient.get('/loans', { params: filters });
  },

  /**
   * Get comprehensive loan details by ID
   */
  getLoanById: async (id) => {
    return apiClient.get(`/loans/${id}`);
  },

  /**
   * Disburse a new loan
   */
  createLoan: async (loanData) => {
    return apiClient.post('/loans', loanData);
  },

  /**
   * Close a loan with settlement notes
   */
  closeLoan: async (id, notes = '') => {
    return apiClient.post(`/loans/${id}/close`, null, { params: { notes } });
  },

  /**
   * Recalculate accrued interest as of a specific date
   */
  recalculateInterest: async (id, asOfDate) => {
    const params = asOfDate ? { asOfDate } : {};
    return apiClient.post(`/loans/${id}/recalculate`, null, { params });
  },

  /**
   * Interactive Vatti interest preview calculation (before loan creation)
   */
  calculateInterest: async (calcData) => {
    return apiClient.post('/loans/calculate-interest', calcData);
  },

  /**
   * Dashboard executive stats & aggregates
   */
  getDashboardStats: async () => {
    return apiClient.get('/loans/dashboard/stats');
  },
};

export default loanService;
