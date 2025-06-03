import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { api, apiClient } from "@/lib/api";
import { md5Hash } from "@/utils/crypto";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("adminToken");
        
        if (storedToken) {
          // Set token in state
          setToken(storedToken);
          
          // Validate token and get admin data from backend
          try {
            const response = await api.auth.validateToken();
            
            if (response.success && response.data) {
              const userData = {
                id: response.data.userId?.toString() || "",
                email: response.data.email,
                name: response.data.email.split('@')[0], // Fallback if name is not provided
                role: 'ADMIN'
              };
              
              setAdmin(userData);
              localStorage.setItem("admin", JSON.stringify(userData));
              
              // If we're on the login page with a valid token, redirect to approval page
              if (location.pathname === '/' || location.pathname === '/login') {
                navigate('/approval');
              }
            }
          } catch (validationError) {
            console.error("Token validation error:", validationError);
            // If token validation fails, clean up
            localStorage.removeItem("adminToken");
            localStorage.removeItem("admin");
          }
        } else {
          const storedAdmin = localStorage.getItem("admin");
          if (storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Use the API client from api.ts
      const response = await api.auth.login(email, password);
      
      if (response.success && response.data && response.data.token) {
        const jwtToken = response.data.token;
        
        // Store token
        localStorage.setItem("adminToken", jwtToken);
        setToken(jwtToken);
        
        // Get admin data from token or backend
        try {
          const userResponse = await api.auth.validateToken();
          
          if (userResponse.success && userResponse.data) {
            const userData = {
              id: userResponse.data.userId?.toString() || "",
              email: userResponse.data.email,
              name: userResponse.data.email.split('@')[0], // Fallback if name is not provided
              role: 'ADMIN'
            };
            
            setAdmin(userData);
            localStorage.setItem("admin", JSON.stringify(userData));
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          throw new Error("Failed to get user data");
        }
        
        toast.success("Login realizado com sucesso!");
        navigate("/approval");
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};