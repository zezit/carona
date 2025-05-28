import React from 'react';
import { View, StyleSheet } from 'react-native';
import ManagementActionButton from './ManagementActionButton';
import { COLORS, SPACING } from '../../../constants';

/**
 * Container for management action buttons
 */
const ManagementActions = ({ 
  onEditPassengers, 
  onApproveRequests,
  onViewPassengers,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      {onViewPassengers && (
        <ManagementActionButton
          icon="people-outline"
          title="Ver Passageiros"
          onPress={onViewPassengers}
          backgroundColor={COLORS.info}
        />
      )}
      
      <ManagementActionButton
        icon="people"
        title="Editar Passageiros"
        onPress={onEditPassengers}
        backgroundColor={COLORS.primary.main}
      />

      <ManagementActionButton
        icon="checkmark-done"
        title="Aprovar/Recusar Pedidos"
        onPress={onApproveRequests}
        backgroundColor={COLORS.secondary.main}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
});

export default React.memo(ManagementActions);
