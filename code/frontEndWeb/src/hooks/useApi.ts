import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type ApiResponse<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export function useApi() {
  const { logout } = useAuth();
  
  // Generic function to handle API calls with proper error handling
  const callApi = async <T>(
    apiFunction: () => Promise<{ success: boolean; data?: any; error?: any }>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<ApiResponse<T>> => {
    const [state, setState] = useState<ApiResponse<T>>({
      data: null,
      isLoading: false,
      error: null,
    });

    setState({ ...state, isLoading: true });

    try {
      const response = await apiFunction();
      
      if (response.success) {
        if (successMessage) {
          toast.success(successMessage);
        }
        setState({ data: response.data, isLoading: false, error: null });
        return { data: response.data, isLoading: false, error: null };
      } else {
        // Handle 401 (Unauthorized) errors by logging out
        if (response.error?.response?.status === 401) {
          logout();
        }
        
        throw new Error(response.error?.response?.data?.message || 'Something went wrong');
      }
    } catch (error: any) {
      toast.error(errorMessage || error.message || 'An error occurred');
      setState({ data: null, isLoading: false, error });
      return { data: null, isLoading: false, error };
    }
  };

  // Export API functions to be used with proper error handling
  return {
    auth: {
      login: (email: string, password: string) => 
        callApi<{ token: string }>(() => api.auth.login(email, password)),
      validateToken: () => 
        callApi<{ valid: boolean, email: string, id: string }>(() => api.auth.validateToken()),
    },
    admin: {
      getPendingUsers: () => 
        callApi<any[]>(() => api.admin.getPendingUsers(), undefined, 'Failed to fetch pending users'),
      reviewUser: (userId: number, status: string) => 
        callApi<void>(() => api.admin.reviewUser(userId, status), 'User reviewed successfully', 'Failed to review user'),
      getAdminDetails: (adminId: string) => 
        callApi<any>(() => api.admin.getAdminDetails(adminId), undefined, 'Failed to fetch admin details'),
      getAllUsers: () => 
        callApi<any[]>(() => api.admin.getAllUsers(), undefined, 'Failed to fetch users'),
    },
  };
}
