import apiClient from './apiClient';

export const brandService = {
  /**
   * Fetch dynamic brand config from backend
   */
  getBrandInfo: async () => {
    return apiClient.get('/brand');
  },
};

export default brandService;
