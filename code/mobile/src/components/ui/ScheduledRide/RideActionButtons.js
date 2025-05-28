import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../constants';

/**
 * Action buttons component for scheduled ride management
 */
const RideActionButtons = ({ 
  onManage, 
  onEdit, 
  onCancel, 
  style,
  hideManage = false,
  hideEdit = false,
  hideCancel = false 
}) => {
  return (
    <View style={[styles.container, style]}>
      {!hideManage && (
        <TouchableOpacity
          style={[styles.actionButton, styles.manageButton]}
          onPress={onManage}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={16} color={COLORS.text.light} />
          <Text style={styles.actionButtonText}>Gerenciar</Text>
        </TouchableOpacity>
      )}
      
      {!hideEdit && (
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={16} color={COLORS.text.light} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
      )}
      
      {!hideCancel && (
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={16} color={COLORS.text.light} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  manageButton: {
    backgroundColor: COLORS.primary.main,
  },
  editButton: {
    backgroundColor: COLORS.secondary.main,
  },
  cancelButton: {
    backgroundColor: COLORS.danger.main,
    flex: 0,
    paddingHorizontal: SPACING.sm,
  },
  actionButtonText: {
    color: COLORS.text.light,
    fontWeight: FONT_WEIGHT.semiBold,
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.sm,
  },
});

export default React.memo(RideActionButtons);
