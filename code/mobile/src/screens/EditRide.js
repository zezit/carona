import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Keyboard,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Reanimated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

import RideFormBottomSheet from '../components/ride/RideFormBottomSheet';
import { LoadingIndicator } from '../components/ui';
import { COLORS, RADIUS } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';
import { parseApiDate, formatDateForApi } from '../utils/dateUtils';

// Bottom sheet heights for different positions (approximate)
const BOTTOM_SHEET_HEIGHTS = {
    COLLAPSED: 120,
    HALF: 300,
    EXPANDED: 500
};

const EditRide = ({ navigation, route }) => {
    const { ride, driverDetails, onUpdate } = route.params || {};
    const { authToken } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);

    // Define state variables for location data - updated for better navigation handling
    const [origin, setOrigin] = useState(ride?.pontoPartida || '');
    const [destination, setDestination] = useState(ride?.pontoDestino || '');
    const [originLat, setOriginLat] = useState(ride?.latitudePartida);
    const [originLng, setOriginLng] = useState(ride?.longitudePartida);
    const [destLat, setDestLat] = useState(ride?.latitudeDestino);
    const [destLng, setDestLng] = useState(ride?.longitudeDestino);
    const [departureDate, setDepartureDate] = useState(parseApiDate(ride?.dataHoraPartida));
    const [availableSeats, setAvailableSeats] = useState(ride?.vagas?.toString() || '1');
    const [notes, setNotes] = useState(ride?.observacoes || '');
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [duration, setDuration] = useState(0);
    const [mapHeight, setMapHeight] = useState('100%');
    const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    // Add a ref to store and persist the original departure date
    const originalDepartureDateRef = useRef(departureDate);

    // Check for location updates from the LocationSelectionPage
    useEffect(() => {
        // When returning from LocationSelectionPage, update location data
        const {
            departure,
            departureLocation,
            arrival,
            arrivalLocation,
            isReturningFromLocationSelection
        } = route.params || {};

        if (isReturningFromLocationSelection && departureLocation && arrivalLocation) {
            console.log('Returning from location selection with new data:', {
                departure, departureLocation, arrival, arrivalLocation
            });

            // Update ONLY the location data, not the date
            setOrigin(departure);
            setDestination(arrival);
            setOriginLat(departureLocation.latitude);
            setOriginLng(departureLocation.longitude);
            setDestLat(arrivalLocation.latitude);
            setDestLng(arrivalLocation.longitude);

            // Use the ref to ensure we keep the original departure date
            // Don't modify the current departureDate state here

            // Refetch routes with new coordinates
            // Use setTimeout to ensure state updates have been applied
            setTimeout(() => {
                fetchRoutes(
                    departureLocation.latitude,
                    departureLocation.longitude,
                    arrivalLocation.latitude,
                    arrivalLocation.longitude
                );

                // Don't try to restore the departure date here
                // The current state should remain unchanged
            }, 500);
        }
    }, [route.params]);

    // Store original departure date in ref when it's first set
    useEffect(() => {
        if (departureDate && !originalDepartureDateRef.current) {
            originalDepartureDateRef.current = departureDate;
        }
    }, []);

    // After fetching routes, ensure we center the map on the route
    useEffect(() => {
        if (routes && routes.length > 0 && selectedRoute) {
            // Re-center map whenever routes are updated
            fitMapToCoordinates(selectedRoute.pontos);
        }
    }, [routes, selectedRoute]);

    // Calculate departure location
    const departureLocation = originLat && originLng
        ? { latitude: originLat, longitude: originLng }
        : null;

    // Calculate arrival location
    const arrivalLocation = destLat && destLng
        ? { latitude: destLat, longitude: destLng }
        : null;

    // Animated value for button opacity
    const centerButtonOpacity = useSharedValue(1);

    // Add animated value for location button
    const locationButtonHeight = useSharedValue(80);
    const locationButtonOpacity = useSharedValue(1);

    // Define animated style for location button
    const locationButtonStyle = useAnimatedStyle(() => {
        return {
            height: locationButtonHeight.value,
            opacity: locationButtonOpacity.value,
        };
    });

    // Calculated bottom sheet height based on index
    const bottomSheetHeight = React.useMemo(() => {
        switch (bottomSheetIndex) {
            case 0: return BOTTOM_SHEET_HEIGHTS.COLLAPSED;
            case 1: return BOTTOM_SHEET_HEIGHTS.HALF;
            case 2: return BOTTOM_SHEET_HEIGHTS.EXPANDED;
            default: return BOTTOM_SHEET_HEIGHTS.COLLAPSED;
        }
    }, [bottomSheetIndex]);

    // Add keyboard listeners to adjust map height
    useEffect(() => {
        const keyboardWillShowListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillShow', () => setMapHeight('50%'))
            : Keyboard.addListener('keyboardDidShow', () => setMapHeight('50%'));

        const keyboardWillHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => setMapHeight('100%'))
            : Keyboard.addListener('keyboardDidHide', () => setMapHeight('100%'));

        // Cleanup
        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    // Get route data when component mounts
    useEffect(() => {
        if (ride?.latitudePartida && ride?.longitudePartida && ride?.latitudeDestino && ride?.longitudeDestino) {
            fetchRoutes();
        }
    }, []);

    // Control button visibility based on bottom sheet position
    useEffect(() => {
        if (bottomSheetIndex === 0) {
            // When bottom sheet is collapsed, show both buttons normally
            centerButtonOpacity.value = withTiming(1, { duration: 150 });
            locationButtonHeight.value = withTiming(80, { duration: 200 });
            locationButtonOpacity.value = withTiming(1, { duration: 150 });
        } else if (bottomSheetIndex === 1) {
            // When bottom sheet is at half position, hide center button and make location button compact
            centerButtonOpacity.value = withTiming(0, { duration: 100 });
            locationButtonHeight.value = withTiming(60, { duration: 200 });
            locationButtonOpacity.value = withTiming(0.9, { duration: 150 });
        } else {
            // When bottom sheet is fully expanded, hide center button and minimize location button
            centerButtonOpacity.value = withTiming(0, { duration: 100 });
            locationButtonHeight.value = withTiming(40, { duration: 200 });
            locationButtonOpacity.value = withTiming(0.7, { duration: 150 });
        }
    }, [bottomSheetIndex, centerButtonOpacity, locationButtonHeight, locationButtonOpacity]);

    // Fetch route data between origin and destination - updated with parameters
    const fetchRoutes = async (startLat, startLng, endLat, endLng) => {
        try {
            // Use provided coordinates or fall back to state values
            const latStart = startLat || originLat;
            const lngStart = startLng || originLng;
            const latEnd = endLat || destLat;
            const lngEnd = endLng || destLng;

            if (!latStart || !lngStart || !latEnd || !lngEnd) {
                console.error('Missing coordinates for route calculation');
                return;
            }

            const response = await apiClient.get(
                `/maps/trajectories?startLat=${latStart}&startLon=${lngStart}&endLat=${latEnd}&endLon=${lngEnd}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.length > 0) {
                // Transform backend data format to mobile expected format
                const processedRoutes = response.data.map((route, index) => {
                    // Convert coordinates from [[lat, lon], [lat, lon], ...] to [{latitude, longitude}, ...]
                    const pontos = route.coordenadas.map(coord => ({
                        latitude: coord[0],
                        longitude: coord[1]
                    }));

                    // Set descriptions based on index
                    let description = index === 0 ? 'Principal' : `Alternativa ${index}`;

                    return {
                        ...route,
                        pontos,
                        // Ensure distance and duration fields are correctly mapped
                        distanciaMetros: route.distanciaMetros ?? 0,
                        duracaoSegundos: route.tempoSegundos || 0,
                        descricao: description
                    };
                });

                // Limit to max 2 routes (primary and one alternative)
                const limitedRoutes = processedRoutes.slice(0, 2);

                setRoutes(limitedRoutes);
                setSelectedRoute(limitedRoutes[0]);
                setDuration(limitedRoutes[0].duracaoSegundos || 0);

                // Fit map to show all routes
                const allCoordinates = limitedRoutes.flatMap(route => route.pontos);
                fitMapToCoordinates(allCoordinates);
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
            Alert.alert('Erro', 'Não foi possível calcular a rota. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Fit map to show the entire route
    const fitMapToCoordinates = (coordinates) => {
        if (!coordinates || coordinates.length === 0 || !mapRef.current) return;

        mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: {
                top: 70,
                right: 50,
                bottom: bottomSheetHeight + 50,
                left: 50
            },
            animated: true
        });
    };

    // Center map on locations
    const centerMapOnLocations = () => {
        if (!mapRef.current) return;

        if (selectedRoute && selectedRoute.pontos && selectedRoute.pontos.length > 0) {
            // If we have a route, fit to the entire route
            fitMapToCoordinates(selectedRoute.pontos);
        } else if (departureLocation && arrivalLocation) {
            // If we have both locations but no route yet
            mapRef.current.fitToCoordinates(
                [departureLocation, arrivalLocation],
                {
                    edgePadding: {
                        top: 70,
                        right: 50,
                        bottom: bottomSheetHeight + 50,
                        left: 50
                    },
                    animated: true
                }
            );
        } else if (departureLocation) {
            // If we only have departure location
            mapRef.current.animateToRegion({
                latitude: departureLocation.latitude,
                longitude: departureLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        } else if (arrivalLocation) {
            // If we only have arrival location
            mapRef.current.animateToRegion({
                latitude: arrivalLocation.latitude,
                longitude: arrivalLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    // Handle change locations button press
    const handleChangeLocations = () => {
        navigation.navigate('LocationSelection', {
            departure: origin,
            departureLocation,
            arrival: destination,
            arrivalLocation,
            comingFromRegisterRide: true,
            carAvailableSeats: driverDetails?.carro?.capacidadePassageiros,
            isEditingRide: true,
            rideId: ride?.id
        });
    };

    // Handle selecting a different route
    const handleSelectRoute = (route) => {
        setSelectedRoute(route);
        setDuration(route.duracaoSegundos || 0);
        fitMapToCoordinates(route.pontos);
    };

    const handleDateChange = (mode, date) => {
        if (mode === 'departure') {
            setDepartureDate(date);
            // If we have a route with duration, calculate arrival time automatically
            if (duration > 0) {
                // No need to set arrival date explicitly as it's calculated when needed
            }
        } else if (mode === 'arrival') {
            // If we have a route with duration, calculate departure time from arrival
            if (duration > 0) {
                const calculatedDepartureDate = new Date(date.getTime() - (duration * 1000));
                setDepartureDate(calculatedDepartureDate);
            } else {
                // No route yet, just set departure date same as arrival for now
                setDepartureDate(date);
            }
        }
    };

    // Handle seats change
    const handleSeatsChange = (value) => {
        const newValue = parseInt(value, 10);
        // Convert carAvailableSeats to number and provide a fallback value of 4
        const maxSeats = driverDetails?.carro?.capacidadePassageiros
            ? parseInt(driverDetails.carro.capacidadePassageiros, 10)
            : 4;

        if (newValue > maxSeats) {
            Alert.alert(
                'Limite de Assentos',
                `Você não pode oferecer mais do que ${maxSeats} vagas, pois este é o limite de passageiros configurado para o seu veículo.`,
            );
            return;
        }
        setAvailableSeats(value);
    };

    // Handle bottom sheet index change
    const handleSheetChanges = (index) => {
        setBottomSheetIndex(index);
    };

    // Format duration from seconds to human-readable format
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

    // Format distance in km
    const formatDistance = (meters) => {
        if (!meters) return '0 km';
        const km = meters / 1000;
        return `${km.toFixed(1)} km`;
    };

    // Submit the ride update
    const handleSubmitRide = async () => {
        if (!selectedRoute || !departureLocation || !arrivalLocation) {
            Alert.alert('Erro', 'Selecione os pontos de partida e chegada para continuar.');
            return;
        }

        try {
            setLoading(true);

            // Make sure departureDate is valid before calculating arrivalDate
            const arrivalDate = departureDate 
                ? new Date(departureDate.getTime() + (duration * 1000))
                : new Date(Date.now() + (duration * 1000));

            const rideData = {
                pontoPartida: origin,
                latitudePartida: departureLocation.latitude,
                longitudePartida: departureLocation.longitude,
                pontoDestino: destination,
                latitudeDestino: arrivalLocation.latitude,
                longitudeDestino: arrivalLocation.longitude,
                dataHoraPartida: formatDateForApi(departureDate),
                dataHoraChegada: formatDateForApi(arrivalDate),
                vagas: parseInt(availableSeats),
                observacoes: notes
            };

            const response = await apiClient.put(`/carona/${ride?.id}`, rideData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.success) {
                Alert.alert('Sucesso', 'Carona atualizada com sucesso');

                // Update the ride in the parent screen
                if (onUpdate && typeof onUpdate === 'function') {
                    onUpdate(response.data);
                }

                navigation.goBack();
            } else {
                const errorMessage = response.error?.message || 'Não foi possível atualizar a carona';
                Alert.alert('Erro', errorMessage);
            }
        } catch (error) {
            console.error('Error updating ride:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao atualizar a carona');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !routes.length) {
        return (
            <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LoadingIndicator text="Carregando informações..." />
            </View>
        );
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={[styles.map, { height: mapHeight }]}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: ride?.latitudePartida || -19.9322352,
                        longitude: ride?.longitudePartida || -43.9376369,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {departureLocation && (
                        <Marker
                            coordinate={departureLocation}
                            title="Partida"
                            pinColor="#4285F4"
                        />
                    )}

                    {arrivalLocation && (
                        <Marker
                            coordinate={arrivalLocation}
                            title="Chegada"
                            pinColor="#34A853"
                        />
                    )}

                    {/* Render all routes (up to 2) with the selected one having a thicker line */}
                    {routes.map((route, index) => (
                        <Polyline
                            key={index}
                            coordinates={route.pontos}
                            strokeWidth={route === selectedRoute ? 5 : 3}
                            strokeColor={route === selectedRoute ? COLORS.primary : '#7FB3F5'}
                            onPress={() => handleSelectRoute(route)}
                        />
                    ))}
                </MapView>

                {/* Top bar with back button and title */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>

                    <Text style={styles.titleText}>Editar Carona</Text>

                    <TouchableOpacity
                        style={styles.centerMapButton}
                        onPress={centerMapOnLocations}
                    >
                        <Ionicons name="locate" size={22} color={COLORS.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Location edit button */}
                <Reanimated.View style={[styles.locationEditButton, locationButtonStyle]}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleChangeLocations}
                        style={{ flex: 1 }}
                    >
                        <View style={styles.locationEditContent}>
                            <View style={styles.locationIcons}>
                                <View style={[styles.locationIcon, styles.departureIcon]}>
                                    <Ionicons name="location" size={14} color="#FFFFFF" />
                                </View>
                                <View style={styles.locationConnector} />
                                <View style={[styles.locationIcon, styles.arrivalIcon]}>
                                    <Ionicons name="navigate" size={14} color="#FFFFFF" />
                                </View>
                            </View>
                            <View style={styles.locationTexts}>
                                <Text numberOfLines={1} style={styles.locationEditText}>
                                    {origin || 'Selecionar partida'}
                                </Text>
                                <Text numberOfLines={1} style={styles.locationEditText}>
                                    {destination || 'Selecionar destino'}
                                </Text>
                            </View>
                            <View style={styles.locationEditIcon}>
                                <Ionicons name="pencil" size={16} color={COLORS.primary} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Reanimated.View>
            </View>

            <RideFormBottomSheet
                ref={bottomSheetRef}
                departure={origin}
                arrival={destination}
                departureDate={departureDate}
                onDateChange={handleDateChange}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                seats={availableSeats}
                onSeatsChange={handleSeatsChange}
                observations={notes}
                onObservationsChange={setNotes}
                onSubmit={handleSubmitRide}
                loading={loading}
                duration={duration}
                hasValidRoute={!!selectedRoute}
                onSheetChange={handleSheetChanges}
                routes={routes}
                selectedRoute={selectedRoute}
                onSelectRoute={handleSelectRoute}
                formatDuration={formatDuration}
                formatDistance={formatDistance}
                initialCarAvailableSeats={driverDetails?.carro?.capacidadePassageiros}
                isEditMode={true}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    topBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    centerMapButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    titleText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    locationEditButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 100 : 90,
        left: 16,
        right: 16,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.md,
        paddingVertical: 6,
        paddingHorizontal: 10,
        zIndex: 9,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    locationEditContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcons: {
        width: 24,
        alignItems: 'center',
        marginRight: 6,
    },
    locationIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    departureIcon: {
        backgroundColor: COLORS.primary,
    },
    arrivalIcon: {
        backgroundColor: COLORS.secondary,
    },
    locationConnector: {
        width: 2,
        height: 10,
        backgroundColor: COLORS.border,
        marginVertical: 1,
    },
    locationTexts: {
        flex: 1,
        height: '90%',
        justifyContent: 'space-between',
    },
    locationEditText: {
        fontSize: 13,
        color: COLORS.text.primary,
        marginVertical: 1,
        textAlign: 'left',
        paddingVertical: 2,
        flexShrink: 1,
    },
    locationEditIcon: {
        padding: 4,
    },
});

export default EditRide;