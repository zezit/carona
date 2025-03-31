
// This is a mock API service
// In a real application, this would connect to your backend API

export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type ErrorResponse = {
  success: false;
  error: string;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> => {
      // Simulate API delay
      console.log("Logging in...");
      await delay(800);
      
      // Mock validation
      if (email === "admin@carona.com" && password === "admin123") {
        return {
          success: true,
          data: {
            token: "mock-jwt-token",
            user: {
              id: "1",
              name: "Administrador",
              email,
              role: "admin"
            }
          }
        };
      }
      
      return {
        success: false,
        error: "Credenciais inválidas"
      };
    },
    logout: async (): Promise<ApiResponse<null>> => {
      await delay(300);
      return {
        success: true,
        data: null
      };
    }
  },
  
  users: {
    getAll: async (): Promise<ApiResponse<any[]>> => {
      await delay(1000);
      
      // Mock users data would be returned here
      return {
        success: true,
        data: [] // This would be your mock user data
      };
    },
    
    getPending: async (): Promise<ApiResponse<any[]>> => {
      await delay(800);
      
      // Mock pending users data would be returned here
      return {
        success: true,
        data: [] // This would be your mock pending user data
      };
    },
    
    approve: async (userId: string): Promise<ApiResponse<null>> => {
      await delay(500);
      return {
        success: true,
        data: null
      };
    },
    
    reject: async (userId: string): Promise<ApiResponse<null>> => {
      await delay(500);
      return {
        success: true,
        data: null
      };
    },
    
    block: async (userId: string): Promise<ApiResponse<null>> => {
      await delay(500);
      return {
        success: true,
        data: null
      };
    },
    
    unblock: async (userId: string): Promise<ApiResponse<null>> => {
      await delay(500);
      return {
        success: true,
        data: null
      };
    },
    
    delete: async (userId: string): Promise<ApiResponse<null>> => {
      await delay(700);
      return {
        success: true,
        data: null
      };
    },
    
    update: async (userId: string, data: any): Promise<ApiResponse<null>> => {
      await delay(600);
      return {
        success: true,
        data: null
      };
    }
  }
};
