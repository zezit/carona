import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../../constants';

/**
 * Location info component showing pickup and destination points
 */
const RideLocationInfo = ({ departure, destination, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.locationItem}>
        <View style={[styles.locationIcon, styles.departureIcon]}>
          <Ionicons name="ellipse" size={8} color={COLORS.text.light} />
        </View>
        <Text style={styles.locationText} numberOfLines={1}>
          {departure}
        </Text>
      </View>
      
      <View style={styles.connector} />
      
      <View style={styles.locationItem}>
        <View style={[styles.locationIcon, styles.destinationIcon]}>
          <Ionicons name="location" size={12} color={COLORS.text.light} />
        </View>
        <Text style={styles.locationText} numberOfLines={1}>
          {destination}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  departureIcon: {
    backgroundColor: COLORS.success.main,
  },
  destinationIcon: {
    backgroundColor: COLORS.primary.main,
  },
  connector: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.border.main,
    marginLeft: 9,
    marginVertical: 2,
  },
  locationText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
});

export default React.memo(RideLocationInfo);
