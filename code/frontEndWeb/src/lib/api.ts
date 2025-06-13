import axios from 'axios';
import { reportServer } from '@/mocks/reportServer';
import { CreateReportDTO, MetricData, UpdateReportDTO } from '@/types/report';
import { ApiResponse } from '@/types/report';

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
    //  validateToken: () => {
    //   const token = localStorage.getItem('adminToken');
    //   const user = localStorage.getItem('adminUser');
      
    //   if (token && user) {
    //     try {
    //       const userData = JSON.parse(user);
    //       return { 
    //         success: true, 
    //         data: { 
    //           valid: true, 
    //           user: userData 
    //         } 
    //       };
    //     } catch (error) {
    //       console.error('Error parsing user data:', error);
    //       localStorage.removeItem('adminToken');
    //       localStorage.removeItem('adminUser');
    //       return { success: false, error: 'Invalid user data' };
    //     }
    //   }
      
    //   return { success: false, error: 'No token found' };
    // },
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
    // Get all rides/caronas with pagination, optional status filtering, and search
    getAllRides: async (page: number = 0, size: number = 10, status?: string, search?: string) => {
      try {
        let url = `/admin/caronas?page=${page}&size=${size}&sort=dataHoraPartida,desc`;
        if (status && status !== 'all') {
          url += `&status=${status}`;
        }
        if (search && search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        const response = await apiClient.get(url);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error fetching all rides:', error);
        return { success: false, error };
      }
    },
  },
  reports: {
    getAllReports: async (): Promise<ApiResponse<Report[]>> => {
      try {
        const response = await apiClient.get('/reports');
        return { 
          success: true, 
          data: response.data.data || response.data || []
        };
      } catch (error: any) {
        console.error('Error fetching reports:', error);
        return { 
          success: false, 
          error,
          message: error.response?.data?.message || 'Erro ao buscar relatórios'
        };
      }
    },
    // Get report by ID
    getReportById: async (reportId: string): Promise<ApiResponse<Report>> => {
      try {
        const response = await apiClient.get(`/reports/${reportId}`);
        return { 
          success: true, 
          data: response.data.data || response.data
        };
      } catch (error: any) {
        console.error('Error fetching report:', error);
        return { 
          success: false, 
          error,
          message: error.response?.data?.message || 'Erro ao buscar relatório'
        };
      }
    },
    // Create new report
    createReport: async (reportData: CreateReportDTO): Promise<ApiResponse<Report>> => {
      try {
        const response = await apiClient.post('/reports', reportData);
        return { 
          success: true, 
          data: response.data.data || response.data
        };
      } catch (error: any) {
        console.error('Error creating report:', error);
        return { 
          success: false, 
          error,
          message: error.response?.data?.message || 'Erro ao criar relatório'
        };
      }
    },
    // Update report
    updateReport: async (reportId: string, reportData: UpdateReportDTO): Promise<ApiResponse<Report>> => {
      try {
        const response = await apiClient.put(`/reports/${reportId}`, reportData);
        return { 
          success: true, 
          data: response.data.data || response.data
        };
      } catch (error: any) {
        console.error('Error updating report:', error);
        return { 
          success: false, 
          error,
          message: error.response?.data?.message || 'Erro ao atualizar relatório'
        };
      }
    },
    // Delete report
    deleteReport: async (reportId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await apiClient.delete(`/reports/${reportId}`);
        return { 
          success: true, 
          data: response.data
        };
      } catch (error: any) {
        console.error('Error deleting report:', error);
        return { 
          success: false, 
          error,
          message: error.response?.data?.message || 'Erro ao deletar relatório'
        };
      }
    },
    // Approve report
    approveReport: async (reportId: string): Promise<ApiResponse<Report>> => {
      try {
        const response = await apiClient.patch(`/reports/${reportId}/approve`);
        return { 
          success: true, 
          data: response.data.data || response.data
        };
      } catch (error: any) {
        console.error('Error approving report:', error);
        return { 
          success: false, 
          error,
          message: error.response?.data?.message || 'Erro ao aprovar relatório'
        };
      }
    },
    // Reject report
    rejectReport: async (reportId: string): Promise<ApiResponse<Report>> => {
      try {
        const response = await apiClient.patch(`/reports/${reportId}/reject`);
        return { 
          success: true, 
          data: response.data.data || response.data
        };
      } catch (error: any) {
        console.error('Error rejecting report:', error);
        return { 
          success: false, 
          error,
          message: error.response?.data?.message || 'Erro ao rejeitar relatório'
        };
      }
    },
    // Get ride metrics for charts
    getRideMetrics: async (period: 'daily' | 'weekly' | 'monthly'): Promise<ApiResponse<MetricData[]>> => {
      try {
        const response = await apiClient.get(`/reports/metrics?period=${period}`);
        return {
          success: true,
          data: response.data.data || response.data || []
        };
      } catch (error: any) {
        console.error('Error fetching ride metrics:', error);
        return {
          success: false,
          error,
          message: error.response?.data?.message || 'Erro ao buscar métricas',
          data: []
        };
      }
    },
    // Get dashboard summary
    getDashboardSummary: async (): Promise<ApiResponse<any>> => {
      try {
        const response = await apiClient.get('/reports/dashboard');
        return {
          success: true,
          data: response.data.data || response.data
        };
      } catch (error: any) {
        console.error('Error fetching dashboard summary:', error);
        return {
          success: false,
          error,
          message: error.response?.data?.message || 'Erro ao buscar resumo do dashboard'
        };
      }
    },
    // Get ride statistics for dashboard
    getRideStats: async () => {
      try {
        const response = await apiClient.get('/admin/caronas/stats');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error fetching ride stats:', error);
        return { success: false, error };
      }
    },
  },
  denuncias: {
  // Get all denúncias with optional filters
  getAllDenunciasByStatus: async (status?: string, page: number = 0, size: number = 10) => {
  try {
    let url = `/denuncia/status?page=${page}&size=${size}&sort=dataHora,desc`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    const response = await apiClient.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching denúncias:', error);
    return { success: false, error };
  }
},


  // Get denúncia by ID
  getDenunciaById: async (denunciaId: string) => {
    try {
      const response = await apiClient.get(`/denuncias/${denunciaId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching denúncia:', error);
      return { success: false, error };
    }
  },

  // Resolve a denúncia
  resolveDenuncia: async (denunciaId: string, resolucao: string) => {
    try {
      const response = await apiClient.patch(`/denuncias/${denunciaId}/resolver`, {
        resolucao
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error resolving denúncia:', error);
      return { success: false, error };
    }
  },

  // Archive a denúncia
  arquivarDenuncia: async (denunciaId: string, motivo?: string) => {
    try {
      const response = await apiClient.patch(`/denuncias/${denunciaId}/arquivar`, {
        motivo
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error archiving denúncia:', error);
      return { success: false, error };
    }
  },

  // Get denúncias statistics
  getDenunciasStats: async () => {
    try {
      const response = await apiClient.get('/denuncias/stats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching denúncias stats:', error);
      return { success: false, error };
    }
  },

  // Search denúncias
  searchDenuncias: async (query: string, status?: string, tipo?: string, page: number = 0, size: number = 10) => {
    try {
      let url = `/denuncias/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`;
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      if (tipo && tipo !== 'all') {
        url += `&tipo=${tipo}`;
      }
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error searching denúncias:', error);
      return { success: false, error };
    }
  }
}
};

export default api;
