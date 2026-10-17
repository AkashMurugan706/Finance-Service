import apiClient from './apiClient';

export const customerService = {
  /**
   * Get all customers, optionally filtered by search query
   */
  getCustomers: async (searchQuery = '') => {
    const params = searchQuery ? { query: searchQuery } : {};
    return apiClient.get('/customers', { params });
  },

  /**
   * Get customer by ID
   */
  getCustomerById: async (id) => {
    return apiClient.get(`/customers/${id}`);
  },

  /**
   * Register a new customer
   */
  createCustomer: async (customerData) => {
    return apiClient.post('/customers', customerData);
  },

  /**
   * Update existing customer
   */
  updateCustomer: async (id, customerData) => {
    return apiClient.put(`/customers/${id}`, customerData);
  },

  /**
   * Soft deactivate customer
   */
  deleteCustomer: async (id) => {
    return apiClient.delete(`/customers/${id}`);
  },
};

export default customerService;
