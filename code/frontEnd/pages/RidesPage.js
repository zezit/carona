import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import commonStyles from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const RidesPage = ({ route, navigation }) => {
  const { mode = 'my-rides' } = route.params || {};
  const { user, authToken } = useAuthContext();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRides();
  }, [mode]);

  const loadRides = async () => {
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
  };

  const getStatusColor = (status) => {
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
  };

  const getStatusTextColor = (status) => {
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
  };

  const getStatusLabel = (status) => {
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
  };

  const renderRideItem = ({ item }) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => navigation.navigate('RideDetails', { rideId: item.id })}
    >
      <View style={styles.rideHeader}>
        <Text style={styles.rideDate}>
          {new Date(item.dataHoraPartida).toLocaleDateString()}
        </Text>
        <Text style={styles.rideTime}>
          {new Date(item.dataHoraPartida).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.rideInfo}>
        <View style={styles.locationInfo}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={16} color="#4285F4" />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pontoPartida}
          </Text>
        </View>
        <View style={styles.locationInfo}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={16} color="#34A853" />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pontoDestino}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.rideFooter}>
        <View style={styles.seats}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.seatsText}>
            {item.vagasDisponiveis} vagas disponíveis
          </Text>
        </View>
        <View style={[
          styles.status,
          {
            backgroundColor: getStatusColor(item.status),
            borderColor: getStatusTextColor(item.status)
          }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusTextColor(item.status) }
          ]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRides}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'my-rides' ? 'Minhas Caronas' : 'Caronas Disponíveis'}
          </Text>
          {mode === 'my-rides' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('RegisterRide')}
            >
              <Ionicons name="add-circle" size={28} color="#4285F4" />
            </TouchableOpacity>
          )}
        </View>

        {rides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="car-outline" size={72} color="#666" />
            </View>
            <Text style={styles.emptyText}>
              {mode === 'my-rides'
                ? 'Você ainda não possui caronas registradas'
                : 'Não há caronas disponíveis no momento'}
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadRides}>
              <Ionicons name="refresh" size={16} color="#FFF" />
              <Text style={styles.refreshText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
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
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rideDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rideTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e1e1',
    marginVertical: 10,
  },
  rideInfo: {
    marginVertical: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIconContainer: {
    width: 24,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  seats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    fontWeight: '500',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    elevation: 2,
  },
  retryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  refreshText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 8,
  }
});

export default RidesPage;