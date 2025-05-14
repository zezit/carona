import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A reusable error state component that displays an error message and retry button
 */
const ErrorState = ({ 
  errorMessage = "Um erro ocorreu. Tente novamente.",
  buttonText = "Tentar novamente",
  onRetry,
  iconName = "alert-circle-outline",
  iconSize = 60,
  iconColor = "#d32f2f"
}) => {
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
      <Text style={styles.errorText}>{errorMessage}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  icon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    elevation: 2,
  },
  retryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default React.memo(ErrorState);