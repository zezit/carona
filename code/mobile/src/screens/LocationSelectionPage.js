import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';
import {
  loadRecentAddresses,
  saveRecentAddress,
  searchAddresses,
  getCurrentLocation
} from '../utils/locationUtils';

const LocationSelectionPage = ({ navigation, route }) => {
  // Get params from route if they exist (when coming from RegisterRidePage)
  const {
    departure: initialDeparture,
    departureLocation: initialDepartureLocation,
    arrival: initialArrival,
    arrivalLocation: initialArrivalLocation,
    comingFromRegisterRide,
    comingFromFindRidesPage,
    carAvailableSeats,
    isEditingRide,
    rideId,
    // Preserve original ride data for EditRide navigation
    originalRide,
    originalDriverDetails,
    originalOnUpdate
  } = route.params || {};

  const [departure, setDeparture] = useState(initialDeparture || '');
  const [arrival, setArrival] = useState(initialArrival || '');
  const [departureLocation, setDepartureLocation] = useState(initialDepartureLocation || null);
  const [arrivalLocation, setArrivalLocation] = useState(initialArrivalLocation || null);
  const [activeInput, setActiveInput] = useState(initialDepartureLocation && initialArrivalLocation ? 'none' : 'departure');
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(!initialDepartureLocation);

  // New state for Uber-like functionality
  const [searchResults, setSearchResults] = useState([]);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCurrentLocationOption, setShowCurrentLocationOption] = useState(false);

  // Load recent addresses and saved places on startup
  useEffect(() => {
    loadRecentData();
    if (!departureLocation) {
      loadCurrentLocation();
    } else {
      setLoadingCurrentLocation(false);
    }
  }, []);

  const loadRecentData = async () => {
    try {
      const recent = await loadRecentAddresses();
      setRecentAddresses(recent);
      // TODO: Load saved places from storage
      setSavedPlaces([]);
    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  };

  const loadCurrentLocation = async () => {
    try {
      setLoadingCurrentLocation(true);
      const locationData = await getCurrentLocation();

      setDeparture(formatDisplayAddress(locationData));
      setDepartureLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude
      });
    } catch (error) {
      console.error('Error getting current location on startup:', error);
      setShowCurrentLocationOption(true); // Show "Use current location" option
    } finally {
      setLoadingCurrentLocation(false);
    }
  };

  // Search addresses with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchValue = activeInput === 'departure' ? departure : arrival;
      if (searchValue.trim().length > 2) {
        searchForAddresses(searchValue);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [departure, arrival, activeInput]);

  const searchForAddresses = async (searchText) => {
    try {
      setIsSearching(true);
      const results = await searchAddresses(searchText);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAddress = useCallback(async (address) => {
    try {
      // Save to recent addresses
      await saveRecentAddress(address);
      await loadRecentData();

      if (activeInput === 'departure') {
        setDeparture(formatDisplayAddress(address));
        setDepartureLocation({
          latitude: address.latitude,
          longitude: address.longitude
        });
        // Auto-focus arrival input after selecting departure
        setActiveInput('arrival');
      } else {
        setArrival(formatDisplayAddress(address));
        setArrivalLocation({
          latitude: address.latitude,
          longitude: address.longitude
        });
        // Close suggestions after selecting arrival
        setActiveInput('none');
      }

      setSearchResults([]);
    } catch (error) {
      console.error('Error selecting address:', error);
    }
  }, [activeInput]);

  const handleCurrentLocationPress = useCallback(async () => {
    try {
      setLoadingCurrentLocation(true);
      const locationData = await getCurrentLocation();
      await handleSelectAddress(locationData);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização atual. Verifique se o GPS está ativado e as permissões estão concedidas.'
      );
    } finally {
      setLoadingCurrentLocation(false);
    }
  }, [handleSelectAddress]);

  const handleSwitchLocations = useCallback(() => {
    if (departure && arrival && departureLocation && arrivalLocation) {
      // Swap the values
      const tempDeparture = departure;
      const tempDepartureLocation = departureLocation;

      setDeparture(arrival);
      setDepartureLocation(arrivalLocation);
      setArrival(tempDeparture);
      setArrivalLocation(tempDepartureLocation);
    }
  }, [departure, arrival, departureLocation, arrivalLocation]);

  const isNextButtonEnabled = departureLocation && arrivalLocation;

  // Enhanced address formatting function
  const formatDisplayAddress = (address) => {
    if (!address || !address.endereco) return '';

    // If it's already a well-formatted string, return as is
    if (typeof address.endereco === 'string') {
      // Clean up redundant information and improve readability
      let formattedAddress = address.endereco;

      // Remove duplicate parts (e.g., "123, Rua ABC, 123, Bairro" -> "Rua ABC, 123, Bairro")
      const parts = formattedAddress.split(', ').filter(Boolean);
      const uniqueParts = [];
      const seen = new Set();

      for (const part of parts) {
        const cleanPart = part.trim();
        if (!seen.has(cleanPart.toLowerCase()) && cleanPart) {
          seen.add(cleanPart.toLowerCase());
          uniqueParts.push(cleanPart);
        }
      }

      // Reorganize for better readability: Street + Number, Neighborhood, City
      const reorganized = [];
      let streetName = '';
      let streetNumber = '';
      let neighborhood = '';
      let cityState = '';

      for (let i = 0; i < uniqueParts.length; i++) {
        const part = uniqueParts[i];

        // Check if it's a number (likely street number)
        if (/^\d+$/.test(part)) {
          streetNumber = part;
          continue;
        }

        // Check if it looks like a street name (Rua, Avenida, etc.)
        if (part.match(/^(Rua|Avenida|Av|R\.|Ave|Travessa|Alameda|Praça)/i)) {
          streetName = part;
          continue;
        }

        // Check if it looks like a neighborhood (common Brazilian neighborhood patterns)
        if (part.includes('Bairro') || part.includes('Centro') ||
          (i > 0 && i < uniqueParts.length - 1 && !neighborhood)) {
          neighborhood = part;
          continue;
        }

        // Last parts are likely city/state
        if (i >= uniqueParts.length - 2) {
          cityState += (cityState ? ', ' : '') + part;
          continue;
        }

        // If we don't have a street name yet, this might be it
        if (!streetName) {
          streetName = part;
        } else if (!neighborhood) {
          neighborhood = part;
        }
      }

      // Rebuild the address in a logical order
      const finalParts = [];

      // Add street with number
      if (streetName) {
        if (streetNumber) {
          finalParts.push(`${streetName}, ${streetNumber}`);
        } else {
          finalParts.push(streetName);
        }
      } else if (streetNumber) {
        // If we have a number but no street name, still include it
        finalParts.push(streetNumber);
      }

      if (neighborhood) finalParts.push(neighborhood);
      if (cityState) finalParts.push(cityState);

      return finalParts.join(', ') || formattedAddress;
    }

    return address.endereco;
  };

  // Helper function to truncate long addresses for display
  const truncateAddress = (address, maxLength = 60) => {
    if (!address || address.length <= maxLength) return address;

    // Find a good break point (comma or space) near the max length
    const truncated = address.substring(0, maxLength);
    const lastComma = truncated.lastIndexOf(',');
    const lastSpace = truncated.lastIndexOf(' ');

    const breakPoint = lastComma > maxLength * 0.7 ? lastComma :
      lastSpace > maxLength * 0.7 ? lastSpace : maxLength;

    return address.substring(0, breakPoint) + '...';
  };

  const handleNextPress = useCallback(() => {
    if (isNextButtonEnabled) {
      // Create the location data object to pass back
      const locationData = {
        departureLocation,
        departure,
        arrivalLocation,
        arrival,
        carAvailableSeats
      };

      // If we're editing a ride, navigate back to EditRide
      if (isEditingRide) {
        navigation.navigate('EditRide', {
          ...locationData,
          rideId,
          isReturningFromLocationSelection: true,
          // Pass back the preserved ride data
          ride: originalRide,
          driverDetails: originalDriverDetails,
          onUpdate: originalOnUpdate
        });
      }
      else if (comingFromFindRidesPage) {
        navigation.navigate('FindRides', locationData)
      } else {
        // Otherwise navigate to RegisterRide (new ride creation)
        navigation.navigate('RegisterRide', locationData);
      }
    }
  }, [isNextButtonEnabled, departureLocation, departure, arrivalLocation, arrival, carAvailableSeats, isEditingRide, rideId, comingFromFindRidesPage, navigation, originalRide, originalDriverDetails, originalOnUpdate]);

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary.main} />

      {/* Header with LinearGradient to match app design */}
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Selecionar Locais</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Location Input Section - Uber Style */}
        <View style={styles.locationInputContainer}>
          {/* Departure Input */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <View style={[styles.locationDot, styles.departureDot]} />
            </View>
            <TouchableOpacity
              testID="departure-input-container"
              style={[
                styles.inputWrapper,
                activeInput === 'departure' && styles.activeInput
              ]}
              onPress={() => setActiveInput('departure')}
            >
              {loadingCurrentLocation ? (
                <View style={styles.loadingWrapper}>
                  <ActivityIndicator size="small" color={COLORS.primary.main} />
                  <Text style={styles.loadingText}>Obtendo localização...</Text>
                </View>
              ) : (<TextInput
                testID="departure-input"
                style={styles.textInput}
                placeholder="De onde você está saindo?"
                value={departure}
                onChangeText={(text) => {
                  setDeparture(text);
                  if (!text) setDepartureLocation(null);
                }}
                onFocus={() => setActiveInput('departure')}
                placeholderTextColor={COLORS.text.tertiary}
              />
              )}
              {departure.length > 0 && (
                <TouchableOpacity
                  testID="clear-departure-button"
                  style={styles.clearButton}
                  onPress={() => {
                    setDeparture('');
                    setDepartureLocation(null);
                  }}
                >
                  <Ionicons name="close" size={16} color={COLORS.text.secondary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Connection Line */}
          <View style={styles.connectionLine} />

          {/* Arrival Input */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <View style={[styles.locationDot, styles.arrivalDot]} />
            </View>
            <TouchableOpacity
              testID="arrival-input-container"
              style={[
                styles.inputWrapper,
                activeInput === 'arrival' && styles.activeInput
              ]}
              onPress={() => setActiveInput('arrival')}
            >
              <TextInput
                testID="arrival-input"
                style={styles.textInput}
                placeholder="Para onde você vai?"
                value={arrival}
                onChangeText={(text) => {
                  setArrival(text);
                  if (!text) setArrivalLocation(null);
                }}
                onFocus={() => setActiveInput('arrival')}
                placeholderTextColor={COLORS.text.tertiary}
              />
              {arrival.length > 0 && (
                <TouchableOpacity
                  testID="clear-arrival-button"
                  style={styles.clearButton}
                  onPress={() => {
                    setArrival('');
                    setArrivalLocation(null);
                  }}
                >
                  <Ionicons name="close" size={16} color={COLORS.text.secondary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Switch Button */}
          <TouchableOpacity
            testID="switch-locations-button"
            style={[
              styles.switchButton,
              (!departure || !arrival) && styles.switchButtonDisabled
            ]}
            onPress={handleSwitchLocations}
            disabled={!departure || !arrival}
          >
            <Ionicons
              name="swap-vertical"
              size={18}
              color={departure && arrival ? COLORS.primary.main : COLORS.text.tertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Suggestions List */}
        <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
          {/* Current Location Option (only for departure) */}
          {activeInput === 'departure' && showCurrentLocationOption && (
            <TouchableOpacity
              testID="use-current-location-button"
              style={styles.suggestionItem}
              onPress={handleCurrentLocationPress}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name="locate" size={20} color={COLORS.primary.main} />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>Usar localização atual</Text>
                <Text style={styles.suggestionSubtitle}>Obter sua localização via GPS</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Search Results */}
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              testID={`location-suggestion-${index}`}
              style={styles.suggestionItem}
              onPress={() => handleSelectAddress(result)}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name="location-outline" size={20} color={COLORS.text.secondary} />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle} numberOfLines={2}>{truncateAddress(formatDisplayAddress(result))}</Text>
                <Text style={styles.suggestionSubtitle}>Endereço sugerido</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Recent Places */}
          {activeInput !== 'none' && searchResults.length === 0 && !isSearching && recentAddresses.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Locais Recentes</Text>
              </View>
              {recentAddresses.map((address, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectAddress(address)}
                >
                  <View style={styles.suggestionIcon}>
                    <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
                  </View>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle} numberOfLines={2}>{truncateAddress(formatDisplayAddress(address))}</Text>
                    <Text style={styles.suggestionSubtitle}>Local recente</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Empty state when no recent addresses and no search results */}
          {activeInput !== 'none' && searchResults.length === 0 && !isSearching && recentAddresses.length === 0 && savedPlaces.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyStateTitle}>Nenhum local encontrado</Text>
              <Text style={styles.emptyStateSubtitle}>
                {activeInput === 'departure'
                  ? 'Digite seu endereço de partida ou use a localização atual'
                  : 'Digite o endereço do seu destino'
                }
              </Text>
            </View>
          )}

          {/* Saved Places */}
          {activeInput !== 'none' && searchResults.length === 0 && !isSearching && savedPlaces.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Locais Salvos</Text>
              </View>
              {savedPlaces.map((place, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectAddress(place)}
                >
                  <View style={styles.suggestionIcon}>
                    <Ionicons name="bookmark-outline" size={20} color={COLORS.text.secondary} />
                  </View>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>{place.name}</Text>
                    <Text style={styles.suggestionSubtitle} numberOfLines={2}>{truncateAddress(formatDisplayAddress(place))}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          testID="confirm-locations-button"
          style={styles.confirmButton}
          onPress={handleNextPress}
        >
          <Text style={styles.confirmButtonText}>Confirmar Locais</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.text.light} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  header: {
    height: 150,
    paddingTop: SPACING.lg,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
  },
  locationInputContainer: {
    backgroundColor: COLORS.background.card,
    marginHorizontal: SPACING.md,
    marginTop: -40, // Overlap with gradient header
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  departureDot: {
    backgroundColor: COLORS.primary.main,
  },
  arrivalDot: {
    backgroundColor: COLORS.secondary.main,
  },
  connectionLine: {
    position: 'absolute',
    left: SPACING.lg + 10, // Centered on dots
    top: 65,
    bottom: 65,
    width: 1,
    backgroundColor: COLORS.border.main,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    minHeight: 40,
  },
  activeInput: {
    backgroundColor: COLORS.primary.light + '10',
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },
  loadingWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  switchButton: {
    position: 'absolute',
    left: SPACING.sm,
    top: '47%', // Moved to bottom right of inputs container
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  switchButtonDisabled: {
    backgroundColor: COLORS.background.secondary,
    borderColor: COLORS.border.light,
  },
  suggestionsContainer: {
    flex: 1,
    marginTop: SPACING.md,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  loadingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.card,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  confirmButton: {
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.light,
    marginRight: SPACING.sm,
  },
});

export default LocationSelectionPage;