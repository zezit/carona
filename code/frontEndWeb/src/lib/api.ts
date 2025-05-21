import axios from 'axios';
import { reportServer } from '@/mocks/reportServer';

// Set base URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Configure axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define API functions for admin-related operations
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error };
      }
    },
    validateToken: async () => {
      try {
        const response = await apiClient.get('/auth/validate');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Token validation error:', error);
        return { success: false, error };
      }
    },
  },
  admin: {
    // Get pending users that need approval
    getPendingUsers: async () => {
      try {
        const response = await apiClient.get('/admin/pendentes');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error fetching pending users:', error);
        return { success: false, error };
      }
    },
    // Review a user (approve/reject)
    reviewUser: async (userId: string, status: string) => {
      try {
        const response = await apiClient.patch(`/admin/revisar/${userId}/${status}`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error reviewing user:', error);
        return { success: false, error };
      }
    },
    // Get all students (for user management)
    getAllStudents: async () => {
      try {
        const response = await apiClient.get('/estudante');
        return { success: true, data: response.data.content || [] };
      } catch (error) {
        console.error('Error fetching all students:', error);
        return { success: false, error };
      }
    },
    // Block a student (set status to CANCELADO)
    blockStudent: async (userId: string) => {
      try {
        const response = await apiClient.patch(`/admin/revisar/${userId}/CANCELADO`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error blocking student:', error);
        return { success: false, error };
      }
    },
    // Unblock a student (set status to APROVADO)
    unblockStudent: async (userId: string) => {
      try {
        const response = await apiClient.patch(`/admin/revisar/${userId}/APROVADO`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error unblocking student:', error);
        return { success: false, error };
      }
    },
    // Delete a student
    deleteStudent: async (userId: string) => {
      try {
        const response = await apiClient.delete(`/estudante/${userId}`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error deleting student:', error);
        return { success: false, error };
      }
    },
  },
  reports: {
    // Get all reports
    getAllReports: async () => {
      try {
        // Usando o servidor mock
        const response = reportServer.getAllReports();
        return response;
      } catch (error) {
        console.error('Error fetching reports:', error);
        return { success: false, error };
      }
    },
    // Get report by ID
    getReportById: async (reportId: string) => {
      try {
        const response = reportServer.getReportById(reportId);
        return response;
      } catch (error) {
        console.error('Error fetching report:', error);
        return { success: false, error };
      }
    },
    // Create new report
    createReport: async (reportData: any) => {
      try {
        const response = reportServer.createReport(reportData);
        return response;
      } catch (error) {
        console.error('Error creating report:', error);
        return { success: false, error };
      }
    },
    // Update report
    updateReport: async (reportId: string, reportData: any) => {
      try {
        const response = reportServer.updateReport(reportId, reportData);
        return response;
      } catch (error) {
        console.error('Error updating report:', error);
        return { success: false, error };
      }
    },
    // Delete report
    deleteReport: async (reportId: string) => {
      try {
        const response = reportServer.deleteReport(reportId);
        return response;
      } catch (error) {
        console.error('Error deleting report:', error);
        return { success: false, error };
      }
    }
  },
};

export default api;
