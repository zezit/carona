import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../constants';

const RECENT_ADDRESSES_KEY = 'recent_addresses';

const SuggestionsPanel = ({ 
  searchValue, 
  onSelectAddress, 
  includeCurrentLocation = true 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);
  
  useEffect(() => {
    loadRecentAddresses();
  }, []);

  useEffect(() => {
    if (searchValue.trim().length > 2) {
      fetchAddressSuggestions(searchValue);
    } else {
      setSuggestions([]);
      setShowNoResults(false);
    }
  }, [searchValue]);

  const loadRecentAddresses = async () => {
    try {
      const addresses = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
      if (addresses) {
        setRecentAddresses(JSON.parse(addresses));
      }
    } catch (error) {
      console.error('Error loading recent addresses:', error);
    }
  };

  const fetchAddressSuggestions = async (searchText) => {
    try {
      setLoading(true);
      setError(null);
      setShowNoResults(false);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização necessária');
        return;
      }

      const searchVariations = [
        searchText,
        `${searchText}, UFMG`,
        `${searchText}, Pampulha`,
        `${searchText}, Belo Horizonte`,
        `${searchText}, Belo Horizonte, MG`
      ];
      
      let geocodeResults = [];
      
      for (const query of searchVariations) {
        if (geocodeResults.length === 0) {
          try {
            const results = await Location.geocodeAsync(query);
            if (results?.length > 0) {
              geocodeResults = results;
              break;
            }
          } catch (err) {
            console.debug(`Failed to geocode variation: ${query}`, err);
          }
        }
      }
      
      if (geocodeResults?.length > 0) {
        const addressPromises = geocodeResults.map(async (result) => {
          try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude
            });
            
            if (reverseGeocode?.[0]) {
              const addressObj = reverseGeocode[0];
              const addressParts = [
                addressObj.name,
                addressObj.street,
                addressObj.streetNumber,
                addressObj.district,
                addressObj.city,
                addressObj.region
              ].filter(Boolean);
              
              const fullAddress = addressParts.join(', ');
              
              const searchTerms = searchText.toLowerCase().split(/[\s,]+/);
              const matchesSearch = searchTerms.every(term => 
                fullAddress.toLowerCase().includes(term)
              );
              
              if (matchesSearch) {
                return {
                  latitude: result.latitude,
                  longitude: result.longitude,
                  endereco: fullAddress,
                  distance: calculateDistance(result.latitude, result.longitude),
                  relevanceScore: calculateRelevanceScore(fullAddress, searchText)
                };
              }
            }
          } catch (error) {
            console.debug('Error in reverse geocoding:', error);
          }
          return null;
        });
        
        const addressResults = await Promise.all(addressPromises);
        const validAddresses = addressResults.filter(addr => addr?.endereco);
        
        const sortedAddresses = validAddresses
          .sort((a, b) => {
            const scoreA = a.relevanceScore - (a.distance * 0.1);
            const scoreB = b.relevanceScore - (b.distance * 0.1);
            return scoreB - scoreA;
          })
          .slice(0, 5);

        if (sortedAddresses.length === 0) {
          setShowNoResults(true);
        }
        setSuggestions(sortedAddresses);
      } else {
        setShowNoResults(true);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      setError('Erro ao buscar endereço. Tente novamente.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat, lon) => {
    const UFMG_LAT = -19.8721;
    const UFMG_LON = -43.9673;
    
    const R = 6371;
    const dLat = deg2rad(lat - UFMG_LAT);
    const dLon = deg2rad(lon - UFMG_LON);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(UFMG_LAT)) * Math.cos(deg2rad(lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  const calculateRelevanceScore = (address, searchText) => {
    const addressLower = address.toLowerCase();
    const searchTerms = searchText.toLowerCase().split(/[\s,]+/);
    
    let score = 0;
    searchTerms.forEach(term => {
      if (addressLower.includes(term)) {
        score += addressLower.indexOf(term) === 0 ? 3 : 1;
        score += addressLower.includes(` ${term} `) ? 2 : 0;
        score += addressLower.includes(`${term},`) ? 2 : 0;
      }
    });
    
    if (addressLower.includes('ufmg') || addressLower.includes('universidade federal')) {
      score += 3;
    }
    
    if (addressLower.includes('pampulha')) {
      score += 2;
    }
    
    return score;
  };

  const handleSelectItem = (item) => {
    saveRecentAddress(item);
    onSelectAddress(item);
  };

  const saveRecentAddress = async (address) => {
    try {
      if (!address || !address.endereco) return;
      
      let addresses = [];
      const savedAddresses = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
      if (savedAddresses) {
        addresses = JSON.parse(savedAddresses);
      }
      
      const existingIndex = addresses.findIndex(a => a.endereco === address.endereco);
      
      if (existingIndex === -1) {
        addresses = [address, ...addresses.slice(0, 4)];
      } else {
        const [existing] = addresses.splice(existingIndex, 1);
        addresses.unshift(existing);
      }
      
      await AsyncStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(addresses));
      setRecentAddresses(addresses);
    } catch (error) {
      console.error('Error saving recent address:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setCurrentLocationLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar sua localização atual.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (reverseGeocode && reverseGeocode[0]) {
        const addressObj = reverseGeocode[0];
        const addressParts = [
          addressObj.name,
          addressObj.street,
          addressObj.streetNumber,
          addressObj.district,
          addressObj.city,
          addressObj.region
        ].filter(Boolean);
        
        const currentLocationAddress = {
          latitude,
          longitude,
          endereco: addressParts.join(', '),
          isCurrentLocation: true
        };

        handleSelectItem(currentLocationAddress);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização atual. Verifique se o GPS está ativado.',
        [{ text: 'OK' }]
      );
    } finally {
      setCurrentLocationLoading(false);
    }
  };

  const getData = () => {
    if (searchValue.trim().length < 3) {
      return recentAddresses;
    }
    return suggestions;
  };

  const renderHintText = () => {
    if (loading) {
      return 'Buscando endereços...';
    }
    if (showNoResults) {
      return 'Nenhum endereço encontrado. Tente adicionar o bairro ou cidade.';
    }
    if (error) {
      return error;
    }
    if (searchValue.trim().length > 0 && searchValue.trim().length < 3) {
      return 'Digite mais caracteres para buscar';
    }
    return '';
  };

  const data = getData();
  const hintText = renderHintText();

  return (
    <View style={styles.container}>
      {includeCurrentLocation && (
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
          disabled={currentLocationLoading}
        >
          <View style={styles.currentLocationIconWrapper}>
            <Ionicons name="locate" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.currentLocationText}>
            {currentLocationLoading ? 'Obtendo localização...' : 'Usar minha localização atual'}
          </Text>
          {currentLocationLoading && (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.locationLoading} />
          )}
        </TouchableOpacity>
      )}

      {hintText ? (
        <Text style={[
          styles.hintText,
          error ? { color: COLORS.danger } : { color: COLORS.text.secondary }
        ]}>
          {hintText}
        </Text>
      ) : null}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}

      {data.length > 0 ? (
        <View style={styles.suggestionsList}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSelectItem(item)}
              accessibilityRole="button"
              accessibilityLabel={item.endereco}
            >
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={COLORS.text.secondary}
                style={styles.suggestionIcon}
              />
              <Text style={styles.suggestionText}>
                {item.endereco}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        showNoResults && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={24} color={COLORS.text.tertiary} />
            <Text style={styles.emptyStateText}>Nenhum resultado encontrado</Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  currentLocationIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  currentLocationText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  locationLoading: {
    marginLeft: SPACING.sm,
  },
  suggestionsList: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
  },
  loadingContainer: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionIcon: {
    marginRight: SPACING.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  hintText: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyStateText: {
    color: COLORS.text.tertiary,
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
});

export default SuggestionsPanel;