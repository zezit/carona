
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock data for users with updated fields
const mockUsers: User[] = [
  {
    id: "1",
    nome: "Ana Silva",
    email: "ana.silva@sga.pucminas.br",
    dataDeNascimento: "1998-04-15",
    matricula: "00123456",
    avaliacaoMedia: 4.8,
    status: "PENDENTE"
  },
  {
    id: "2",
    nome: "Pedro Oliveira",
    email: "pedro.oliveira@sga.pucminas.br",
    dataDeNascimento: "1999-07-22",
    matricula: "00234567",
    avaliacaoMedia: 4.5,
    status: "PENDENTE"
  },
  {
    id: "3",
    nome: "Mariana Costa",
    email: "mariana.costa@sga.pucminas.br",
    dataDeNascimento: "2000-03-10",
    matricula: "00345678",
    avaliacaoMedia: 4.9,
    status: "APROVADO"
  },
  {
    id: "4",
    nome: "Lucas Martins",
    email: "lucas.martins@sga.pucminas.br",
    dataDeNascimento: "1997-11-05",
    matricula: "00456789",
    avaliacaoMedia: 4.7,
    status: "APROVADO"
  },
  {
    id: "5",
    nome: "Juliana Santos",
    email: "juliana.santos@sga.pucminas.br",
    dataDeNascimento: "1999-09-18",
    matricula: "00567890",
    avaliacaoMedia: 3.8,
    status: "REJEITADO"
  },
  {
    id: "6",
    nome: "Rafael Almeida",
    email: "rafael.almeida@sga.pucminas.br",
    dataDeNascimento: "2001-02-27",
    matricula: "00678901",
    avaliacaoMedia: 4.0,
    status: "PENDENTE"
  },
  {
    id: "7",
    nome: "Carolina Lima",
    email: "carolina.lima@sga.pucminas.br",
    dataDeNascimento: "1998-08-14",
    matricula: "00789012",
    avaliacaoMedia: 3.7,
    status: "CANCELADO"
  },
  {
    id: "8",
    nome: "João Pereira",
    email: "joao.pereira@sga.pucminas.br",
    dataDeNascimento: "1996-12-03",
    matricula: "00890123",
    avaliacaoMedia: 4.2,
    status: "APROVADO"
  }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be a fetch call to your API
        setUsers(mockUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Erro ao carregar usuários");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const pendingUsers = users.filter(user => user.status === "PENDENTE");
  const approvedUsers = users.filter(user => user.status === "APROVADO");

  const approveUser = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: "APROVADO" } : user
      ));
      
      toast.success("Usuário aprovado com sucesso!");
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: "REJEITADO" } : user
      ));
      
      toast.success("Usuário rejeitado com sucesso!");
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: "CANCELADO" } : user
      ));
      
      toast.success("Usuário bloqueado com sucesso!");
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: "APROVADO" } : user
      ));
      
      toast.success("Usuário desbloqueado com sucesso!");
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(users.filter(user => user.id !== id));
      
      toast.success("Usuário excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao excluir usuário");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
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
        filterUsers
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
