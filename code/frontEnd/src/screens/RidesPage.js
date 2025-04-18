import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { 
  LoadingIndicator, 
  RideCard, 
  EmptyState, 
  ErrorState,
  TabSelector
} from '../components/ui';
import { COLORS, SPACING } from '../constants';
import { PageHeader } from '../components/common';

// Main component
const RidesPage = ({ route, navigation }) => {
  const { mode = 'my-rides' } = route.params || {};
  const { user, authToken } = useAuthContext();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Page title based on mode
  const pageTitle = useMemo(() => {
    switch (mode) {
      case 'my-rides':
        return 'Minhas Caronas';
      case 'available-rides':
        return 'Caronas Disponíveis';
      default:
        return 'Caronas';
    }
  }, [mode]);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('all');

  // Tabs configuration for TabSelector
  const tabs = useMemo(() => [
    { id: 'all', label: 'Todas' },
    { id: 'scheduled', label: 'Agendadas' },
    { id: 'active', label: 'Em Andamento' },
    { id: 'completed', label: 'Finalizadas' },
    { id: 'canceled', label: 'Canceladas' }
  ], []);

  // Handle tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const loadRides = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      let response;

      if (mode === 'my-rides') {
        response = await apiClient.get(`/carona/motorista/${user.id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        // For available rides mode
        response = await apiClient.get('/carona/disponiveis', {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
      }

      if (response.success) {
        setRides(response.data || []);
      } else {
        setError(response.message || 'Erro ao carregar caronas');
      }
    } catch (err) {
      console.error('Error loading rides:', err);
      setError('Não foi possível carregar as caronas. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, user?.id, authToken]);

  // Initial load
  useEffect(() => {
    loadRides();
  }, [loadRides]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRides();
    }, [loadRides])
  );

  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRides();
  }, [loadRides]);

  // Navigate to ride details
  const handleRidePress = useCallback((ride) => {
    navigation.navigate('RideDetails', { rideId: ride.id });
  }, [navigation]);

  // Filter rides based on active tab
  const filteredRides = useMemo(() => {
    if (activeTab === 'all') {
      return rides;
    }
    return rides.filter(ride => {
      switch (activeTab) {
        case 'scheduled':
          return ride.status === 'AGENDADA';
        case 'active':
          return ride.status === 'EM_ANDAMENTO';
        case 'completed':
          return ride.status === 'FINALIZADA';
        case 'canceled':
          return ride.status === 'CANCELADA';
        default:
          return true;
      }
    });
  }, [rides, activeTab]);

  // Render tabs for filtering using TabSelector component
  const renderTabs = () => (
    <TabSelector
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );

  // Render empty state based on current tab and mode
  const renderEmptyState = () => {
    let title, message, icon;
    
    switch (activeTab) {
      case 'all':
        title = mode === 'my-rides' ? 'Você ainda não possui caronas' : 'Sem caronas disponíveis';
        message = mode === 'my-rides'
          ? 'Você ainda não criou nenhuma carona. Que tal adicionar sua primeira carona como motorista?'
          : 'Não há caronas disponíveis no momento. Tente novamente mais tarde.';
        icon = 'car-outline';
        break;
      case 'scheduled':
        title = 'Sem caronas agendadas';
        message = 'Você não possui caronas agendadas no momento.';
        icon = 'calendar-outline';
        break;
      case 'active':
        title = 'Sem caronas em andamento';
        message = 'Você não possui caronas em andamento no momento.';
        icon = 'time-outline';
        break;
      case 'completed':
        title = 'Sem caronas finalizadas';
        message = 'Você ainda não finalizou nenhuma carona.';
        icon = 'checkmark-circle-outline';
        break;
      case 'canceled':
        title = 'Sem caronas canceladas';
        message = 'Você não possui caronas canceladas.';
        icon = 'close-circle-outline';
        break;
      default:
        title = 'Sem caronas';
        message = 'Não foram encontradas caronas.';
        icon = 'car-outline';
    }
    
    return (
      <EmptyState
        title={title}
        message={message}
        icon={icon}
        iconColor={COLORS.primary}
      >
        {mode === 'my-rides' && activeTab === 'all' && (
          <TouchableOpacity
            style={styles.addRideButton}
            onPress={() => navigation.navigate('LocationSelection')}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.text.light} />
            <Text style={styles.addRideButtonText}>Adicionar Carona</Text>
          </TouchableOpacity>
        )}
      </EmptyState>
    );
  };

  // Render the list of rides
  const renderContent = () => {
    if (loading && !refreshing) {
      return <LoadingIndicator text="Carregando caronas..." />;
    }

    if (error) {
      return (
        <ErrorState
          errorMessage={error}
          onRetry={loadRides}
        />
      );
    }

    if (filteredRides.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RideCard
            item={item}
            onPress={() => handleRidePress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader
        title={pageTitle}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.contentContainer}>
        {renderTabs()}
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flex: 1,
    marginTop: -30,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabScrollContent: {
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  addRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addRideButtonText: {
    color: COLORS.text.light,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RidesPage;