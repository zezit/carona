import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../../constants';

/**
 * Empty state component for when there are no ride requests
 */
const EmptyRequestsState = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-text-outline" size={60} color={COLORS.text.tertiary} />
      </View>
      
      <Text style={styles.title}>
        Nenhuma solicitação pendente
      </Text>
      
      <Text style={styles.subtitle}>
        Quando alguém solicitar uma vaga em suas caronas,{'\n'}
        você verá as solicitações aqui.
      </Text>
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
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.text.tertiary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default React.memo(EmptyRequestsState);
