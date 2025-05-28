import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING } from '../../../constants';

/**
 * Observations display component for showing ride notes/observations
 */
const ObservationsDisplay = ({ observations, style }) => {
  if (!observations || observations.trim() === '') {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="information-circle" size={16} color={COLORS.secondary.main} />
      <Text style={styles.observationsText}>
        {observations}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: `${COLORS.secondary.main}08`,
    borderRadius: 8,
  },
  observationsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 18,
  },
});

export default React.memo(ObservationsDisplay);
