import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A reusable option button component with icon and description
 * @param {Object} props - Component props
 * @param {string} props.title - Button title
 * @param {string} props.description - Description text
 * @param {string} props.icon - Ionicon name for the button icon
 * @param {string} props.color - Color for the icon and button (default: '#4285F4')
 * @param {Function} props.onPress - Callback function when button is pressed
 */
const OptionButton = ({ 
  title, 
  description, 
  icon,
  color = '#4285F4', 
  onPress 
}) => (
  <TouchableOpacity 
    style={styles.container} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={24} color="#bbb" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default React.memo(OptionButton);