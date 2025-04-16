import { useState } from 'react';
import { apiClient } from '../services/api/apiClient';

/**
 * Custom hook for handling API requests with loading and error states
 */
const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  const get = async (endpoint, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.get(endpoint, options);
      
      if (!result.success) {
        setError(result.error.message);
        return { success: false, error: result.error };
      }
      
      return { success: true, data: result.data };
    } catch (e) {
      const errorMsg = 'Erro ao buscar dados';
      setError(errorMsg);
      return { success: false, error: { message: errorMsg } };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  const post = async (endpoint, data, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.post(endpoint, data, options);
      
      if (!result.success) {
        setError(result.error.message);
        return { success: false, error: result.error };
      }
      
      return { success: true, data: result.data };
    } catch (e) {
      const errorMsg = 'Erro ao enviar dados';
      setError(errorMsg);
      return { success: false, error: { message: errorMsg } };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Make a PUT request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  const put = async (endpoint, data, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.put(endpoint, data, options);
      
      if (!result.success) {
        setError(result.error.message);
        return { success: false, error: result.error };
      }
      
      return { success: true, data: result.data };
    } catch (e) {
      const errorMsg = 'Erro ao atualizar dados';
      setError(errorMsg);
      return { success: false, error: { message: errorMsg } };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Make a DELETE request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  const del = async (endpoint, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.delete(endpoint, options);
      
      if (!result.success) {
        setError(result.error.message);
        return { success: false, error: result.error };
      }
      
      return { success: true, data: result.data };
    } catch (e) {
      const errorMsg = 'Erro ao excluir dados';
      setError(errorMsg);
      return { success: false, error: { message: errorMsg } };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    get,
    post,
    put,
    delete: del,
    isLoading,
    error,
  };
};

export default useApi;
