import { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { useCallback } from 'react';

/**
 * useMapAnimations - Custom hook for managing map overlay animations
 * Follows SRP by handling only animation state and calculations
 */
export const useMapAnimations = () => {
  // Animated values for location button
  const locationButtonScale = useSharedValue(1);
  const locationButtonOpacity = useSharedValue(1);
  const locationButtonTranslateY = useSharedValue(0);

  // Define animated style for location button
  const locationButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: locationButtonScale.value },
        { translateY: locationButtonTranslateY.value }
      ],
      opacity: locationButtonOpacity.value,
    };
  });

  // Function to update animations based on bottom sheet position
  const updateAnimations = useCallback((bottomSheetIndex) => {
    if (bottomSheetIndex === 0) {
      // When bottom sheet is collapsed, show location button normally
      locationButtonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      locationButtonOpacity.value = withTiming(1, { duration: 200 });
      locationButtonTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    } else if (bottomSheetIndex === 1) {
      // When bottom sheet is at half position, slightly scale down
      locationButtonScale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
      locationButtonOpacity.value = withTiming(0.9, { duration: 200 });
      locationButtonTranslateY.value = withSpring(-10, { damping: 15, stiffness: 150 });
    } else {
      // When bottom sheet is fully expanded, minimize location button
      locationButtonScale.value = withSpring(0.8, { damping: 15, stiffness: 150 });
      locationButtonOpacity.value = withTiming(0.7, { duration: 200 });
      locationButtonTranslateY.value = withSpring(-20, { damping: 15, stiffness: 150 });
    }
  }, [locationButtonScale, locationButtonOpacity, locationButtonTranslateY]);

  // Pulse animation for feedback
  const pulseAnimation = useCallback(() => {
    locationButtonScale.value = withSpring(1.1, { damping: 15, stiffness: 200 }, () => {
      locationButtonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });
  }, [locationButtonScale]);

  return {
    locationButtonStyle,
    updateAnimations,
    pulseAnimation
  };
};
