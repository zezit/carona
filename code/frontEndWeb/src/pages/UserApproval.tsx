
import React, { useState } from "react";
import { useUsers, User } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import UserCard from "@/components/UserCard";
import UserDetails from "@/components/UserDetails";
import ConfirmModal from "@/components/ConfirmModal";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

const UserApproval = () => {
  const { isAuthenticated } = useAuth();
  const { pendingUsers, approveUser, rejectUser, isLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: "approve" | "reject";
    userId: string;
  }>({
    isOpen: false,
    type: "approve",
    userId: "",
  });
  const [filteredUsers, setFilteredUsers] = useState<User[]>(pendingUsers);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleCloseUserDetails = () => {
    setIsUserDetailsOpen(false);
    setSelectedUser(null);
  };

  const handleApproveClick = (userId: string) => {
    setConfirmAction({
      isOpen: true,
      type: "approve",
      userId,
    });
  };

  const handleRejectClick = (userId: string) => {
    setConfirmAction({
      isOpen: true,
      type: "reject",
      userId,
    });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction.type === "approve") {
        await approveUser(confirmAction.userId);
      } else {
        await rejectUser(confirmAction.userId);
      }
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const handleFilter = (query: string, status?: string) => {
    // Para a página de aprovação, queremos mostrar apenas usuários pendentes
    // mas ainda permitimos a filtragem por nome/email
    const filtered = pendingUsers.filter(user => {
      const matchesQuery = query 
        ? user.nome.toLowerCase().includes(query.toLowerCase()) || 
          user.email.toLowerCase().includes(query.toLowerCase())
        : true;
      
      return matchesQuery;
    });
    
    setFilteredUsers(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aprovação de Usuários</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as solicitações pendentes de usuários
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => handleFilter("", "")}
            className="flex items-center text-gray-700"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <FilterBar 
          onFilterChange={handleFilter} 
          showStatusFilter={false}
        />

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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Nenhuma solicitação pendente
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Não há novos usuários aguardando aprovação no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                onView={handleViewUser}
                mode="approval"
              />
            ))}
          </div>
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
          confirmAction.type === "approve"
            ? "Confirmar Aprovação"
            : "Confirmar Rejeição"
        }
        description={
          confirmAction.type === "approve"
            ? "Tem certeza que deseja aprovar este usuário? Ele terá acesso a todas as funcionalidades da plataforma."
            : "Tem certeza que deseja rejeitar este usuário? Ele não poderá acessar a plataforma."
        }
        confirmText={confirmAction.type === "approve" ? "Aprovar" : "Rejeitar"}
        variant={confirmAction.type === "reject" ? "destructive" : "default"}
      />
    </div>
  );
};

export default UserApproval;
