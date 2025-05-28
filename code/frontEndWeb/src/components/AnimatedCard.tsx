import React from "react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = "",
  enableHover = true,
  onClick
}) => {
  const { cardVariants } = useAnimations();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover={enableHover ? "hover" : undefined}
      whileTap="tap"
      variants={cardVariants}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};