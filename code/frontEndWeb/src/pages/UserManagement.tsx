import React, { useState, useEffect } from "react";
import { useUsers, User } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import UserCard from "@/components/UserCard";
import UserDetails from "@/components/UserDetails";
import ConfirmModal from "@/components/ConfirmModal";
import FilterBar from "@/components/FilterBar";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const UserManagement = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { users, blockUser, unblockUser, deleteUser, filterUsers, fetchAllUsers } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: "block" | "unblock" | "delete";
    userId: string;
  }>({
    isOpen: false,
    type: "block",
    userId: "",
  });
  
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 9;

  // Animações para a página e componentes
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const cardVariants = {
    hover: { scale: 1.03, transition: { duration: 0.2 } }
  };

  const handleNavigation = (path) => {
    // Pequena animação antes de navegar
    setIsLoading(true);
    setTimeout(() => {
      navigate(path);
    }, 200);
  };

  // Load all users when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isAuthenticated) {
        await fetchAllUsers();
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchAllUsers]);

  // Update filtered users when users changes
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Mostrar tela de carregamento se os dados ainda estão sendo carregados
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-carona-600 text-xl font-medium"
        >
          Carregando...
        </motion.div>
      </div>
    );
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleCloseUserDetails = () => {
    setIsUserDetailsOpen(false);
    setSelectedUser(null);
  };

  const handleBlockClick = (userId: string) => {
    setConfirmAction({
      isOpen: true,
      type: "block",
      userId,
    });
  };

  const handleUnblockClick = (userId: string) => {
    setConfirmAction({
      isOpen: true,
      type: "unblock",
      userId,
    });
  };

  const handleDeleteClick = (userId: string) => {
    setConfirmAction({
      isOpen: true,
      type: "delete",
      userId,
    });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction.type === "block") {
        await blockUser(confirmAction.userId);
      } else if (confirmAction.type === "unblock") {
        await unblockUser(confirmAction.userId);
      } else if (confirmAction.type === "delete") {
        await deleteUser(confirmAction.userId);
      }
      // Close the modal after action is completed
      setConfirmAction({ ...confirmAction, isOpen: false });
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const handleFilter = (query: string, status?: string) => {
    const filtered = filterUsers(query, status || undefined);
    setFilteredUsers(filtered);
    // Reset to the first page when filtering
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchAllUsers().finally(() => {
      setIsLoading(false);
    });
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gray-50"
    >
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os usuários cadastrados na plataforma
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center text-gray-700"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <FilterBar onFilterChange={handleFilter} />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin-slow h-8 w-8 border-4 border-carona-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-subtle p-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-carona-50 mb-4">
              <svg
                className="h-8 w-8 text-carona-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Nenhum usuário encontrado
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Tente ajustar os filtros para encontrar usuários.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {currentUsers.map((user) => (

                <motion.div
                  key={user.id}
                  whileHover="hover"
                  variants={cardVariants}
                >

                  <UserCard
                    user={user}
                    onBlock={handleBlockClick}
                    onUnblock={handleUnblockClick}
                    onDelete={handleDeleteClick}
                    onView={handleViewUser}
                    mode="management"
                  />

                </motion.div>

              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => handlePageChange(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
      
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          isOpen={isUserDetailsOpen}
          onClose={handleCloseUserDetails}
        />
      )}
      
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={
          confirmAction.type === "block"
            ? "Confirmar Bloqueio"
            : confirmAction.type === "unblock"
            ? "Confirmar Desbloqueio"
            : "Confirmar Exclusão"
        }
        description={
          confirmAction.type === "block"
            ? "Tem certeza que deseja bloquear este usuário? Ele não poderá mais acessar a plataforma até ser desbloqueado."
            : confirmAction.type === "unblock"
            ? "Tem certeza que deseja desbloquear este usuário? Ele terá acesso novamente à plataforma."
            : "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        }
        confirmText={
          confirmAction.type === "block"
            ? "Bloquear"
            : confirmAction.type === "unblock"
            ? "Desbloquear"
            : "Excluir"
        }
        variant={confirmAction.type === "delete" ? "destructive" : "default"}
      />
    </motion.div>
  );
};

export default UserManagement;