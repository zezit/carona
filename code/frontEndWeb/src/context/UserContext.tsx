import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

export type User = {
  id: string;
  nome: string;
  email: string;
  dataDeNascimento: string;
  matricula: string;
  avaliacaoMedia: number;
  status: "PENDENTE" | "APROVADO" | "REJEITADO" | "CANCELADO" | "FINALIZADO";
};

type UserContextType = {
  users: User[];
  pendingUsers: User[];
  approvedUsers: User[];
  isLoading: boolean;
  approveUser: (id: string) => Promise<void>;
  rejectUser: (id: string) => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  getUser: (id: string) => User | undefined;
  filterUsers: (query: string, status?: string) => User[];
  fetchAllUsers: () => Promise<void>;
  fetchPendingUsers: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to fetch all users from the backend
  const fetchAllUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await api.admin.getAllStudents();
      if (response.success && response.data) {
        // Map the response data to match our User type
        const formattedUsers = response.data.map((user: any) => ({
          id: user.id.toString(),
          nome: user.nome,
          email: user.email,
          dataDeNascimento: user.dataDeNascimento,
          matricula: user.matricula || '',
          avaliacaoMedia: user.avaliacaoMedia || 0,
          status: user.statusCadastro,
        }));
        
        setUsers(formattedUsers);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Function to fetch pending users from the backend
  const fetchPendingUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await api.admin.getPendingUsers();
      
      if (response.success && response.data) {
        // Map the response data to match our User type
        const formattedUsers = response.data.map((user: any) => ({
          id: user.id.toString(),
          nome: user.nome,
          email: user.email,
          dataDeNascimento: user.dataDeNascimento,
          matricula: user.matricula || '',
          avaliacaoMedia: user.avaliacaoMedia || 0,
          status: "PENDENTE",
        }));
        
        setPendingUsers(formattedUsers);
      } else {
        throw new Error("Failed to fetch pending users");
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
      toast.error("Erro ao carregar usuários pendentes");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch all users and pending users when component mounts and authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllUsers();
      fetchPendingUsers();
    }
  }, [isAuthenticated, fetchAllUsers, fetchPendingUsers]);

  // Get approved users from the users list
  const approvedUsers = users.filter(user => user.status === "APROVADO");

  const approveUser = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api.admin.reviewUser(id, "APROVADO");
      
      if (response.success) {
        // Update local state
        setPendingUsers(prev => prev.filter(user => user.id !== id));
        setUsers(prev => 
          prev.map(user => 
            user.id === id ? { ...user, status: "APROVADO" } : user
          )
        );
        
        // Refresh lists
        await fetchPendingUsers();
        await fetchAllUsers();
        
        toast.success("Usuário aprovado com sucesso!");
      } else {
        throw new Error("Failed to approve user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Erro ao aprovar usuário");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectUser = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api.admin.reviewUser(id, "REJEITADO");
      
      if (response.success) {
        // Update local state
        setPendingUsers(prev => prev.filter(user => user.id !== id));
        setUsers(prev => 
          prev.map(user => 
            user.id === id ? { ...user, status: "REJEITADO" } : user
          )
        );
        
        // Refresh lists
        await fetchPendingUsers();
        await fetchAllUsers();
        
        toast.success("Usuário rejeitado com sucesso!");
      } else {
        throw new Error("Failed to reject user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Erro ao rejeitar usuário");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api.admin.blockStudent(id);
      
      if (response.success) {
        // Update local state
        setUsers(prev => 
          prev.map(user => 
            user.id === id ? { ...user, status: "CANCELADO" } : user
          )
        );
        
        // Refresh list
        await fetchAllUsers();
        
        toast.success("Usuário bloqueado com sucesso!");
      } else {
        throw new Error("Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Erro ao bloquear usuário");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unblockUser = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api.admin.unblockStudent(id);
      
      if (response.success) {
        // Update local state
        setUsers(prev => 
          prev.map(user => 
            user.id === id ? { ...user, status: "APROVADO" } : user
          )
        );
        
        // Refresh list
        await fetchAllUsers();
        
        toast.success("Usuário desbloqueado com sucesso!");
      } else {
        throw new Error("Failed to unblock user");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Erro ao desbloquear usuário");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api.admin.deleteStudent(id);
      
      if (response.success) {
        // Update local state
        setUsers(prev => prev.filter(user => user.id !== id));
        
        // Refresh list
        await fetchAllUsers();
        
        toast.success("Usuário excluído com sucesso!");
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao excluir usuário");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    // Not implemented with backend yet
    setIsLoading(true);
    try {
      // Mock for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, ...data } : user
      ));
      
      toast.success("Usuário atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUser = (id: string) => {
    return users.find(user => user.id === id);
  };

  const filterUsers = (query: string, status?: string) => {
    return users.filter(user => {
      const matchesQuery = query 
        ? user.nome.toLowerCase().includes(query.toLowerCase()) || 
          user.email.toLowerCase().includes(query.toLowerCase())
        : true;
        
      const matchesStatus = status 
        ? user.status === status
        : true;
        
      return matchesQuery && matchesStatus;
    });
  };

  return (
    <UserContext.Provider
      value={{
        users,
        pendingUsers,
        approvedUsers,
        isLoading,
        approveUser,
        rejectUser,
        blockUser,
        unblockUser,
        deleteUser,
        updateUser,
        getUser,
        filterUsers,
        fetchAllUsers,
        fetchPendingUsers
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};
