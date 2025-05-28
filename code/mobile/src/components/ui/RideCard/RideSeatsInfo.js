import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../constants';

/**
 * Seats info component showing available seats and passenger count
 */
const RideSeatsInfo = ({ availableSeats, totalSeats, style }) => {
  const occupiedSeats = totalSeats - availableSeats;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.seatsGroup}>
        <Ionicons name="people" size={16} color={COLORS.secondary.main} />
        <Text style={styles.seatsText}>
          {availableSeats} {availableSeats === 1 ? 'vaga disponível' : 'vagas disponíveis'}
        </Text>
      </View>
      
      {totalSeats && (
        <View style={styles.dotsContainer}>
          {Array.from({ length: totalSeats }, (_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index < occupiedSeats ? styles.occupiedDot : styles.availableDot
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
    justifyContent: 'space-between',
  },
  seatsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  seatsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  occupiedDot: {
    backgroundColor: COLORS.primary.main,
  },
  availableDot: {
    backgroundColor: COLORS.border.main,
  },
});

export default React.memo(RideSeatsInfo);
