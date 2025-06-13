
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Users, CheckSquare, Home, BarChart3, FileText, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Navbar: React.FC = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  
  if (!admin) return null;

  const handleLogout = () => {
    logout();
    toast("Sessão encerrada com sucesso!");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-carona-600 flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Carona<span className="text-carona-600">?</span> <span className="text-gray-500 text-sm">Admin</span>
              </span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-1">
            <Link 
              to="/home" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/home") 
                  ? "bg-carona-50 text-carona-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Home className="w-4 h-4" />
                <span>Início</span>
              </div>
            </Link>
            
            <Link 
              to="/approval" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/approval") 
                  ? "bg-carona-50 text-carona-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <CheckSquare className="w-4 h-4" />
                <span>Aprovações</span>
              </div>
            </Link>
            
            <Link 
              to="/users" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/users") 
                  ? "bg-carona-50 text-carona-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>Usuários</span>
              </div>
            </Link>
            
            <Link 
              to="/rides" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/rides") 
                  ? "bg-carona-50 text-carona-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Car className="w-4 h-4" />
                <span>Viagens</span>
              </div>
            </Link>
            <Link 
              to="/report-test" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/report-test") 
                  ? "bg-carona-50 text-carona-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Relatórios</span>
              </div>
            </Link>

            <Link 
              to="/report" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/report") 
                  ? "bg-carona-50 text-carona-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4" />
                <span>Gráficos</span>
              </div>
            </Link>
            <Link 
              to="/denuncias-management"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/denuncias-management") 
                  ? "bg-carona-50 text-carona-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Denúncias</span>
              </div>
            </Link>
            
            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center">
              <span className="text-sm text-gray-600 mr-3">
                {admin.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
