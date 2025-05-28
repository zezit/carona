import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

interface AnimatedModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({ 
  children, 
  isOpen,
  className = ""
}) => {
  const { modalVariants } = useAnimations();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={modalVariants}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};