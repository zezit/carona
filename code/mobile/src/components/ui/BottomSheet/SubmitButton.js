import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, radius } from '../../../theme';
import { COLORS } from '../../../constants';

const SubmitButton = ({ 
  onPress, 
  loading = false, 
  disabled = false, 
  title = "Confirmar",
  icon = "checkmark",
  isEditMode = false,
  isViewMode = false 
}) => {
  const isDisabled = disabled || loading;
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isDisabled && styles.buttonDisabled,
          isViewMode && styles.buttonViewMode
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons 
            name={icon} 
            size={20} 
            color={COLORS.white} 
          />
        )}
        <Text style={[
          styles.buttonText,
          isDisabled && styles.buttonTextDisabled
        ]}>
          {loading 
            ? (isEditMode ? 'Atualizando...' : 'Criando carona...') 
            : (isViewMode ? title : (isEditMode ? 'Atualizar Carona' : title))
          }
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary.main,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    minHeight: 48,
    shadowColor: COLORS.primary.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonViewMode: {
    backgroundColor: COLORS.secondary.main,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: spacing.sm,
  },
  buttonTextDisabled: {
    color: COLORS.gray[400],
  },
});

export default SubmitButton;
