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
import { apiClient, checkRideHasConfirmedPassengers } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';
import { parseApiDate } from '../utils/dateUtils';

// Bottom sheet heights for different positions (approximate)
const BOTTOM_SHEET_HEIGHTS = {
    COLLAPSED: 120,
    HALF: 300,
    EXPANDED: 500
};

// Helper function to format Date object to "yyyy-MM-dd\'T\'HH:mm:ss" in local time
function formatLocalDateTime(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const EditRide = ({ navigation, route }) => {
    const { ride, driverDetails, onUpdate, viewOnly } = route.params || {};
    const { authToken } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);
    
    // New state variables for confirmed passengers and location editing restrictions
    const [hasConfirmedPassengers, setHasConfirmedPassengers] = useState(false);
    const [confirmedPassengersCount, setConfirmedPassengersCount] = useState(0);
    const [checkingPassengers, setCheckingPassengers] = useState(true);

    // New state for passenger pickup/dropoff waypoints - simplified
    const [passengerWaypoints, setPassengerWaypoints] = useState([]);

    // Store the initial ride data to persist across navigation
    const initialRideDataRef = useRef({
        ride,
        driverDetails,
        onUpdate
    });

    // Update ref when initial params change, but preserve across location selection returns
    useEffect(() => {
        const { isReturningFromLocationSelection } = route.params || {};
        if (!isReturningFromLocationSelection && ride) {
            initialRideDataRef.current = {
                ride,
                driverDetails,
                onUpdate
            };
        }
    }, [ride, driverDetails, onUpdate]);

    // Use either current params or preserved initial data
    const currentRide = ride || initialRideDataRef.current.ride;
    const currentDriverDetails = driverDetails || initialRideDataRef.current.driverDetails;
    const currentOnUpdate = onUpdate || initialRideDataRef.current.onUpdate;

    // Define state variables for location data - updated for better navigation handling
    const [origin, setOrigin] = useState(currentRide?.pontoPartida || '');
    const [destination, setDestination] = useState(currentRide?.pontoDestino || '');
    const [originLat, setOriginLat] = useState(currentRide?.latitudePartida);
    const [originLng, setOriginLng] = useState(currentRide?.longitudePartida);
    const [destLat, setDestLat] = useState(currentRide?.latitudeDestino);
    const [destLng, setDestLng] = useState(currentRide?.longitudeDestino);
    const [departureDate, setDepartureDate] = useState(parseApiDate(currentRide?.dataHoraPartida));
    const [availableSeats, setAvailableSeats] = useState(currentRide?.vagas?.toString() || '1');
    const [notes, setNotes] = useState(currentRide?.observacoes || '');
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [duration, setDuration] = useState(0);
    const [mapHeight, setMapHeight] = useState('100%');
    const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    // Store the original departure date to preserve it across navigation
    const originalDepartureDateRef = useRef(parseApiDate(currentRide?.dataHoraPartida));

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

            // Update ONLY the location data, preserve the original date/time
            setOrigin(departure);
            setDestination(arrival);
            setOriginLat(departureLocation.latitude);
            setOriginLng(departureLocation.longitude);
            setDestLat(arrivalLocation.latitude);
            setDestLng(arrivalLocation.longitude);

            // Restore the original departure date to ensure it doesn't get lost
            if (originalDepartureDateRef.current) {
                setDepartureDate(originalDepartureDateRef.current);
            }

            // Refetch routes with new coordinates
            // Use setTimeout to ensure state updates have been applied
            setTimeout(() => {
                fetchRoutes(
                    departureLocation.latitude,
                    departureLocation.longitude,
                    arrivalLocation.latitude,
                    arrivalLocation.longitude
                );
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

    // Check for confirmed passengers when component mounts
    useEffect(() => {
        checkForConfirmedPassengers();
        // Note: Don't call fetchPassengerWaypoints() here as it will be handled by fetchRoutes()
    }, [currentRide?.id, authToken]);

    // Function to check if ride has confirmed passengers
    const checkForConfirmedPassengers = async () => {
        if (!currentRide?.id || !authToken) {
            setCheckingPassengers(false);
            return;
        }

        try {
            setCheckingPassengers(true);
            const response = await checkRideHasConfirmedPassengers(currentRide.id, authToken);
            
            if (response.success) {
                setHasConfirmedPassengers(response.data.hasConfirmedPassengers);
                setConfirmedPassengersCount(response.data.passengerCount);
                console.log('Confirmed passengers check:', response.data);
            } else {
                console.error('Error checking confirmed passengers:', response.error);
            }
        } catch (error) {
            console.error('Error checking confirmed passengers:', error);
        } finally {
            setCheckingPassengers(false);
        }
    };

    // Function to fetch and extract passenger waypoints from confirmed passengers
    const fetchPassengerWaypoints = async () => {
        if (!currentRide?.id || !authToken) {
            return;
        }

        try {
            console.log('Fetching passenger waypoints for ride:', currentRide.id);
            
            // Get approved ride requests (pedidosEntrada) to access passenger pickup/dropoff locations
            const motoristaId = currentRide.motorista?.id || currentDriverDetails?.id;
            
            if (!motoristaId) {
                console.error('Missing motorista ID for fetching passenger waypoints');
                return;
            }

            const pedidosResponse = await apiClient.get(`/pedidos/motorista/${motoristaId}/carona/${currentRide.id}?page=0&size=100`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (pedidosResponse.success && pedidosResponse.data?.content) {
                const waypoints = [];

                // Process each approved passenger request
                pedidosResponse.data.content.forEach((pedido, index) => {
                    if (pedido.status === 'APROVADO' && pedido.solicitacao) {
                        const solicitacao = pedido.solicitacao;
                        const estudante = solicitacao.estudante || {};
                        
                        // Add pickup point
                        if (solicitacao.latitudeOrigem && solicitacao.longitudeOrigem) {
                            waypoints.push({
                                latitude: solicitacao.latitudeOrigem,
                                longitude: solicitacao.longitudeOrigem,
                                type: 'pickup',
                                passenger: solicitacao.nomeEstudante || estudante.nome || 'Passageiro',
                                address: solicitacao.origem,
                                id: `pickup-${pedido.id}`,
                                pedidoId: pedido.id,
                                matricula: estudante.matricula,
                                curso: estudante.curso,
                                email: estudante.email,
                                ordem: (index * 2) + 1, // Pickup has odd numbers
                                horarioSolicitado: solicitacao.horarioChegada
                            });
                        }

                        // Add dropoff point
                        if (solicitacao.latitudeDestino && solicitacao.longitudeDestino) {
                            waypoints.push({
                                latitude: solicitacao.latitudeDestino,
                                longitude: solicitacao.longitudeDestino,
                                type: 'dropoff',
                                passenger: solicitacao.nomeEstudante || estudante.nome || 'Passageiro',
                                address: solicitacao.destino,
                                id: `dropoff-${pedido.id}`,
                                pedidoId: pedido.id,
                                matricula: estudante.matricula,
                                curso: estudante.curso,
                                email: estudante.email,
                                ordem: (index * 2) + 2, // Dropoff has even numbers
                                horarioSolicitado: solicitacao.horarioChegada
                            });
                        }
                    }
                });

                setPassengerWaypoints(waypoints);
                console.log('Passenger waypoints loaded:', waypoints);
            } else {
                console.log('No approved passenger requests found');
                setPassengerWaypoints([]);
            }
        } catch (error) {
            console.error('Error fetching passenger waypoints:', error);
            setPassengerWaypoints([]);
        }
    };

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

    // Fetch route data between origin and destination - updated to use complete route with passenger waypoints
    const fetchRoutes = async (startLat, startLng, endLat, endLng) => {
        try {
            setLoading(true);
            
            // Use provided coordinates or fall back to state values
            const latStart = startLat || originLat;
            const lngStart = startLng || originLng;
            const latEnd = endLat || destLat;
            const lngEnd = endLng || destLng;

            if (!latStart || !lngStart || !latEnd || !lngEnd) {
                console.error('Missing coordinates for route calculation');
                return;
            }

            // If we have a ride ID, try to get the complete route with passenger waypoints
            if (currentRide?.id) {
                try {
                    console.log('Fetching complete route for ride:', currentRide.id);
                    
                    const completeRouteResponse = await apiClient.get(
                        `/carona/${currentRide.id}/complete-route`,
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (completeRouteResponse.data?.rotaCompleta) {
                        const completeRoute = completeRouteResponse.data;
                        
                        // Convert complete route coordinates to mobile format
                        // rotaCompleta is a TrajetoDto object with coordenadas field
                        const pontos = completeRoute.rotaCompleta.coordenadas.map(coord => ({
                            latitude: coord[0],
                            longitude: coord[1]
                        }));

                        // Update passenger waypoints from the response
                        if (completeRoute.pontosPassageiros && completeRoute.pontosPassageiros.length > 0) {
                            const waypoints = completeRoute.pontosPassageiros.map(ponto => ({
                                latitude: ponto.latitude,
                                longitude: ponto.longitude,
                                type: ponto.tipo === 'EMBARQUE' ? 'pickup' : 'dropoff',
                                passenger: ponto.nomePassageiro,
                                address: ponto.endereco,
                                id: `${ponto.tipo.toLowerCase()}-${ponto.passageiroId}`,
                                pedidoId: ponto.pedidoId,
                                ordem: ponto.ordem,
                                matricula: ponto.matricula,
                                curso: ponto.curso,
                                email: ponto.email
                            }));
                            setPassengerWaypoints(waypoints);
                            console.log('Updated passenger waypoints from complete route (optimized order):', waypoints);
                        } else {
                            // No passengers, clear waypoints
                            setPassengerWaypoints([]);
                            console.log('No passenger waypoints found for this ride');
                        }

                        // Create the processed route
                        const processedRoute = {
                            coordenadas: completeRoute.rotaCompleta.coordenadas,
                            pontos,
                            distanciaMetros: completeRoute.distanciaTotalMetros || 0,
                            duracaoSegundos: completeRoute.tempoTotalSegundos || 0,
                            descricao: 'Rota Completa com Passageiros',
                            isCompleteRoute: true
                        };

                        setRoutes([processedRoute]);
                        setSelectedRoute(processedRoute);
                        setDuration(processedRoute.duracaoSegundos || 0);

                        // Fit map to show the complete route including passenger waypoints
                        const allCoordinates = [...pontos];
                        if (completeRoute.pontosPassageiros) {
                            completeRoute.pontosPassageiros.forEach(ponto => {
                                allCoordinates.push({
                                    latitude: ponto.latitude,
                                    longitude: ponto.longitude
                                });
                            });
                        }
                        fitMapToCoordinates(allCoordinates);
                        
                        console.log('Complete route loaded successfully:', {
                            totalDistance: completeRoute.distanciaTotalMetros,
                            totalTime: completeRoute.tempoTotalSegundos,
                            passengerStops: completeRoute.pontosPassageiros?.length || 0
                        });
                        
                        return; // Success, exit early
                    }
                } catch (completeRouteError) {
                    console.warn('Complete route not available, falling back to basic route:', completeRouteError);
                    // Fall through to basic route calculation
                }
            }

            // Fallback: Use basic trajectory endpoint if complete route is not available
            console.log('Using basic route calculation');
            
            // Clear passenger waypoints since we're not using the complete route
            setPassengerWaypoints([]);
            
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
                        descricao: description,
                        isCompleteRoute: false
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

    // Handle change locations button press - now with passenger restriction
    const handleChangeLocations = () => {
        // Check if locations can be edited
        if (hasConfirmedPassengers) {
            Alert.alert(
                'Não é possível alterar',
                `Esta carona possui ${confirmedPassengersCount} passageiro(s) confirmado(s). Não é possível alterar os pontos de origem e destino.`,
                [{ text: 'OK', style: 'default' }]
            );
            return;
        }

        navigation.navigate('LocationSelection', {
            departure: origin,
            departureLocation,
            arrival: destination,
            arrivalLocation,
            comingFromRegisterRide: true,
            carAvailableSeats: currentDriverDetails?.carro?.capacidadePassageiros,
            isEditingRide: true,
            rideId: currentRide?.id,
            // Pass the preserved data to ensure continuity
            originalRide: currentRide,
            originalDriverDetails: currentDriverDetails,
            originalOnUpdate: currentOnUpdate
        });
    };

    // Handle selecting a different route
    const handleSelectRoute = (route) => {
        setSelectedRoute(route);
        setDuration(route.duracaoSegundos || 0);
        fitMapToCoordinates(route.pontos);
        // Refresh passenger waypoints when route changes
        fetchPassengerWaypoints();
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
            let departureDateTime = departureDate instanceof Date ? departureDate : new Date(departureDate);
            let arrivalDateTime = new Date(departureDateTime.getTime() + (duration * 1000));

            const now = new Date();
            //previne erro 400 de post de data de saida no passado
            if (departureDateTime < now) {
                departureDateTime = now;
                arrivalDateTime = new Date(departureDateTime.getTime() + (duration * 1000));
            }
            // Ensure both dates are valid
            if (isNaN(departureDateTime.getTime()) || isNaN(arrivalDateTime.getTime())) {
                Alert.alert('Erro', 'Datas de partida ou chegada inválidas.');
                setLoading(false);
                return;
            }

            const rideData = {
                pontoPartida: origin,
                latitudePartida: departureLocation.latitude,
                longitudePartida: departureLocation.longitude,
                pontoDestino: destination,
                latitudeDestino: arrivalLocation.latitude,
                longitudeDestino: arrivalLocation.longitude,
                dataHoraPartida: formatLocalDateTime(departureDateTime),
                dataHoraChegada: formatLocalDateTime(arrivalDateTime),
                vagas: parseInt(availableSeats),
                observacoes: notes
            };

            console.debug("Ride: ", JSON.stringify(rideData, null, 2));

            const response = await apiClient.put(`/carona/${currentRide?.id}`, rideData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.success) {
                Alert.alert('Sucesso', 'Carona atualizada com sucesso');

                // Update the ride in the parent screen
                if (currentOnUpdate && typeof currentOnUpdate === 'function') {
                    currentOnUpdate(response.data);
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

    // Check for confirmed passengers when ride details change
    useEffect(() => {
        const checkConfirmedPassengers = async () => {
            if (currentRide?.id) {
                setCheckingPassengers(true);
                try {
                    const response = await checkRideHasConfirmedPassengers(currentRide.id, authToken);
                    if (response?.data) {
                        setHasConfirmedPassengers(response.data.hasConfirmedPassengers);
                        setConfirmedPassengersCount(response.data.confirmedPassengersCount);
                    }
                } catch (error) {
                    console.error('Error checking confirmed passengers:', error);
                } finally {
                    setCheckingPassengers(false);
                }
            }
        };

        checkConfirmedPassengers();
    }, [currentRide, authToken]);

    // Function to load existing route waypoints from ride data
    const loadExistingRouteWaypoints = () => {
        if (currentRide?.trajetorias && currentRide.trajetorias.length > 0) {
            // Get the principal (main) route from trajetorias
            const principalRoute = currentRide.trajetorias.find(t => t.principal) || currentRide.trajetorias[0];
            
            if (principalRoute?.coordenadas) {
                try {
                    // Parse coordenadas string - it should be in format like "[[-19.9227318,-43.9908267], ...]"
                    const coordinates = JSON.parse(principalRoute.coordenadas);
                    
                    // Convert to the expected format
                    const routePoints = coordinates.map(coord => ({
                        latitude: parseFloat(coord[0]),
                        longitude: parseFloat(coord[1])
                    }));

                    // Extract waypoints (exclude start and end points)
                    const waypoints = extractWaypoints({ pontos: routePoints });
                    setRouteWaypoints(waypoints);

                    // Also set this as the selected route if no routes have been loaded yet
                    if (routes.length === 0) {
                        const existingRoute = {
                            pontos: routePoints,
                            distanciaMetros: principalRoute.distanciaMetros || 0,
                            duracaoSegundos: principalRoute.tempoSegundos || 0,
                            descricao: 'Rota Atual',
                            principal: true
                        };
                        
                        setRoutes([existingRoute]);
                        setSelectedRoute(existingRoute);
                        setDuration(existingRoute.duracaoSegundos || 0);
                    }
                } catch (error) {
                    console.error('Error parsing existing route coordinates:', error);
                }
            }
        }
    };

    // Load existing route when component mounts
    useEffect(() => {
        loadExistingRouteWaypoints();
    }, [currentRide?.trajetorias]);

    // Determine if the screen should be view-only (either from navigation or confirmed passengers)
    const isViewOnly = viewOnly || hasConfirmedPassengers;

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

                    {/* Render routes */}
                    {routes.map((route, index) => (
                        <Polyline
                            key={index}
                            coordinates={route.pontos}
                            strokeWidth={route === selectedRoute ? 5 : 3}
                            strokeColor={route === selectedRoute ? COLORS.primary.main : '#7FB3F5'}
                            onPress={() => handleSelectRoute(route)}
                        />
                    ))}

                    {/* Render passenger waypoints */}
                    {passengerWaypoints.map((waypoint) => (
                        <Marker
                            key={waypoint.id}
                            coordinate={{
                                latitude: waypoint.latitude,
                                longitude: waypoint.longitude,
                            }}
                            title={`${waypoint.type === 'pickup' ? 'Embarque' : 'Desembarque'}: ${waypoint.passenger}`}
                            description={waypoint.address}
                            pinColor={waypoint.type === 'pickup' ? '#FF6B35' : '#8E44AD'}
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

                    <Text style={styles.titleText}>
                        {isViewOnly ? 'Visualizar Carona' : 'Editar Carona'}
                    </Text>

                    <TouchableOpacity
                        style={styles.centerMapButton}
                        onPress={centerMapOnLocations}
                    >
                        <Ionicons name="locate" size={22} color={COLORS.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Location edit button */}
                <Reanimated.View style={[
                    styles.locationEditButton, 
                    locationButtonStyle,
                    isViewOnly && styles.locationEditButtonDisabled
                ]}>
                    <TouchableOpacity
                        activeOpacity={isViewOnly ? 0.3 : 0.7}
                        onPress={isViewOnly ? undefined : handleChangeLocations}
                        style={{ flex: 1 }}
                        disabled={isViewOnly}
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
                                <Text numberOfLines={1} style={[
                                    styles.locationEditText,
                                    isViewOnly && styles.locationEditTextDisabled
                                ]}>
                                    {origin || 'Selecionar partida'}
                                </Text>
                                <Text numberOfLines={1} style={[
                                    styles.locationEditText,
                                    isViewOnly && styles.locationEditTextDisabled
                                ]}>
                                    {destination || 'Selecionar destino'}
                                </Text>
                                {hasConfirmedPassengers && (
                                    <Text style={styles.passengerWarningText}>
                                        {confirmedPassengersCount} passageiro(s) confirmado(s)
                                    </Text>
                                )}
                            </View>
                            <View style={styles.locationEditIcon}>
                                {checkingPassengers ? (
                                    <LoadingIndicator size="small" color={COLORS.primary.main} />
                                ) : (
                                    <Ionicons 
                                        name={hasConfirmedPassengers ? "lock-closed" : "pencil"} 
                                        size={16} 
                                        color={hasConfirmedPassengers ? "#999" : COLORS.primary.main} 
                                    />
                                )}
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
                onDateChange={isViewOnly ? undefined : handleDateChange}
                showDatePicker={showDatePicker}
                setShowDatePicker={isViewOnly ? undefined : setShowDatePicker}
                seats={availableSeats}
                onSeatsChange={isViewOnly ? undefined : handleSeatsChange}
                observations={notes}
                onObservationsChange={isViewOnly ? undefined : setNotes}
                onSubmit={isViewOnly ? undefined : handleSubmitRide}
                loading={loading}
                duration={duration}
                hasValidRoute={!!selectedRoute}
                onSheetChange={handleSheetChanges}
                routes={routes}
                selectedRoute={selectedRoute}
                onSelectRoute={isViewOnly ? undefined : handleSelectRoute}
                formatDuration={formatDuration}
                formatDistance={formatDistance}
                initialCarAvailableSeats={driverDetails?.carro?.capacidadePassageiros}
                isEditMode={!isViewOnly}
                hasConfirmedPassengers={hasConfirmedPassengers}
                confirmedPassengersCount={confirmedPassengersCount}
                checkingPassengers={checkingPassengers}
                navigation={navigation}
                isViewOnly={isViewOnly}
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
        backgroundColor: COLORS.background.card,
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
        backgroundColor: COLORS.background.card,
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
        backgroundColor: COLORS.background.card,
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
        backgroundColor: COLORS.primary.main,
    },
    arrivalIcon: {
        backgroundColor: COLORS.secondary.main,
    },
    locationConnector: {
        width: 2,
        height: 10,
        backgroundColor: COLORS.border.main,
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
    // New styles for disabled location editing
    locationEditButtonDisabled: {
        backgroundColor: '#f5f5f5',
        opacity: 0.8,
    },
    locationEditTextDisabled: {
        color: '#999',
    },
    passengerWarningText: {
        fontSize: 11,
        color: '#ff6b35',
        fontWeight: '500',
        marginTop: 2,
    },
    // Custom marker styles
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    pickupMarker: {
        // Orange for pickup
    },
    dropoffMarker: {
        // Purple for dropoff
    },
    markerNumber: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.primary.main,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    markerNumberText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default EditRide;