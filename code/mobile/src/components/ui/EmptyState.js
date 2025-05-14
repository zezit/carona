import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A reusable empty state component
 * @param {Object} props - Component props
 * @param {string} props.title - Title for the empty state
 * @param {string} props.message - Message describing the empty state
 * @param {string} props.icon - Ionicon name for the empty state icon
 * @param {string} props.iconColor - Color for the icon (default: '#4285F4')
 */
const EmptyState = ({ 
  title, 
  message, 
  icon = 'information-circle-outline',
  iconColor = '#4285F4',
  children
}) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={64} color={iconColor} style={styles.icon} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {children && <View style={styles.childrenContainer}>{children}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  childrenContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
});

export default React.memo(EmptyState);