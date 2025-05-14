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

  const getStatusText = useCallback((status) => {
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
        return status || 'Desconhecido';
    }
  }, []);

  const badgeStyle = useMemo(() => ({
    ...styles.badge,
    ...(size === 'small' ? styles.badgeSmall : {}),
    ...(size === 'large' ? styles.badgeLarge : {}),
    backgroundColor: getStatusColor(status),
  }), [status, size, getStatusColor]);

  const textStyle = useMemo(() => ({
    ...styles.text,
    ...(size === 'small' ? styles.textSmall : {}),
    ...(size === 'large' ? styles.textLarge : {}),
    color: getStatusTextColor(status),
  }), [status, size, getStatusTextColor]);

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{getStatusText(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 16,
  }
});

export default React.memo(StatusBadge);