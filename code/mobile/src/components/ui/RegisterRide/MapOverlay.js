import React from 'react';
import {
  Platform,
  StyleSheet,
  View
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { LocationSelector } from '../../ride';
import { COLORS, SPACING, RADIUS } from '../../../constants';

/**
 * MapOverlay - Animated overlay component for location selection on the map
 * Follows SRP by handling only the location selector overlay positioning and animation
 */
const MapOverlay = ({ 
  departure, 
  arrival, 
  onPress, 
  animatedStyle 
}) => {
  return (
    <Reanimated.View style={[styles.container, animatedStyle]}>
      <LocationSelector
        departure={departure}
        arrival={arrival}
        onPress={onPress}
      />
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 110,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    zIndex: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});

export default React.memo(MapOverlay);
