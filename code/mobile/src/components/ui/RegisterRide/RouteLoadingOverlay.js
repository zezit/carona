import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../../constants';

/**
 * RouteLoadingOverlay - Loading state component for route calculations
 * Follows SRP by handling only the loading state display
 */
const RouteLoadingOverlay = ({ visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <View testID="route-loading-overlay" style={styles.container}>
      <View testID="route-loading-content" style={styles.content}>
        <View testID="route-loading-icon" style={styles.iconContainer}>
          <Ionicons name="map-outline" size={32} color={COLORS.primary.main} />
        </View>
        
        <ActivityIndicator 
          testID="route-loading-spinner"
          size="large" 
          color={COLORS.primary.main} 
          style={styles.spinner}
        />
        
        <Text testID="route-loading-title" style={styles.title}>Calculando rotas</Text>
        <Text testID="route-loading-subtitle" style={styles.subtitle}>
          Encontrando as melhores opções para sua viagem...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    maxWidth: 300,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  spinner: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: FONT_SIZE.sm * 1.4,
  },
});

export default React.memo(RouteLoadingOverlay);
