import { Alert } from 'react-native';
import { apiClient } from '../../services/api/apiClient';
import { RouteCalculator } from './RouteCalculator';

/**
 * RideSubmissionHandler - Handles ride submission logic and API calls
 * Follows SRP by handling only ride creation and submission
 */
export class RideSubmissionHandler {
  static async submitRide({
    selectedRoute,
    departureLocation,
    arrivalLocation,
    departure,
    arrival,
    departureDate,
    duration,
    seats,
    observations,
    authToken,
    navigation
  }) {
    if (!selectedRoute || !departureLocation || !arrivalLocation) {
      Alert.alert('Erro', 'Selecione os pontos de partida e chegada para continuar.');
      return { success: false };
    }

    try {
      // Get arrival date by adding the duration to the departure date
      let departureDateTime = departureDate instanceof Date ? departureDate : new Date(departureDate);
      let arrivalDateTime = new Date(departureDateTime.getTime() + (duration * 1000));
      
      const now = new Date();
      // Prevent error 400 for past departure dates
      if (departureDateTime < now) {
        departureDateTime = now;
        arrivalDateTime = new Date(departureDateTime.getTime() + (duration * 1000));
      }

      // Ensure both dates are valid
      if (isNaN(departureDateTime.getTime()) || isNaN(arrivalDateTime.getTime())) {
        Alert.alert('Erro', 'Datas de partida ou chegada inválidas.');
        return { success: false };
      }

      const rideData = {
        pontoPartida: departure,
        latitudePartida: departureLocation.latitude,
        longitudePartida: departureLocation.longitude,
        pontoDestino: arrival,
        latitudeDestino: arrivalLocation.latitude,
        longitudeDestino: arrivalLocation.longitude,
        dataHoraPartida: RouteCalculator.formatLocalDateTime(departureDateTime),
        dataHoraChegada: RouteCalculator.formatLocalDateTime(arrivalDateTime),
        vagas: parseInt(seats, 10),
        observacoes: observations
      };

      const options = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      };
      
      console.debug('Submitting ride data:', rideData);
      const response = await apiClient.post('/carona', rideData, options);

      if (response.success) {
        Alert.alert(
          'Sucesso',
          'Sua carona foi registrada com sucesso!',
          [{
            text: 'OK',
            onPress: () => navigation.navigate('TabNavigator', {
              screen: 'Rides',
              params: {
                refresh: Date.now(),
                updated: true
              }
            })
          }]
        );
        return { success: true };
      } else {
        console.error('Erro ao registrar carona:', response.error?.message);
        Alert.alert('Erro', 'Não foi possível registrar a carona. Tente novamente.');
        return { success: false };
      }

    } catch (error) {
      console.error('Error creating ride:', error);
      Alert.alert('Erro', 'Não foi possível registrar a carona. Tente novamente.');
      return { success: false };
    }
  }

  static validateSeats(newSeats, maxSeats) {
    const newValue = parseInt(newSeats, 10);
    const maxValue = maxSeats ? parseInt(maxSeats, 10) : 4;

    if (newValue > maxValue) {
      Alert.alert(
        'Limite de Assentos',
        `Você não pode oferecer mais do que ${maxValue} vagas, pois este é o limite de passageiros configurado para o seu veículo.`,
      );
      return false;
    }
    return true;
  }
}
