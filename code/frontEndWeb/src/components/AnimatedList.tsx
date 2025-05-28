import React from "react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ 
  children, 
  className = "" 
}) => {
  const { listVariants } = useAnimations();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={listVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ 
  children, 
  className = "" 
}) => {
  const { listItemVariants } = useAnimations();

  return (
    <motion.div
      variants={listItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};