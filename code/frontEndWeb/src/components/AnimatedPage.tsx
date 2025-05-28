import React from "react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ 
  children, 
  className = "min-h-screen bg-gray-50" 
}) => {
  const { pageVariants } = useAnimations();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};