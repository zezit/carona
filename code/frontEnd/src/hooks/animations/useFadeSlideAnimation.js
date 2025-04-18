import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook for fade and slide animations
 * @param {Object} options - Animation options
 * @param {number} options.fadeStartValue - Starting value for fade animation (default: 0)
 * @param {number} options.fadeEndValue - End value for fade animation (default: 1)
 * @param {number} options.slideStartValue - Starting value for slide animation (default: 50)
 * @param {number} options.slideEndValue - End value for slide animation (default: 0)
 * @param {number} options.fadeDuration - Duration of fade animation in ms (default: 400)
 * @param {number} options.slideDuration - Duration of slide animation in ms (default: 300)
 * @param {boolean} options.useNativeDriver - Whether to use native driver (default: true)
 * @param {boolean} options.autoStart - Whether to start animation automatically (default: true)
 * @returns {Object} Animation values and style object
 */
const useFadeSlideAnimation = (options = {}) => {
  const {
    fadeStartValue = 0,
    fadeEndValue = 1,
    slideStartValue = 50,
    slideEndValue = 0,
    fadeDuration = 400,
    slideDuration = 300,
    useNativeDriver = true,
    autoStart = true,
  } = options;

  const fadeAnim = useRef(new Animated.Value(fadeStartValue)).current;
  const slideAnim = useRef(new Animated.Value(slideStartValue)).current;

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: fadeEndValue,
        duration: fadeDuration,
        useNativeDriver,
      }),
      Animated.timing(slideAnim, {
        toValue: slideEndValue,
        duration: slideDuration,
        useNativeDriver,
      })
    ]).start();
  };

  const resetAnimation = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: fadeStartValue,
        duration: fadeDuration / 2,
        useNativeDriver,
      }),
      Animated.timing(slideAnim, {
        toValue: slideStartValue,
        duration: slideDuration / 2,
        useNativeDriver,
      })
    ]).start(callback);
  };

  // If autoStart is true, start animation when the component mounts
  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, []);

  // Return animation values and animated style object
  return {
    fadeAnim,
    slideAnim,
    startAnimation,
    resetAnimation,
    animatedStyle: {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }
  };
};

export default useFadeSlideAnimation;