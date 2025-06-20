﻿import axios from 'axios';
import { API_BASE_URL } from '@env';
import errorMessages from '../../constants/errors.json';

// Determine the base URL based on environment
const getBaseUrl = () => {

  // NGROK ROUTE HERE ↓
  return "https://cdb9-189-71-58-174.ngrok-free.app/api";

};

export const BASE_URL = getBaseUrl();

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
  let errorMessage = 'Erro de conexÃ£o com o servidor';
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
      error: 'Falha na comunicaÃ§Ã£o com o servidor'
    };
  }
};

export const getDriverRides = async (motoristaId, authToken, pageable = {}) => {
  try {
    // Build query params for pagination
    const params = new URLSearchParams();
    if (typeof pageable.page === 'number') params.append('page', pageable.page);
    if (typeof pageable.size === 'number') params.append('size', pageable.size);
    if (Array.isArray(pageable.sort)) {
      pageable.sort.forEach(sortValue => params.append('sort', sortValue));
    }

    const url = `${BASE_URL}/carona/motorista/${motoristaId}${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
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
    console.error('Error fetching driver rides:', error);
    return {
      success: false,
      error: 'Falha na comunicaÃ§Ã£o com o servidor'
    };
  }
}

/**
 * Fetches active ongoing rides for a driver
 * @param {string} motoristaId - The driver's ID
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const getActiveDriverRides = async (motoristaId, authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/carona/motorista/${motoristaId}/ativas`, {
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
        error: responseData.mensagem || 'Erro ao buscar caronas ativas'
      };
    }
  } catch (error) {
    console.error('Error fetching active driver rides:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Fetches active ongoing rides for a passenger
 * @param {string} estudanteId - The student's ID (passenger)
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const getActivePassengerRides = async (estudanteId, authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/carona/estudante/${estudanteId}/ativas`, {
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
        error: responseData.mensagem || 'Erro ao buscar caronas ativas como passageiro'
      };
    }
  } catch (error) {
    console.error('Error fetching active passenger rides:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Finalizes an ongoing ride and sends notifications to all passengers
 * @param {string} caronaId - The ride's ID
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const finalizarCarona = async (caronaId, authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/carona/${caronaId}/finalizar`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Carona finalizada com sucesso'
      };
    } else {
      const responseData = await response.json();
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao finalizar carona'
      };
    }
  } catch (error) {
    console.error('Error finalizing ride:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Checks if user has pending ratings for finished rides
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const checkPendingRatings = async (authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/avaliacao/pendentes`, {
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
        data: responseData // boolean indicating if there are pending ratings
      };
    } else {
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao verificar avaliações pendentes'
      };
    }
  } catch (error) {
    console.error('Error checking pending ratings:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Gets list of finished rides with pending ratings
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const getFinishedRidesWithPendingRatings = async (authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/avaliacao/caronas-finalizadas-sem-avaliacao`, {
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
        data: responseData // array of rides with pending ratings
      };
    } else {
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao buscar caronas com avaliações pendentes'
      };
    }
  } catch (error) {
    console.error('Error fetching rides with pending ratings:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Gets list of people that need to be rated for a specific ride
 * @param {string} caronaId - The ride's ID
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const getPendingRatingsForRide = async (caronaId, authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/avaliacao/pendentes/carona/${caronaId}`, {
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
        data: responseData // array of people to rate
      };
    } else {
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao buscar pessoas para avaliar'
      };
    }
  } catch (error) {
    console.error('Error fetching pending ratings for ride:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Submits a rating for a person in a ride
 * @param {string} caronaId - The ride's ID
 * @param {Object} ratingData - Rating data object
 * @param {number} ratingData.avaliadoId - ID of the person being rated
 * @param {number} ratingData.nota - Rating score (1-5)
 * @param {string} ratingData.comentario - Optional comment
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const submitRating = async (caronaId, ratingData, authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/avaliacao/carona/${caronaId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ratingData)
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Avaliação enviada com sucesso'
      };
    } else {
      const responseData = await response.json();
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao enviar avaliação'
      };
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Gets ratings received by a user
 * @param {number} userId - The user's ID
 * @param {string} authToken - Authentication token
 * @param {number} page - Page number (default 0)
 * @param {number} size - Page size (default 20)
 * @returns {Promise} - Promise with the API response
 */
export const getReceivedRatings = async (userId, authToken, page = 0, size = 20) => {
  try {
    const response = await fetch(`${BASE_URL}/avaliacao/recebidas/${userId}?page=${page}&size=${size}`, {
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
        data: responseData // paginated ratings received
      };
    } else {
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao buscar avaliações recebidas'
      };
    }
  } catch (error) {
    console.error('Error fetching received ratings:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Gets ratings given by a user
 * @param {number} userId - The user's ID
 * @param {string} authToken - Authentication token
 * @param {number} page - Page number (default 0)
 * @param {number} size - Page size (default 20)
 * @returns {Promise} - Promise with the API response
 */
export const getGivenRatings = async (userId, authToken, page = 0, size = 20) => {
  try {
    const response = await fetch(`${BASE_URL}/avaliacao/realizadas/${userId}?page=${page}&size=${size}`, {
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
        data: responseData // paginated ratings given
      };
    } else {
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao buscar avaliações realizadas'
      };
    }
  } catch (error) {
    console.error('Error fetching given ratings:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};

/**
 * Gets a user's rating average
 * @param {number} userId - The user's ID
 * @param {string} authToken - Authentication token
 * @returns {Promise} - Promise with the API response
 */
export const getUserRatingAverage = async (userId, authToken) => {
  try {
    const response = await fetch(`${BASE_URL}/avaliacao/media/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const rating = await response.text(); // The endpoint returns a Float as plain text
      return {
        success: true,
        data: rating ? parseFloat(rating) : null
      };
    } else {
      const responseData = await response.json();
      return {
        success: false,
        error: responseData.mensagem || 'Erro ao buscar média de avaliações'
      };
    }
  } catch (error) {
    console.error('Error fetching user rating average:', error);
    return {
      success: false,
      error: 'Falha na comunicação com o servidor'
    };
  }
};
