import axios from 'axios';
import {API_BASE_URL} from '@env';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // return API_BASE_URL;
  // return 'https://fdcb-189-71-58-174.ngrok-free.app/api';
  return ' https://6e27-191-185-84-176.ngrok-free.app/api';
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

// Response wrapper
const formatResponse = (response) => {
  return {
    success: true,
    status: response.status,
    data: response.data,
    headers: response.headers
  };
};

// Error wrapper
const formatError = (error) => {
  console.log('API Error:', error);
  
  // Default error message
  let errorMessage = 'Erro de conexão com o servidor';
  let statusCode = 500;
  
  if (error.response) {
    // Server responded with an error status code
    statusCode = error.response.status;
    
    // Try to get message from response body
    const errorData = error.response.data;
    if (errorData) {
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    }
    
    // Fallback error messages based on status code
    if (!errorMessage || errorMessage === '') {
      switch (statusCode) {
        case 400:
          errorMessage = 'Requisição inválida';
          break;
        case 401:
          errorMessage = 'Não autorizado';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 422:
          errorMessage = 'Dados inválidos';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro (${statusCode})`;
      }
    }
  } else if (error.request) {
    // Request was made but no response was received
    errorMessage = 'Sem resposta do servidor';
  } else {
    // Something happened in setting up the request
    errorMessage = error.message || 'Erro ao processar requisição';
  }
  
  return {
    success: false,
    status: statusCode,
    error: {
      message: errorMessage,
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
      // Ensure headers have content type
      const mergedOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
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
  }
};

export default apiClient;
