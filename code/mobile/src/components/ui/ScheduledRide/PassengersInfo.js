import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING } from '../../../constants';

/**
 * Passengers info component showing current passenger count and visual dots
 */
const PassengersInfo = ({ passengersCount, totalSeats, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="people" size={18} color={COLORS.secondary.main} />
      <Text style={styles.passengersText}>
        {passengersCount} de {totalSeats} passageiros
      </Text>
      {passengersCount > 0 && (
        <View style={styles.passengersDots}>
          {Array.from({ length: totalSeats }, (_, index) => (
            <View
              key={index}
              style={[
                styles.passengerDot,
                index < passengersCount ? styles.occupiedDot : styles.emptyDot
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.main,
  },
  passengersText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  passengersDots: {
    flexDirection: 'row',
  },
  passengerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  occupiedDot: {
    backgroundColor: COLORS.primary.main,
  },
  emptyDot: {
    backgroundColor: COLORS.border.main,
  },
});

export default React.memo(PassengersInfo);
