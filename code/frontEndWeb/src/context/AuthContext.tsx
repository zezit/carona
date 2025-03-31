
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await api.auth.login(email, password); // Chamando a função do arquivo api.ts
      
      if (response.success) {
        const { token, user } = response.data;
        setAdmin(user); // Salvando dados do admin após login bem-sucedido
        localStorage.setItem("admin", JSON.stringify(user));
        toast.success("Login realizado com sucesso!");
        navigate("/home");
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
    localStorage.removeItem("admin");
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
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
