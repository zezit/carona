import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * A reusable loading indicator component
 * @param {Object} props - Component props
 * @param {string} props.color - Color of the loading indicator (default: '#4285F4')
 * @param {string} props.size - Size of the loading indicator (default: 'large')
 */
const LoadingIndicator = ({ color = '#4285F4', size = 'large' }) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default React.memo(LoadingIndicator);