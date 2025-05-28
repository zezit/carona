import React from "react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = "Carregando...",
  className = "flex items-center justify-center min-h-screen bg-gray-50"
}) => {
  const { loadingVariants } = useAnimations();

  return (
    <div className={className}>
      <motion.div
        initial="initial"
        animate="animate"
        variants={loadingVariants}
        className="text-carona-600 text-xl font-medium flex flex-col items-center"
      >
        <div className="animate-spin-slow h-8 w-8 border-4 border-carona-500 border-t-transparent rounded-full mb-4"></div>
        {text}
      </motion.div>
    </div>
  );
};