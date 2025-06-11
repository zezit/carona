import React from "react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";
import { 
  CarWheelSpinner, 
  SpeedometerSpinner, 
  CarEngineSpinner, 
  RoadSpinner, 
  MinimalCarSpinner 
} from "@/components/spinner/Spinner";
import { LoadingText } from "@/components/spinner/LoadingText";

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
  variant?: "wheel" | "speedometer" | "engine" | "road" | "minimal";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = "Carregando...",
  className = "flex items-center justify-center min-h-screen",
  variant = "wheel"
}) => {
  const { containerVariants } = useAnimations();

  const renderSpinner = () => {
    switch (variant) {
      case "speedometer":
        return <SpeedometerSpinner />;
      case "engine":
        return <CarEngineSpinner />;
      case "road":
        return <RoadSpinner />;
      case "minimal":
        return <MinimalCarSpinner />;
      default:
        return <CarWheelSpinner />;
    }
  };

  return (
    <div className={`${className} bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100`}>
      <motion.div
        initial="initial"
        animate="animate"
        variants={containerVariants}
        className="flex flex-col items-center justify-center space-y-6"
      >
        {/* Spinner */}
        <div className="relative">
          {renderSpinner()}
          
          {/* Brilho azul de fundo */}
          <div className="absolute inset-0 -z-10 bg-blue-500/10 rounded-full blur-xl scale-150" />
        </div>
        
        {/* Texto animado */}
        <LoadingText text={text} />
        
        {/* Indicador de velocidade */}
        <motion.div
          className="text-xs text-slate-500 font-mono flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span>Dirigindo pelos seus dados...</span>
        </motion.div>
      </motion.div>
    </div>
  );
};