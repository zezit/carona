import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * A status badge component that renders a status with appropriate coloring
 */
const StatusBadge = ({ status, size = 'medium' }) => {
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'AGENDADA':
        return '#E3F2FD';
      case 'EM_ANDAMENTO':
        return '#E8F5E9';
      case 'FINALIZADA':
        return '#EEEEEE';
      case 'CANCELADA':
        return '#FFEBEE';
      default:
        return '#E3F2FD';
    }
  }, []);

  const getStatusTextColor = useCallback((status) => {
    switch (status) {
      case 'AGENDADA':
        return '#0D47A1';
      case 'EM_ANDAMENTO':
        return '#1B5E20';
      case 'FINALIZADA':
        return '#424242';
      case 'CANCELADA':
        return '#B71C1C';
      default:
        return '#0D47A1';
    }
  }, []);

  const getStatusLabel = useCallback((status) => {
    switch (status) {
      case 'AGENDADA':
        return 'Agendada';
      case 'EM_ANDAMENTO':
        return 'Em andamento';
      case 'FINALIZADA':
        return 'Finalizada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
  }, []);

  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 3,
          fontSize: 10,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 14,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 5,
          fontSize: 12,
        };
    }
  }, [size]);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: getStatusColor(status),
        borderColor: getStatusTextColor(status),
        paddingHorizontal: sizeStyles.paddingHorizontal,
        paddingVertical: sizeStyles.paddingVertical,
      }
    ]}>
      <Text style={[
        styles.text,
        { 
          color: getStatusTextColor(status),
          fontSize: sizeStyles.fontSize,
        }
      ]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});

export default React.memo(StatusBadge);