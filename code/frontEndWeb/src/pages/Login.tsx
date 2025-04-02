import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { md5Hash } from "@/utils/crypto";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      navigate("/approval");
    }
  }, [isAuthenticated, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      // Hash the password with MD5 before sending to the server
      const hashedPassword = md5Hash(password);
      await login(email, hashedPassword);
      // Navigation is handled in the auth context or by the effect above
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 page-transition">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card rounded-lg sm:px-10 glass-panel">
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-carona-600 flex items-center justify-center text-white text-xl font-bold">
                C
              </div>
            </div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
              Carona<span className="text-carona-600">?</span>
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sistema de Administração
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@carona.com"
                  className="transition-all duration-200 focus:ring-carona-500 focus:border-carona-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="transition-all duration-200 focus:ring-carona-500 focus:border-carona-500 pr-10"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="text-sm mt-2 text-right">
                <a href="#" className="font-medium text-carona-600 hover:text-carona-500">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-carona-600 hover:bg-carona-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-carona-500 transition-all duration-200 ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin-slow mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Entrar
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="text-center text-xs text-gray-500">
              <p>Use admin@carona.com / admin123 para demonstração</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
