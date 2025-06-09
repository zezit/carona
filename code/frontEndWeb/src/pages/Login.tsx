import React, { FormEvent, useRef, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { md5Hash } from "@/utils/crypto";
import { useBearImages } from "@/hooks/useBearImages";
import { useBearAnimation } from "@/hooks/useBearAnimation";
import BearAvatar from "@/components/BearAvatar";
import EyeIconSrc from '/src/assets/icons/eye_on.svg';
import EyeOffIconSrc from '/src/assets/icons/eye_off.svg';


export default function Login  ()  {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ email: '', password: '' });
  const { login, isLoading, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  // Urso animado
  const { watchBearImages, hideBearImages, peakBearImages } =
  useBearImages();
const {
  currentBearImage,
  setCurrentFocus,
  currentFocus,
  isAnimating,
} = useBearAnimation({
  watchBearImages,
  hideBearImages,
  peakBearImages,
  emailLength: values.email.length,
  showPassword,
});

  useEffect(() => {
    if (isAuthenticated && token) {
      navigate("/approval");
    }
  }, [isAuthenticated, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;


    if (!email || !password) {

      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      const hashedPassword = md5Hash(password);
      await login(email, hashedPassword);
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    }
  };

  const toggleShowPassword = () => {
    // Only toggle if we're not currently animating
    if (!isAnimating) {
      setShowPassword((prev) => !prev);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-carona-100 page-transition px-4">
      {/* Urso */}

      <div className="bg-white py-10 px-6 shadow-card rounded-2xl w-full max-w-md glass-panel">
        <div className="flex flex-col items-center mb-6">
          <div className="w-[130px] h-[130px] relative mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            {currentBearImage && (
              <BearAvatar
                currentImage={currentBearImage}
                key={`${currentFocus}-${values.email.length}`}
              />
            )}
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
                placeholder="admin@carona.com"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                onFocus={() => setCurrentFocus('EMAIL')}
                required
                ref={emailRef}
                value={values.email}
                onChange={handleInputChange}
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
                ref={passwordRef}
                onFocus={() => setCurrentFocus('PASSWORD')}
                value={values.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="transition-all duration-200 focus:ring-carona-500 focus:border-carona-500 pr-10"
              />
              <button  data-cy="password-toggle"
              type="button"
              onClick={toggleShowPassword}
              className={`absolute right-3 top-1/2 -translate-y-1/2
              text-gray-500 focus:outline-none transition-all duration-300
              hover:text-gray-700`}
            >
              {showPassword ? (
                <img
                  src={EyeOffIconSrc}
                  alt="Hide password"
                  className="w-5 h-5 transition-transform transform rotate-0 hover:scale-110"
                />
              ) : (
                <img
                  src={EyeIconSrc}
                  alt="Show password"
                  className="w-5 h-5 transition-transform transform rotate-0 hover:scale-110"
                />
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
      </div>
    </div>
  );
};