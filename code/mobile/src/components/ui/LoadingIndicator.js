import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

/**
 * A reusable loading indicator component with optional text
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the loading indicator ('small' or 'large')
 * @param {string} props.color - Color of the loading indicator
 * @param {string} props.text - Optional text to display below the indicator
 * @param {Object} props.style - Additional styling for the container
 * @param {Object} props.textStyle - Additional styling for the text
 */
const LoadingIndicator = ({ 
  size = 'large', 
  color = '#4285F4', 
  text, 
  style,
  textStyle
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default React.memo(LoadingIndicator);