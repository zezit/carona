import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../../constants';

/**
 * Empty state component for when there are no scheduled rides
 */
const EmptyRidesState = ({ onOfferRide, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="car-outline" size={60} color={COLORS.text.tertiary} />
      </View>
      
      <Text style={styles.emptyTitle}>
        Nenhuma carona agendada
      </Text>
      
      <Text style={styles.emptySubtitle}>
        Você ainda não tem caronas programadas.{'\n'}
        Que tal oferecer uma carona para outros estudantes?
      </Text>
      
      {onOfferRide && (
        <TouchableOpacity
          style={styles.offerRideButton}
          onPress={onOfferRide}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={COLORS.text.light} />
          <Text style={styles.offerRideButtonText}>
            Oferecer Carona
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.text.tertiary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  offerRideButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  offerRideButtonText: {
    color: COLORS.text.light,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.sm,
  },
});

export default React.memo(EmptyRidesState);
