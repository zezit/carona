import axios from 'axios';
import { API_BASE_URL } from '@env';
import errorMessages from '../../constants/errors.json';

const DEBUG = true;

const debugLog = (module, message, ...args) => {
  if (DEBUG) {
    console.log(`[ApiClient]/${module}: ${message}`, ...args);
  }
};

// Determine the base URL based on environment
const getBaseUrl = () => {
  return API_BASE_URL;
};

const BASE_URL = getBaseUrl();

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: defaultHeaders
});

// Get user-friendly error message from error code
const getUserFriendlyErrorMessage = (errorCode, statusCode) => {
  // First try to get specific error message by code
  if (errorCode && errorMessages.errors[errorCode]) {
    return errorMessages.errors[errorCode];
  }

  // If no specific error message, try to get by status code
  if (statusCode && errorMessages.statusCodes[statusCode]) {
    return errorMessages.statusCodes[statusCode];
  }

  // Default error message
  return 'Ocorreu um erro. Por favor, tente novamente.';
};

// Response wrapper
const formatResponse = (response) => {
  return {
    success: true,
    status: response.status,
    data: response.data,
    headers: response.headers
  };
};

// Error wrapper with improved error handling
const formatError = (error) => {
  // Log error details for debugging
  console.log('API Error:', {
    url: error.config?.url,
    method: error.config?.method,
    error: error.message,
    body: error.response?.data,
    status: error.response?.status,
  });

  // Default error message
  let errorMessage = 'Erro de conexão com o servidor';
  let statusCode = 500;
  let errorCode = null;
  let errorDetails = null;

  if (error.response) {
    // Server responded with an error status code
    statusCode = error.response.status;

    // Try to get message from response body
    const errorData = error.response.data;

    if (errorData) {
      // Handle specific error format from your API
      if (errorData.codigo) {
        errorCode = errorData.codigo;
        errorDetails = errorData;
      }
      // Handle nested error objects
      else if (errorData.body && errorData.body.codigo) {
        errorCode = errorData.body.codigo;
        errorDetails = errorData.body;
      }
    }

    // Get user-friendly error message
    errorMessage = getUserFriendlyErrorMessage(errorCode, statusCode);

  } else if (error.request) {
    // Request was made but no response was received
    errorMessage = errorMessages.networkErrors.connection;
  } else if (error.message) {
    // Handle specific network errors
    if (error.message.includes('timeout')) {
      errorMessage = errorMessages.networkErrors.timeout;
    } else if (error.message.includes('Network Error')) {
      errorMessage = errorMessages.networkErrors.network;
    }
  }

  return {
    success: false,
    status: statusCode,
    error: {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      original: error
    }
  };
};

// API client methods
export const apiClient = {
  // GET request
  get: async (endpoint, options = {}) => {
    try {
      const response = await axiosInstance.get(endpoint, options);
      return formatResponse(response);
    } catch (error) {
      return formatError(error);
    }
  },

  // POST request
  post: async (endpoint, data = {}, options = {}) => {
    try {
      // Ensure headers have content type
      const mergedOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      };

      const response = await axiosInstance.post(endpoint, data, mergedOptions);
      return formatResponse(response);
    } catch (error) {
      return formatError(error);
    }
  },

  // PUT request
  put: async (endpoint, data = {}, options = {}) => {
    try {
      // Ensure headers have content type
      const mergedOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      };

      const response = await axiosInstance.put(endpoint, data, mergedOptions);
      return formatResponse(response);
    } catch (error) {
      return formatError(error);
    }
  },

  // PATCH request
  patch: async (endpoint, data = {}, options = {}) => {
    try {
      // Don't override Content-Type for multipart/form-data
      const isFormData = data instanceof FormData;

      const mergedOptions = {
        ...options,
        headers: {
          ...(isFormData ? {} : defaultHeaders),
          ...options.headers
        }
      };

      const response = await axiosInstance.patch(endpoint, data, mergedOptions);
      return formatResponse(response);
    } catch (error) {
      return formatError(error);
    }
  },

  // DELETE request
  delete: async (endpoint, options = {}) => {
    try {
      const response = await axiosInstance.delete(endpoint, options);
      return formatResponse(response);
    } catch (error) {
      return formatError(error);
    }
  },

  // Helper method to extract the most relevant error message
  getErrorMessage: (error) => {
    if (!error) return 'Erro desconhecido';

    if (typeof error === 'string') return error;

    if (error.message) return error.message;

    if (error.error && error.error.message) return error.error.message;

    return 'Ocorreu um erro. Tente novamente.';
  }
};

// Add the following method to fetch upcoming rides for a driver

/**
 * Fetches upcoming scheduled rides for a driver
 * @param {string} motoristaId - The driver's ID
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const getUpcomingRides = async (motoristaId, authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/carona/motorista/${motoristaId}/proximas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: responseData
      };
    } else {
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao buscar caronas agendadas'
      };
    }
  } catch (error) {
    console.error('Error fetching upcoming rides:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};