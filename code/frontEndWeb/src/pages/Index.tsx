
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Administração - Carona?
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie usuários e aprovações de cadastros
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="bg-carona-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckSquare className="w-8 h-8 text-carona-600" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-4">Aprovações de Usuários</h2>
            <p className="text-gray-600 text-center mb-6">
              Gerencie as solicitações pendentes de cadastro de novos usuários.
            </p>
            <Button 
              className="w-full bg-carona-600 hover:bg-carona-700"
              onClick={() => navigate("/approval")}
            >
              Ir para Aprovações
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="bg-carona-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-carona-600" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-4">Gerenciamento de Usuários</h2>
            <p className="text-gray-600 text-center mb-6">
              Visualize e gerencie todos os usuários cadastrados na plataforma.
            </p>
            <Button 
              className="w-full bg-carona-600 hover:bg-carona-700"
              onClick={() => navigate("/users")}
            >
              Ir para Usuários
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
