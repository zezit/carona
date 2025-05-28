import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../../theme';

const ObservationsInput = ({ 
  value, 
  onChangeText, 
  placeholder = "Adicione observações sobre a carona (opcional)...",
  maxLength = 200 
}) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        maxLength={maxLength}
      />
      {value && value.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClear}
        >
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.gray[400]} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    minHeight: 100,
    backgroundColor: colors.gray[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingRight: spacing.xl,
    fontSize: typography.fontSizes.md,
    color: colors.gray[800],
    borderWidth: 1,
    borderColor: colors.gray[200],
    textAlignVertical: 'top',
    lineHeight: 20,
    fontWeight: typography.fontWeights.regular,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  clearButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: 4,
    backgroundColor: colors.white,
    borderRadius: radius.full,
  },
});

export default ObservationsInput;
