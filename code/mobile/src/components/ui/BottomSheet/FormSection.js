import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../../theme';
import { COLORS } from '../../../constants';

const FormSection = ({ title, icon, children, style }) => (
  <View style={[styles.section, style]}>
    <View style={styles.sectionHeaderRow}>
      <Ionicons 
        name={icon} 
        size={20} 
        color={COLORS.primary.main} 
        style={styles.sectionIcon} 
      />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[800],
    flex: 1,
  },
});

export default FormSection;
