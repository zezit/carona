import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../constants';

/**
 * A reusable component for displaying ride detail information with an icon
 * 
 * @param {Object} props - Component props
 * @param {string} props.icon - The Ionicons name to use
 * @param {string} props.iconColor - The color of the icon (default: COLORS.primary)
 * @param {string} props.label - The label text to display
 * @param {string} props.value - The value text to display
 * @param {Object} props.style - Additional style for the container
 * @param {boolean} props.multiline - Whether the value can span multiple lines
 */
const RideInfoItem = ({
  icon,
  iconColor = COLORS.primary,
  label,
  value,
  style,
  multiline = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text 
          style={[styles.value, multiline && styles.multilineValue]}
          numberOfLines={multiline ? 0 : 1}
        >
          {value || 'Não informado'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  value: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  multilineValue: {
    lineHeight: 22,
  },
});

export default React.memo(RideInfoItem);