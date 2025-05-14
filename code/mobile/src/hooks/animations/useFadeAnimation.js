import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook for simple fade animation
 * @param {Object} options - Animation options
 * @param {number} options.startValue - Starting value for fade animation (default: 0)
 * @param {number} options.endValue - End value for fade animation (default: 1)
 * @param {number} options.duration - Duration of fade animation in ms (default: 600)
 * @param {boolean} options.useNativeDriver - Whether to use native driver (default: true)
 * @param {boolean} options.autoStart - Whether to start animation automatically (default: true)
 * @returns {Object} Animation value and control functions
 */
const useFadeAnimation = (options = {}) => {
  const {
    startValue = 0,
    endValue = 1,
    duration = 600,
    useNativeDriver = true,
    autoStart = true,
  } = options;

  const fadeAnim = useRef(new Animated.Value(startValue)).current;

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: endValue,
      duration: duration,
      useNativeDriver,
    }).start();
  };

  const resetAnimation = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: startValue,
      duration: duration / 2,
      useNativeDriver,
    }).start(callback);
  };

  // If autoStart is true, start animation when the component mounts
  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, []);

  return {
    fadeAnim,
    startAnimation,
    resetAnimation,
    animatedStyle: {
      opacity: fadeAnim
    }
  };
};

export default useFadeAnimation;