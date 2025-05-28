import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../constants';

/**
 * A reusable navigation card component with icon, title, description and chevron
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The title text to display
 * @param {string} props.description - The description text to display
 * @param {string} props.icon - The Ionicons name to use
 * @param {string} props.iconColor - The color of the icon
 * @param {Function} props.onPress - Callback when card is pressed
 * @param {Object} props.style - Additional style for the container
 * @param {Object} props.badge - Optional badge object with text and color properties
 */
const NavigationCard = ({
  title,
  description,
  icon,
  iconColor = COLORS.primary.main,
  onPress,
  style,
  badge,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
          
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.color || COLORS.primary.main }]}>
              <Text style={styles.badgeText}>{badge.text}</Text>
            </View>
          )}
        </View>
        
        {description && (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  descriptionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export default React.memo(NavigationCard);