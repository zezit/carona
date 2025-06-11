import React from "react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

interface LoadingTextProps {
  text: string;
}

export const LoadingText: React.FC<LoadingTextProps> = ({ text }) => {
  const { textVariants, headlightBlink } = useAnimations();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={textVariants}
      className="text-center"
    >
      <p className="text-lg font-medium text-slate-700 mb-2">{text}</p>
      <motion.div
        className="flex space-x-1 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Faróis piscando como indicador de loading */}
        {[0, 1, 2].map((light) => (
          <motion.div
            key={light}
            className="w-2 h-2 bg-blue-500 rounded-full shadow-lg"
            variants={headlightBlink}
            animate="animate"
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              delay: light * 0.2
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};