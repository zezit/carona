import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { format } from 'date-fns';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants';
import { apiClient } from '../../services/api/apiClient';
import { useAuthContext } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function RequestDetailsScreen({ navigation, route }) {
  const { request, ride } = route.params || {};
  const { authToken } = useAuthContext();
  const mapRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [detourInfo, setDetourInfo] = useState(null);
  const [originalRoute, setOriginalRoute] = useState(null);
  const [detourRoute, setDetourRoute] = useState(null);

  useEffect(() => {
    if (request && ride) {
      calculateRouteImpact();
    }
  }, [request, ride]);

  const calculateRouteImpact = async () => {
    try {
      setLoading(true);

      // Get original route (existing trajectory)
      const originalRouteData = await apiClient.get(
        `/maps/trajectories?startLat=${ride.latitudePartida}&startLon=${ride.longitudePartida}&endLat=${ride.latitudeDestino}&endLon=${ride.longitudeDestino}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      if (originalRouteData.data && originalRouteData.data.length > 0) {
        const originalTrajectory = originalRouteData.data[0];
        console.log('Original route coordinates:', originalTrajectory.coordenadas?.length || 0, 'points');
        
        setOriginalRoute({
          coordinates: originalTrajectory.coordenadas.map(coord => ({
            latitude: coord[0],
            longitude: coord[1]
          })),
          distance: originalTrajectory.distanciaMetros,
          duration: originalTrajectory.tempoSegundos
        });

        // Calculate route with detour using the existing backend utility
        // We'll call the detour calculation endpoint
        const detourResponse = await apiClient.post(
          `/pedidos/${request.id}/calculate-detour`,
          {},
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (detourResponse.data) {
          console.log('Detour info received:', detourResponse.data);
          setDetourInfo(detourResponse.data);
          
          // Get detailed route with waypoints for visualization
          const detourRouteData = await calculateDetourRouteCoordinates();
          console.log('Detour route data:', detourRouteData);
          setDetourRoute(detourRouteData);
        }
      }
    } catch (error) {
      console.error('Error calculating route impact:', error);
      Alert.alert('Erro', 'Não foi possível calcular o impacto da rota. Tentando com dados básicos...');
      
      // Fallback: show basic information without detour calculation
      setOriginalRoute({
        coordinates: [
          { latitude: ride.latitudePartida, longitude: ride.longitudePartida },
          { latitude: ride.latitudeDestino, longitude: ride.longitudeDestino }
        ],
        distance: 0,
        duration: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDetourRouteCoordinates = async () => {
    try {
      // Check if we have the required coordinates
      const passengerOriginLat = request.solicitacao.latitudeOrigem;
      const passengerOriginLng = request.solicitacao.longitudeOrigem;
      const passengerDestLat = request.solicitacao.latitudeDestino;
      const passengerDestLng = request.solicitacao.longitudeDestino;

      if (!passengerOriginLat || !passengerOriginLng || !passengerDestLat || !passengerDestLng) {
        console.warn('Missing passenger coordinates, falling back to simple route');
        throw new Error('Missing coordinates');
      }

      // Calculate route with pickup and dropoff waypoints
      const waypointsParam = `${passengerOriginLat},${passengerOriginLng};${passengerDestLat},${passengerDestLng}`;
      
      console.log('Calculating detour route with waypoints:', waypointsParam);
      
      const response = await apiClient.get(
        `/maps/trajectories-with-waypoints?startLat=${ride.latitudePartida}&startLon=${ride.longitudePartida}&endLat=${ride.latitudeDestino}&endLon=${ride.longitudeDestino}&waypoints=${waypointsParam}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      if (response.data && response.data.length > 0) {
        const detourTrajectory = response.data[0];
        console.log('Detour trajectory coordinates:', detourTrajectory.coordenadas?.length || 0, 'points');
        
        return {
          coordinates: detourTrajectory.coordenadas.map(coord => ({
            latitude: coord[0],
            longitude: coord[1]
          })),
          distance: detourTrajectory.distanciaMetros,
          duration: detourTrajectory.tempoSegundos
        };
      }
      
      throw new Error('No trajectory data received');
    } catch (error) {
      console.error('Error calculating detour route coordinates:', error);
      // Fallback: create a simple route through waypoints if we have coordinates
      const passengerOriginLat = request.solicitacao.latitudeOrigem;
      const passengerOriginLng = request.solicitacao.longitudeOrigem;
      const passengerDestLat = request.solicitacao.latitudeDestino;
      const passengerDestLng = request.solicitacao.longitudeDestino;

      const coordinates = [
        { latitude: ride.latitudePartida, longitude: ride.longitudePartida }
      ];

      // Add passenger pickup point if available
      if (passengerOriginLat && passengerOriginLng) {
        coordinates.push({ latitude: passengerOriginLat, longitude: passengerOriginLng });
      }

      // Add passenger dropoff point if available
      if (passengerDestLat && passengerDestLng) {
        coordinates.push({ latitude: passengerDestLat, longitude: passengerDestLng });
      }

      // Add driver destination
      coordinates.push({ latitude: ride.latitudeDestino, longitude: ride.longitudeDestino });

      return {
        coordinates,
        distance: 0,
        duration: 0
      };
    }
  };

  const handleRequestAction = async (action) => {
    Alert.alert(
      'Confirmar Ação',
      `Tem certeza que deseja ${action === 'APROVADO' ? 'aprovar' : 'recusar'} esta solicitação?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: action === 'APROVADO' ? 'default' : 'destructive',
          onPress: () => processRequest(action)
        }
      ]
    );
  };

  const processRequest = async (action) => {
    try {
      setProcessingAction(true);
      
      const response = await apiClient.put(
        `/pedidos/${request.id}/status/${action}`,
        null,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      const actionText = action === 'APROVADO' ? 'aprovada' : 'recusada';
      Alert.alert(
        'Sucesso',
        `Solicitação ${actionText} com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error(`Erro ao processar solicitação:`, error);
      const errorMessage = error.response?.data?.message || 
        `Não foi possível ${action === 'APROVADO' ? 'aprovar' : 'recusar'} a solicitação.`;
      Alert.alert('Erro', errorMessage);
    } finally {
      setProcessingAction(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Data inválida';
    
    try {
      if (Array.isArray(date)) {
        const [ano, mes, dia, hora = 0, minuto = 0] = date;
        return format(new Date(ano, mes - 1, dia, hora, minuto), 'dd/MM/yyyy HH:mm');
      } else if (typeof date === 'string') {
        return format(new Date(date), 'dd/MM/yyyy HH:mm');
      }
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} min`;
    }
  };

  const formatDistance = (meters) => {
    if (!meters) return '0 km';
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const centerMapOnRoute = () => {
    if (mapRef.current) {
      // Collect all coordinates to fit in view
      const allCoordinates = [];
      
      // Add original route coordinates if available
      if (originalRoute?.coordinates?.length > 0) {
        allCoordinates.push(...originalRoute.coordinates);
        console.log('Added original route coordinates:', originalRoute.coordinates.length);
      }
      
      // Add detour route coordinates if available (and different from original)
      if (detourRoute?.coordinates?.length > 0) {
        allCoordinates.push(...detourRoute.coordinates);
        console.log('Added detour route coordinates:', detourRoute.coordinates.length);
      }
      
      // Add marker coordinates as fallback
      if (allCoordinates.length === 0) {
        console.log('No route coordinates found, using marker coordinates');
        allCoordinates.push(
          { latitude: ride.latitudePartida, longitude: ride.longitudePartida },
          { latitude: ride.latitudeDestino, longitude: ride.longitudeDestino }
        );
        
        if (request.solicitacao.latitudeOrigem && request.solicitacao.longitudeOrigem) {
          allCoordinates.push({ 
            latitude: request.solicitacao.latitudeOrigem, 
            longitude: request.solicitacao.longitudeOrigem 
          });
        }
        
        if (request.solicitacao.latitudeDestino && request.solicitacao.longitudeDestino) {
          allCoordinates.push({ 
            latitude: request.solicitacao.latitudeDestino, 
            longitude: request.solicitacao.longitudeDestino 
          });
        }
      }

      console.log('Total coordinates for map fitting:', allCoordinates.length);

      if (allCoordinates.length > 0) {
        mapRef.current.fitToCoordinates(allCoordinates, {
          edgePadding: {
            top: 100,
            right: 50,
            bottom: 100,
            left: 50
          },
          animated: true
        });
      }
    }
  };

  useEffect(() => {
    // Center the map after both routes are loaded or after a delay
    const timer = setTimeout(() => centerMapOnRoute(), 1000);
    return () => clearTimeout(timer);
  }, [originalRoute, detourRoute]);

  if (!request || !ride) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Dados da solicitação não disponíveis</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary.main} />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.headerBackButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Solicitação</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Calculando impacto da rota...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: ride.latitudePartida,
                longitude: ride.longitudePartida,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {/* Original route */}
              {originalRoute?.coordinates && originalRoute.coordinates.length > 1 && (
                <Polyline
                  coordinates={originalRoute.coordinates}
                  strokeWidth={3}
                  strokeColor={COLORS.text.medium}
                  lineDashPattern={[5, 5]}
                  zIndex={1}
                />
              )}

              {/* Detour route */}
              {detourRoute?.coordinates && detourRoute.coordinates.length > 1 && (
                <Polyline
                  coordinates={detourRoute.coordinates}
                  strokeWidth={4}
                  strokeColor={COLORS.primary.main}
                  zIndex={2}
                />
              )}

              {/* Driver start marker */}
              <Marker
                coordinate={{
                  latitude: ride.latitudePartida,
                  longitude: ride.longitudePartida
                }}
                title="Partida do Motorista"
                pinColor={COLORS.primary.main}
              />

              {/* Driver end marker */}
              <Marker
                coordinate={{
                  latitude: ride.latitudeDestino,
                  longitude: ride.longitudeDestino
                }}
                title="Destino do Motorista"
                pinColor={COLORS.primary.main}
              />

              {/* Passenger pickup marker */}
              {request.solicitacao.latitudeOrigem && request.solicitacao.longitudeOrigem && (
                <Marker
                  coordinate={{
                    latitude: request.solicitacao.latitudeOrigem,
                    longitude: request.solicitacao.longitudeOrigem
                  }}
                  title="Embarque do Passageiro"
                  pinColor={COLORS.success.main}
                />
              )}

              {/* Passenger dropoff marker */}
              {request.solicitacao.latitudeDestino && request.solicitacao.longitudeDestino && (
                <Marker
                  coordinate={{
                    latitude: request.solicitacao.latitudeDestino,
                    longitude: request.solicitacao.longitudeDestino
                  }}
                  title="Desembarque do Passageiro"
                  pinColor={COLORS.warning.main}
                />
              )}
            </MapView>

            {/* Map legend */}
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: COLORS.text.medium }]} />
                <Text style={styles.legendText}>Rota Original</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: COLORS.primary.main }]} />
                <Text style={styles.legendText}>Rota com Desvio</Text>
              </View>
            </View>
          </View>

          {/* Scrollable Details card */}
          <View style={styles.detailsContainer}>
            <ScrollView 
              style={styles.detailsCard}
              contentContainerStyle={styles.detailsCardContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Passenger info */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-circle-outline" size={24} color={COLORS.primary.main} />
                  <Text style={styles.sectionTitle}>Informações do Passageiro</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nome:</Text>
                  <Text style={styles.infoValue}>{request.solicitacao.nomeEstudante}</Text>
                </View>
                
                {request.solicitacao.avaliacaoMedia && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Avaliação:</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color={COLORS.warning.main} />
                      <Text style={styles.ratingText}>
                        {request.solicitacao.avaliacaoMedia.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Route info */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="map-outline" size={24} color={COLORS.primary.main} />
                  <Text style={styles.sectionTitle}>Detalhes da Rota</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Origem:</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>
                    {request.solicitacao.origem}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Destino:</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>
                    {request.solicitacao.destino}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Horário Desejado:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(request.solicitacao.horarioChegada)}
                  </Text>
                </View>
              </View>

              {/* Route impact */}
              {detourInfo && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="analytics-outline" size={24} color={COLORS.primary.main} />
                    <Text style={styles.sectionTitle}>Impacto na Rota</Text>
                  </View>
                  
                  <View style={styles.impactContainer}>
                    <View style={styles.impactItem}>
                      <Text style={styles.impactLabel}>Tempo adicional:</Text>
                      <Text style={[styles.impactValue, styles.impactTime]}>
                        +{formatDuration(detourInfo.additionalTimeSeconds)}
                      </Text>
                    </View>
                    
                    <View style={styles.impactItem}>
                      <Text style={styles.impactLabel}>Distância adicional:</Text>
                      <Text style={[styles.impactValue, styles.impactDistance]}>
                        +{formatDistance(detourInfo.additionalDistanceMeters)}
                      </Text>
                    </View>
                  </View>
                  
                  {detourInfo.estimatedArrivalTime && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Nova chegada estimada:</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(detourInfo.estimatedArrivalTime)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Action buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRequestAction('REJEITADO')}
                  disabled={processingAction}
                >
                  {processingAction ? (
                    <ActivityIndicator size="small" color={COLORS.text.light} />
                  ) : (
                    <>
                      <Ionicons name="close-circle-outline" size={20} color={COLORS.text.light} />
                      <Text style={styles.actionText}>Recusar</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleRequestAction('APROVADO')}
                  disabled={processingAction}
                >
                  {processingAction ? (
                    <ActivityIndicator size="small" color={COLORS.text.light} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.text.light} />
                      <Text style={styles.actionText}>Aprovar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  headerGradient: {
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
  },
  headerBackButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
    textAlign: 'center',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.medium,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.45, // Increased map height slightly
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLegend: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  legendLine: {
    width: 20,
    height: 3,
    marginRight: SPACING.xs,
    borderRadius: 1.5,
  },
  legendText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.dark,
  },
  debugInfo: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  debugText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.medium,
  },
  detailsContainer: {
    flex: 1,
    marginTop: -RADIUS.xl,
  },
  detailsCard: {
    flex: 1,
    backgroundColor: COLORS.background.light,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: height * 0.5, // Limit height to ensure scrollability
  },
  detailsCardContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl, // Extra padding at bottom for action buttons
    flexGrow: 1, // Allow content to grow and enable scrolling
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.dark,
    marginLeft: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.medium,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.dark,
    flex: 2,
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.dark,
    marginLeft: SPACING.xs,
  },
  impactContainer: {
    backgroundColor: COLORS.background.main,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  impactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  impactLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.dark,
  },
  impactValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  impactTime: {
    color: COLORS.warning.main,
  },
  impactDistance: {
    color: COLORS.info.main,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.light,
    marginLeft: SPACING.xs,
  },
  approveButton: {
    backgroundColor: COLORS.success.main,
  },
  rejectButton: {
    backgroundColor: COLORS.danger.main,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.text.medium,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  backButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.light,
  },
});
