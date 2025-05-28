import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import StatusBadge from './StatusBadge';
import RideHeader from './RideCard/RideHeader';
import RideLocationInfo from './RideCard/RideLocationInfo';
import RideSeatsInfo from './RideCard/RideSeatsInfo';
import Divider from './common/Divider';
import { COLORS, SPACING, RADIUS } from '../../constants';
// Import dateUtils for backward compatibility, but prefer backend-formatted dates
import { parseApiDate, formatDate, formatTime } from '../../utils/dateUtils';

/**
 * A reusable card component for displaying ride information
 */
const RideCard = ({ 
  item, 
  onPress,
  compact = false
}) => {
  // Enhanced date utilities that handle both backend-formatted and LocalDateTime formats
  const formatCardDate = useCallback((dateInput) => {
    // If the backend provides a formatted date string, use it directly
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      try {
        return formatDate(dateInput);
      } catch (error) {
        console.warn('Error formatting date:', error);
        return 'Data inválida';
      }
    }
    // Fallback to the original utility function for LocalDateTime arrays or other formats
    return formatDate(dateInput);
  }, []);

  const formatCardTime = useCallback((dateInput) => {
    // If the backend provides a formatted date string, use it directly
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      try {
        return formatTime(dateInput);
      } catch (error) {
        console.warn('Error formatting time:', error);
        return 'Hora inválida';
      }
    }
    // Fallback to the original utility function for LocalDateTime arrays or other formats
    return formatTime(dateInput);
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <RideHeader 
        date={formatCardDate(item.dataHoraPartida)}
        time={formatCardTime(item.dataHoraPartida)}
      />

      <Divider />

      <RideLocationInfo 
        departure={item.pontoPartida}
        destination={item.pontoDestino}
      />

      {!compact && (
        <>
          <Divider />

          <View style={styles.footer}>
            <RideSeatsInfo 
              availableSeats={item.vagasDisponiveis}
              totalSeats={item.vagas}
            />
            <StatusBadge status={item.status} size="small" />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.main,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default React.memo(RideCard);