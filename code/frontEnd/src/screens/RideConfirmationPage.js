import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApi } from '../hooks';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../constants';

const RideConfirmationPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { api } = useApi();
  const [loading, setLoading] = useState(false);
  
  // Extract ride details from route params
  const { 
    departureLocation, 
    arrivalLocation, 
    departureDate,
    seats,
    observations,
    duration,
    distance,
    routePoints
  } = route.params || {};

  // Format date for display
  const formatDate = useCallback((date) => {
    if (!date) return '';
    
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    
    return new Date(date).toLocaleString('pt-BR', options)
      .replace(',', ' às');
  }, []);

  // Format duration for display
  const formatDuration = useCallback((seconds) => {
    if (!seconds) return '0 min';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} min`;
    }
  }, []);

  // Format distance for display
  const formatDistance = useCallback((meters) => {
    if (!meters) return '0 km';
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  }, []);

  // Calculate estimated arrival time
  const getArrivalTime = useCallback(() => {
    if (!departureDate || !duration) return '';
    const arrivalTime = new Date(new Date(departureDate).getTime() + (duration * 1000));
    return formatDate(arrivalTime);
  }, [departureDate, duration, formatDate]);

  // Handle ride submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare ride data
      const rideData = {
        pontoPartidaLatitude: departureLocation.latitude,
        pontoPartidaLongitude: departureLocation.longitude,
        pontoPartidaEndereco: departureLocation.address,
        pontoChegadaLatitude: arrivalLocation.latitude,
        pontoChegadaLongitude: arrivalLocation.longitude,
        pontoChegadaEndereco: arrivalLocation.address,
        dataHoraPartida: new Date(departureDate).toISOString(),
        vagas: parseInt(seats, 10),
        observacoes: observations,
        // Include route points if needed by the API
        rota: routePoints ? routePoints.map(point => ({
          latitude: point.latitude,
          longitude: point.longitude
        })) : []
      };
      
      // Call API to create ride
      const response = await api.post('/caronas', rideData);
      
      // Navigate to successful completion
      navigation.navigate('RidesPage', { 
        mode: 'my-rides',
        refresh: Date.now()
      });
    } catch (error) {
      console.error('Error creating ride:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmação da Carona</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trajeto</Text>
          
          <View style={styles.locationContainer}>
            <View style={styles.locationIconContainer}>
              <View style={styles.originDot} />
              <View style={styles.routeLine} />
              <View style={styles.destinationDot} />
            </View>
            
            <View style={styles.locationTextContainer}>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Origem</Text>
                <Text style={styles.locationValue}>{departureLocation?.address}</Text>
              </View>
              
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Destino</Text>
                <Text style={styles.locationValue}>{arrivalLocation?.address}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.routeStats}>
            <View style={styles.routeStat}>
              <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.routeStatText}>{formatDuration(duration)}</Text>
            </View>
            
            <View style={styles.routeStat}>
              <Ionicons name="compass-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.routeStatText}>{formatDistance(distance)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Horário</Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Partida</Text>
              <Text style={styles.timeValue}>{formatDate(departureDate)}</Text>
            </View>
            
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Chegada estimada</Text>
              <Text style={styles.timeValue}>{getArrivalTime()}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          
          <View style={styles.detailContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Vagas disponíveis</Text>
              <Text style={styles.detailValue}>{seats}</Text>
            </View>
            
            {observations ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Observações</Text>
                <Text style={styles.detailValue}>{observations}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  locationIconContainer: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 16,
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.primary,
    marginVertical: 4,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationItem: {
    marginBottom: SPACING.md,
  },
  locationLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  routeStats: {
    flexDirection: 'row',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  routeStatText: {
    marginLeft: 4,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  timeContainer: {
    marginBottom: SPACING.sm,
  },
  timeItem: {
    marginBottom: SPACING.md,
  },
  timeLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.primary,
  },
  detailContainer: {
    marginBottom: SPACING.sm,
  },
  detailItem: {
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    marginRight: SPACING.sm,
  },
});

export default RideConfirmationPage;