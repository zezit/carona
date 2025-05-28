import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ScheduledRideHeader from './ScheduledRideHeader';
import RouteDisplay from './RouteDisplay';
import PassengersInfo from './PassengersInfo';
import ObservationsDisplay from './ObservationsDisplay';
import RideActionButtons from './RideActionButtons';
import { COLORS, SPACING, RADIUS } from '../../../constants';

/**
 * Complete scheduled ride card component following SRP
 */
const ScheduledRideCard = ({ 
  item, 
  onManage, 
  onEdit, 
  onCancel,
  formatDisplayDate,
  style 
}) => {
  const passengersCount = item.passageiros ? item.passageiros.length : 0;
  const availableSeats = item.vagas - passengersCount;

  return (
    <View style={[styles.container, style]}>
      <ScheduledRideHeader 
        date={formatDisplayDate(item.dataHoraPartida)}
        availableSeats={availableSeats}
        totalSeats={item.vagas}
      />

      <RouteDisplay 
        departure={item.pontoPartida}
        destination={item.pontoDestino}
      />

      <PassengersInfo 
        passengersCount={passengersCount}
        totalSeats={item.vagas}
      />

      <ObservationsDisplay 
        observations={item.observacoes}
      />

      <RideActionButtons 
        onManage={() => onManage(item)}
        onEdit={() => onEdit(item)}
        onCancel={() => onCancel(item)}
      />
    </View>
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
});

export default React.memo(ScheduledRideCard);
