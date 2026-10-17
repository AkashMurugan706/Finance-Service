import axios from 'axios';

/**
 * Enterprise Axios Client configured for SMS Finance Service Backend
 * Defaults to http://localhost:8080/api with RFC 7807 Problem Detail parsing
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can attach auth tokens here when authentication is enabled
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for RFC 7807 error standardization
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let errorMessage = 'An unexpected server error occurred. Please verify backend service.';

    if (error.response) {
      const data = error.response.data;

      // Handle Spring Boot 3 RFC 7807 ProblemDetail format
      if (data && typeof data === 'object') {
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.title) {
          errorMessage = data.title;
        }

        // Field-specific validation errors
        if (data.fieldErrors && Array.isArray(data.fieldErrors)) {
          const fieldMsgs = data.fieldErrors.map((f) => `${f.field}: ${f.message}`).join(', ');
          errorMessage = `${errorMessage} (${fieldMsgs})`;
        }
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to SMS Finance backend at http://localhost:8080. Is the Spring Boot server running?';
    } else if (error.message) {
      errorMessage = error.message;
    }

    const structuredError = new Error(errorMessage);
    structuredError.status = error.response ? error.response.status : 0;
    structuredError.details = error.response ? error.response.data : null;
    structuredError.isNetworkError = !error.response;

    return Promise.reject(structuredError);
  }
);

export default apiClient;
