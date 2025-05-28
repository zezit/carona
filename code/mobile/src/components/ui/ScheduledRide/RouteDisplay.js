import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../constants';

/**
 * Route display component showing departure and destination points with visual connector
 */
const RouteDisplay = ({ departure, destination, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.routePoint}>
        <View style={[styles.routeDot, styles.startDot]} />
        <View style={styles.routeTextContainer}>
          <Text style={styles.routeLabel}>Saída</Text>
          <Text style={styles.routeText} numberOfLines={2}>
            {departure || 'Não definido'}
          </Text>
        </View>
      </View>
      
      <View style={styles.routeLine} />
      
      <View style={styles.routePoint}>
        <View style={[styles.routeDot, styles.endDot]} />
        <View style={styles.routeTextContainer}>
          <Text style={styles.routeLabel}>Destino</Text>
          <Text style={styles.routeText} numberOfLines={2}>
            {destination || 'Não definido'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
    marginTop: 4,
  },
  startDot: {
    backgroundColor: COLORS.success.main,
  },
  endDot: {
    backgroundColor: COLORS.primary.main,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border.main,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeTextContainer: {
    flex: 1,
    paddingBottom: SPACING.xs,
  },
  routeLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.secondary,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: 2,
  },
  routeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
});

export default React.memo(RouteDisplay);
