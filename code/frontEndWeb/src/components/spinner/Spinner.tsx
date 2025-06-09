import React from "react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

// Spinner de Roda de Carro
export const CarWheelSpinner: React.FC = () => {
  const { wheelRotation } = useAnimations();

  return (
    <div className="relative w-24 h-24">
      {/* Pneu externo */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-slate-800 bg-gradient-to-br from-slate-700 to-slate-900"
        variants={wheelRotation}
        animate="animate"
      >
        {/* Aro da roda */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-lg">
          {/* Raios da roda */}
          {[0, 60, 120, 180, 240, 300].map((angle, index) => (
            <div
              key={index}
              className="absolute w-0.5 h-6 bg-blue-200 top-1/2 left-1/2 origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${angle}deg)`
              }}
            />
          ))}
          
          {/* Centro da roda */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 shadow-inner">
            <div className="absolute inset-2 rounded-full bg-slate-200 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Efeito de movimento */}
      <motion.div
        className="absolute inset-1 rounded-full border-2 border-blue-400 opacity-30"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity
        }}
      />
    </div>
  );
};

// Spinner de Velocímetro
export const SpeedometerSpinner: React.FC = () => {
  const { speedometerVariants } = useAnimations();

  return (
    <div className="relative w-20 h-20">
      {/* Base do velocímetro */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-blue-500">
        {/* Marcações do velocímetro */}
        {[0, 30, 60, 90, 120, 150, 180].map((angle, index) => (
          <div
            key={index}
            className={`absolute w-0.5 h-3 top-1 left-1/2 origin-bottom ${
              index > 4 ? 'bg-red-400' : 'bg-blue-300'
            }`}
            style={{
              transform: `translateX(-50%) rotate(${angle}deg)`,
              transformOrigin: '50% 36px'
            }}
          />
        ))}
        
        {/* Ponteiro */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-red-500 origin-bottom shadow-lg"
          style={{ transformOrigin: '50% 100%' }}
          variants={speedometerVariants}
          animate="animate"
        />
        
        {/* Centro */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
      </div>
      
      {/* Display digital */}
      <motion.div
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-mono text-blue-400 bg-slate-900 px-1 rounded"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity
        }}
      >
        KM/H
      </motion.div>
    </div>
  );
};

// Spinner de Motor de Carro
export const CarEngineSpinner: React.FC = () => {
  const { enginePulse } = useAnimations();

  return (
    <div className="relative w-20 h-20">
      {/* Bloco do motor */}
      <motion.div
        className="absolute inset-2 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-lg shadow-2xl"
        variants={enginePulse}
        animate="animate"
      >
        {/* Cilindros */}
        {[0, 1].map((row) => (
          <div key={row} className="flex justify-center pt-2">
            {[0, 1, 2].map((col) => (
              <motion.div
                key={col}
                className="w-2 h-3 bg-blue-500 rounded-t-sm mx-0.5 mb-1"
                animate={{
                  scaleY: [1, 1.3, 1],
                  backgroundColor: ["#3b82f6", "#60a5fa", "#3b82f6"]
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: (row * 3 + col) * 0.1
                }}
              />
            ))}
          </div>
        ))}
      </motion.div>
      
      {/* Ondas de calor */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-lg border border-blue-400 opacity-20"
          animate={{
            scale: [1, 1.5],
            opacity: [0.4, 0]
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            repeat: Infinity,
            delay: index * 0.7
          }}
        />
      ))}
    </div>
  );
};

// Spinner de Estrada
export const RoadSpinner: React.FC = () => {
  const { roadMovement } = useAnimations();

  return (
    <div className="relative w-16 h-20 bg-slate-700 rounded-lg overflow-hidden">
      {/* Faixa central da estrada */}
      <div className="absolute left-1/2 top-0 w-0.5 h-full bg-yellow-400 transform -translate-x-1/2" />
      
      {/* Linhas tracejadas */}
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <motion.div
          key={index}
          className="absolute left-1/2 w-0.5 h-3 bg-white transform -translate-x-1/2"
          style={{ top: `${index * 15 - 10}px` }}
          variants={roadMovement}
          animate="animate"
          transition={{
            duration: 0.8,
            ease: "linear",
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
      
      {/* Carro */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg rounded-b-sm relative">
          {/* Faróis */}
          <motion.div
            className="absolute top-1 left-0.5 w-1 h-1 bg-yellow-300 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1 right-0.5 w-1 h-1 bg-yellow-300 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          
          {/* Janelas */}
          <div className="absolute top-2 left-0.5 right-0.5 h-3 bg-blue-200 rounded-sm opacity-70" />
        </div>
      </div>
    </div>
  );
};

// Spinner Minimalista - Roda Simples
export const MinimalCarSpinner: React.FC = () => {
  return (
    <motion.div
      className="w-8 h-8 border-3 border-transparent border-t-blue-500 border-r-blue-400 rounded-full relative"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: "linear",
        repeat: Infinity
      }}
    >
      <div className="absolute inset-2 border border-blue-300 rounded-full opacity-50" />
    </motion.div>
  );
};