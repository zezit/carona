import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Index = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento da página
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  if (authLoading) {
    <LoadingSpinner/>
  }


  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }
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

  if (isLoading) {
    return (
     <LoadingSpinner/>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gray-50"
    >
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Administração - Carona?
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie usuários e aprovações de cadastros
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <motion.div 
            whileHover="hover"
            variants={cardVariants}
            className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow"
          >
            <div className="bg-carona-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 pointer-events-none">
              <CheckSquare className="w-8 h-8 text-carona-600" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-4">Aprovações de Usuários</h2>
            <p className="text-gray-600 text-center mb-6">
              Gerencie as solicitações pendentes de cadastro de novos usuários.
            </p>
            <Button 
              className="w-full bg-carona-600 hover:bg-carona-700"
              onClick={() => handleNavigation("/approval")}
            >
              Ir para Aprovações
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover="hover"
            variants={cardVariants}
            className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow"
          >
            <div className="bg-carona-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 pointer-events-none">
              <Users className="w-8 h-8 text-carona-600" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-4">Gerenciamento de Usuários</h2>
            <p className="text-gray-600 text-center mb-6">
              Visualize e gerencie todos os usuários cadastrados na plataforma.
            </p>
            <Button 
              className="w-full bg-carona-600 hover:bg-carona-700"
              onClick={() => handleNavigation("/users")}
            >
              Ir para Usuários
            </Button>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
};

export default Index;