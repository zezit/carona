
import { Variants } from "framer-motion";

export const useAnimations = () => {
  // Animações para páginas
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      } 
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      } 
    }
  };

  // Animações para cards
  const cardVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.03, 
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      } 
    },
    tap: { scale: 0.98 }
  };

  // Animações para loading
const containerVariants: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const textVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3,
        duration: 0.4
      }
    }
  };

  // Animação de roda girando
  const wheelRotation: Variants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  // Animação do velocímetro
  const speedometerVariants: Variants = {
    animate: {
      rotate: [0, 180, 0],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  // Animação de pulso do motor
  const enginePulse: Variants = {
    animate: {
      scale: [1, 1.1, 1],
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.3)",
        "0 0 40px rgba(59, 130, 246, 0.6)",
        "0 0 20px rgba(59, 130, 246, 0.3)"
      ],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  // Animação de ondas do radar
  const radarWaves: Variants = {
    animate: {
      scale: [1, 3],
      opacity: [0.8, 0],
      transition: {
        duration: 2.5,
        ease: "easeOut",
        repeat: Infinity
      }
    }
  };

  // Animação de estrada em movimento
  const roadMovement: Variants = {
    animate: {
      y: [0, 20],
      transition: {
        duration: 0.8,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  // Animação dos faróis piscando
  const headlightBlink: Variants = {
    animate: {
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };


  // Animações para modals
  const modalVariants: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { 
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  // Animações para listas (stagger)
  const listVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const listItemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Animações para botões
  const buttonVariants: Variants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  // Animações para fade in/out
  const fadeVariants: Variants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return {
    pageVariants,
    cardVariants,
    modalVariants,
    containerVariants,
    textVariants,
    wheelRotation,
    speedometerVariants,
    enginePulse,
    radarWaves,
    roadMovement,
    headlightBlink,
    listVariants,
    listItemVariants,
    buttonVariants,
    fadeVariants
  };
};