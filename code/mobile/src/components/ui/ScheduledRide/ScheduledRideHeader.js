import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../../constants';

/**
 * Header component for scheduled ride cards showing date and availability status
 */
const ScheduledRideHeader = ({ date, availableSeats, totalSeats }) => {
  const isFullyBooked = availableSeats === 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <View style={styles.dateIconContainer}>
          <Ionicons name="calendar" size={16} color={COLORS.primary.main} />
        </View>
        <View>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.timeText}>Partida</Text>
        </View>
      </View>
      
      <View style={[
        styles.statusBadge, 
        isFullyBooked ? styles.fullBadge : styles.availableBadge
      ]}>
        <Text style={[
          styles.statusText,
          isFullyBooked ? styles.fullStatusText : styles.availableStatusText
        ]}>
          {isFullyBooked ? 'Lotada' : `${availableSeats} vagas`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: `${COLORS.primary.main}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.primary,
  },
  timeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.secondary,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.lg,
  },
  availableBadge: {
    backgroundColor: `${COLORS.success.main}15`,
  },
  fullBadge: {
    backgroundColor: `${COLORS.warning.main}15`,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  availableStatusText: {
    color: COLORS.success.main,
  },
  fullStatusText: {
    color: COLORS.warning.main,
  },
});

export default React.memo(ScheduledRideHeader);
