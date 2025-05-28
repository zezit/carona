import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../../constants';

/**
 * Simple divider component for visual separation
 */
const Divider = ({ style, color = COLORS.border.main, height = 1 }) => {
  return (
    <View 
      style={[
        styles.divider, 
        { backgroundColor: color, height }, 
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    marginVertical: SPACING.sm,
  },
});

export default React.memo(Divider);
