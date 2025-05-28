import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, View, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING } from '../constants';
import { LoadingIndicator } from '../components/ui';
import ScheduledRideCard from '../components/ui/ScheduledRide/ScheduledRideCard';
import EmptyRidesState from '../components/ui/ScheduledRide/EmptyRidesState';
import EnhancedPageHeader from '../components/ui/common/EnhancedPageHeader';
import { apiClient } from '../services/api/apiClient';
import { useAuthContext } from '../contexts/AuthContext';

const ScheduledRides = ({ navigation, route }) => {
  const { rides = [], driverDetails } = route.params;
  const { authToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduledRides, setScheduledRides] = useState(rides || []);

  // Format date for display - expects backend-formatted date strings
  const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return 'Data não disponível';
    
    try {
      // Backend should send ISO format like "2025-05-26T14:30:00"
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date received from backend:', isoDateString);
        return 'Data inválida';
      }
      
      // Simple formatting using built-in methods
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' às ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  // Refresh rides list
  const onRefresh = async () => {
    if (!driverDetails?.id) return;
    
    setRefreshing(true);
    try {
      const response = await apiClient.get(`/carona/motorista/${driverDetails.id}/proximas`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.success && response.data) {
        setScheduledRides(response.data);
      }
    } catch (error) {
      console.error('Error refreshing rides:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Cancel a scheduled ride
  const handleCancelRide = async (ride) => {
    Alert.alert(
      'Cancelar carona',
      `Tem certeza que deseja cancelar a carona do dia ${formatDisplayDate(ride.dataHoraPartida)}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await apiClient.delete(`/carona/${ride.id}`, {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.success) {
                // Remove the cancelled ride from local state
                setScheduledRides(
                  scheduledRides.filter((item) => item.id !== ride.id)
                );
                Alert.alert('Sucesso', 'Carona cancelada com sucesso');
              } else {
                Alert.alert('Erro', response.error?.message || 'Não foi possível cancelar a carona');
              }
            } catch (error) {
              console.error('Error cancelling ride:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao cancelar a carona');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Edit a scheduled ride
  const handleEditRide = (ride) => {
    navigation.navigate('EditRide', { 
      rideId: ride.id,
      ride: ride,
      driverDetails: driverDetails,
      onUpdate: (updatedRide) => {
        // Update the local state with the edited ride
        const updatedRides = scheduledRides.map(r => 
          r.id === updatedRide.id ? updatedRide : r
        );
        setScheduledRides(updatedRides);
      }
    });
  };

  // Navigate to ride management
  const handleManageRide = (ride) => {
    navigation.navigate('ManagePassengersHome', { 
      rideId: ride.id, 
      ride: ride 
    });
  };

  // Navigate to offer ride screen
  const handleOfferRide = () => {
    navigation.navigate('RegisterRide', {
      carAvailableSeats: driverDetails?.carro?.capacidadePassageiros,
    });
  };

  // Render a ride item using the new ScheduledRideCard component
  // Render a ride item using the new ScheduledRideCard component
  const renderRideItem = ({ item }) => (
    <ScheduledRideCard 
      item={item}
      onManage={handleManageRide}
      onEdit={handleEditRide}
      onCancel={handleCancelRide}
      formatDisplayDate={formatDisplayDate}
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingIndicator text="Processando..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <EnhancedPageHeader 
        title="Minhas Caronas"
        subtitle={`${scheduledRides.length} ${scheduledRides.length === 1 ? 'carona agendada' : 'caronas agendadas'}`}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity 
            onPress={handleOfferRide}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
        }
      />

      <View style={styles.contentContainer}>
        {scheduledRides.length > 0 ? (
          <FlatList
            data={scheduledRides}
            renderItem={renderRideItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary.main]}
                tintColor={COLORS.primary.main}
              />
            }
          />
        ) : (
          <EmptyRidesState onOfferRide={handleOfferRide} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background.main,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScheduledRides;