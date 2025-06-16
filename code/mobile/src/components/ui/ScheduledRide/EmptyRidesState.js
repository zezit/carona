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
      <Ionicons name="car-outline" size={48} color={COLORS.text.secondary} />
      
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background.main.light,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  offerRideButton: {
    backgroundColor: COLORS.primary.main,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  offerRideButtonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    textAlign: 'center',
  },
});

export default React.memo(EmptyRidesState);
