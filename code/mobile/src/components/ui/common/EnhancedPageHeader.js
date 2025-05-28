import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../constants';

/**
 * Enhanced page header component with gradient background and improved styling
 */
const EnhancedPageHeader = ({ 
  title, 
  subtitle, 
  onBack, 
  rightComponent,
  showBackButton = true,
  gradientColors = [COLORS.primary.main, COLORS.primary.dark],
  style 
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {showBackButton && onBack && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
          )}
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        
        {rightComponent && (
          <View style={styles.rightSection}>
            {rightComponent}
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60, // Account for status bar
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
});

export default React.memo(EnhancedPageHeader);
