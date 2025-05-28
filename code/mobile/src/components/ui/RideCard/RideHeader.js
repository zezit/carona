import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../constants';

/**
 * Header component for ride cards displaying date and time
 */
const RideHeader = ({ date, time, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.primary,
  },
  time: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
  },
});

export default React.memo(RideHeader);
