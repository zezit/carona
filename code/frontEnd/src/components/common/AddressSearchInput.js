import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../constants';
import AutocompleteInput from './AutocompleteInput';

const RECENT_ADDRESSES_KEY = 'recent_addresses';
const DEBOUNCE_DELAY = 150; // Reduced for faster response

const AddressSearchInput = ({
  placeholder,
  value,
  onChangeText,
  onSelectAddress,
  iconName = 'location',
  iconColor = COLORS.primary,
  style,
  label,
  autoFocus = false,
  hideInput = false // New prop to hide the input field
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const debounceTimeout = useRef(null);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    loadRecentAddresses();
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

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

  const handleChangeText = (text) => {
    setError(null);
    setShowNoResults(false);
    onChangeText(text);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    if (text.trim().length > 2) {
      setLoading(true);
      const currentRequest = ++searchRequestRef.current;
      
      debounceTimeout.current = setTimeout(() => {
        fetchAddressSuggestions(text, currentRequest);
      }, DEBOUNCE_DELAY);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  };

  const fetchAddressSuggestions = async (searchText, requestId) => {
    try {
      if (requestId !== searchRequestRef.current) return;
      
      setLoading(true);
      setError(null);
      setShowNoResults(false);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização necessária');
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar serviços de localização para buscar endereços.',
          [{ text: 'OK' }]
        );
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
      if (requestId === searchRequestRef.current) {
        setLoading(false);
      }
    }
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

  const handleSelectItem = (item) => {
    onSelectAddress(item);
    saveRecentAddress(item);
    setSuggestions([]);
    setShowNoResults(false);
  };

  const getData = () => {
    if (value.trim().length < 3) {
      return recentAddresses;
    }
    return suggestions;
  };

  const getHintText = () => {
    if (loading) {
      return 'Buscando endereços...';
    }
    if (showNoResults) {
      return 'Nenhum endereço encontrado. Tente adicionar o bairro ou cidade.';
    }
    if (error) {
      return error;
    }
    if (value.trim().length > 0 && value.trim().length < 3) {
      return 'Digite mais caracteres para buscar';
    }
    return suggestions.length > 0 ? 'Selecione um endereço da lista' : '';
  };

  // Render suggestions directly if hideInput is true
  if (hideInput) {
    const data = getData();
    const hintText = getHintText();
    
    return (
      <View style={[styles.container, style]}>
        {hintText && (
          <Text style={[
            styles.hintText,
            error ? { color: COLORS.danger } : { color: COLORS.text.secondary }
          ]}>
            {hintText}
          </Text>
        )}
        
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
  }

  // Regular render with AutocompleteInput
  return (
    <View style={[styles.container, style]}>
      <AutocompleteInput
        value={value}
        onChangeText={handleChangeText}
        onSelectItem={handleSelectItem}
        data={getData()}
        loading={loading}
        error={error}
        placeholder={placeholder}
        icon={iconName}
        iconColor={iconColor}
        label={label}
        itemLabelKey="endereco"
        autoFocus={autoFocus}
        hintText={getHintText()}
        renderRightButton={() => loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
        containerStyle={styles.inputContainer}
        listContainerStyle={styles.suggestionsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  suggestionsList: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  loadingContainer: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 40,
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
    paddingHorizontal: SPACING.xs,
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
  }
});

export default React.memo(AddressSearchInput);
