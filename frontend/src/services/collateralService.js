import apiClient from './apiClient';

export const collateralService = {
  /**
   * Fetch all pledged/vault collaterals
   */
  getCollaterals: async (filters = {}) => {
    return apiClient.get('/collateral', { params: filters });
  },

  /**
   * Pledge a new collateral asset or document
   */
  pledgeCollateral: async (collateralData) => {
    return apiClient.post('/collateral', collateralData);
  },

  /**
   * Upload collateral document file (deed scan, gold certificate, RC book photo)
   */
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/collateral/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Mark collateral as returned to customer
   */
  returnCollateral: async (id, notes = '') => {
    return apiClient.post(`/collateral/${id}/return`, null, { params: { notes } });
  },
};

export default collateralService;
