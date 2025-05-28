import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../../theme';
import { COLORS } from '../../../constants';

const SeatSelector = ({ 
  seats, 
  onSeatsChange, 
  maxSeats = 8, 
  minSeats = 1 
}) => {
  const handleDecrease = () => {
    if (seats > minSeats) {
      onSeatsChange(seats - 1);
    }
  };

  const handleIncrease = () => {
    if (seats < maxSeats) {
      onSeatsChange(seats + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          seats <= minSeats && styles.buttonDisabled
        ]}
        onPress={handleDecrease}
        disabled={seats <= minSeats}
      >
        <Ionicons 
          name="remove" 
          size={20} 
          color={seats <= minSeats ? colors.gray[300] : COLORS.primary.main} 
        />
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{seats}</Text>
        <Text style={styles.label}>
          {seats === 1 ? 'passageiro' : 'passageiros'}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.button,
          seats >= maxSeats && styles.buttonDisabled
        ]}
        onPress={handleIncrease}
        disabled={seats >= maxSeats}
      >
        <Ionicons 
          name="add" 
          size={20} 
          color={seats >= maxSeats ? colors.gray[300] : COLORS.primary.main} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary.main,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[100],
  },
  valueContainer: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[800],
    marginBottom: 2,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    fontWeight: typography.fontWeights.medium,
  },
});

export default SeatSelector;
