import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  LoadingIndicator, 
  RideCard, 
  EmptyState, 
  ErrorState 
} from '../components/ui';

// Main component
const RidesPage = ({ route, navigation }) => {
  const { mode = 'my-rides' } = route.params || {};
  const { user, authToken } = useAuthContext();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      if (mode === 'my-rides') {
        response = await apiClient.get(`/carona/motorista/${user.id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        response = await apiClient.get('/carona');
      }

      if (response.success) {
        setRides(response.data.content || []);
      } else {
        setError('Erro ao carregar as caronas. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao carregar as caronas. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mode, user?.id, authToken]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const navigateToRideDetails = useCallback((rideId) => {
    navigation.navigate('RideDetails', { rideId });
  }, [navigation]);

  const navigateToRegisterRide = useCallback(() => {
    navigation.navigate('RegisterRide');
  }, [navigation]);

  const renderRideItem = useCallback(({ item }) => (
    <RideCard 
      item={item} 
      onPress={() => navigateToRideDetails(item.id)}
    />
  ), [navigateToRideDetails]);

  // Memoize the title to prevent unnecessary re-renders
  const pageTitle = useMemo(() => {
    return mode === 'my-rides' ? 'Minhas Caronas' : 'Caronas Disponíveis';
  }, [mode]);

  // Memoize empty state message
  const emptyStateMessage = useMemo(() => {
    return mode === 'my-rides'
      ? 'Você ainda não possui caronas registradas'
      : 'Não há caronas disponíveis no momento';
  }, [mode]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <LoadingIndicator />
      </View>
    );
  }

  if (error) {
    return <ErrorState errorMessage={error} onRetry={loadRides} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{pageTitle}</Text>
        {mode === 'my-rides' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={navigateToRegisterRide}
          >
            <Ionicons name="add-circle" size={28} color="#4285F4" />
          </TouchableOpacity>
        )}
      </View>

      {rides.length === 0 ? (
        <EmptyState 
          message={emptyStateMessage}
          onRefresh={loadRides}
        />
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadRides}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
});

export default React.memo(RidesPage);