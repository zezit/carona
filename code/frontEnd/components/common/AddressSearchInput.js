import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { apiClient } from '../../api/apiClient';

const RECENT_ADDRESSES_KEY = 'recent_addresses';
const DEBOUNCE_DELAY = 300;

const AddressSearchInput = ({
  placeholder,
  value,
  onChangeText,
  onSelectAddress,
  iconName = 'location',
  iconColor = '#4285F4',
  style,
  inputStyle,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [hideResults, setHideResults] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const debounceTimeout = useRef(null);
  const inputRef = useRef(null);

  // Load recent addresses on component mount
  useEffect(() => {
    loadRecentAddresses();
    
    // Add listener to hide suggestions when keyboard is dismissed
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setHideResults(true);
      }
    );
    
    return () => {
      keyboardDidHideListener.remove();
      // Clear any pending debounce timers
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
      // Don't save empty addresses
      if (!address || !address.endereco) return;
      
      // Get current recents
      let addresses = [];
      const savedAddresses = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
      if (savedAddresses) {
        addresses = JSON.parse(savedAddresses);
      }
      
      // Check if address already exists to avoid duplicates
      const exists = addresses.some(a => a.endereco === address.endereco);
      
      if (!exists) {
        // Add new address at the beginning and keep only the most recent 5
        addresses = [address, ...addresses.slice(0, 4)];
        await AsyncStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(addresses));
        setRecentAddresses(addresses);
      }
    } catch (error) {
      console.error('Error saving recent address:', error);
    }
  };

  // Handle text input with debounce
  const handleChangeText = (text) => {
    onChangeText(text);
    setHideResults(false);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    if (text.trim().length > 2) {
      setLoading(true);
      
      debounceTimeout.current = setTimeout(() => {
        fetchAddressSuggestions(text);
      }, DEBOUNCE_DELAY);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  };

  const fetchAddressSuggestions = async (searchText) => {
    try {
      const response = await apiClient.get(`/maps/geocode?address=${encodeURIComponent(searchText)}`);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address) => {
    onSelectAddress(address);
    onChangeText(address.endereco);
    setHideResults(true);
    Keyboard.dismiss();
    saveRecentAddress(address);
  };

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Permita que o aplicativo acesse sua localização para usar esta funcionalidade.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      // Try to get the address from coordinates (reverse geocoding)
      let address = "Minha localização atual";
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        if (geocode && geocode.length > 0) {
          // Format the address from the geocoding result
          const addressObj = geocode[0];
          const addressParts = [
            addressObj.street,
            addressObj.streetNumber,
            addressObj.district,
            addressObj.city,
            addressObj.region
          ].filter(Boolean);
          
          if (addressParts.length > 0) {
            address = addressParts.join(', ');
          }
        }
      } catch (error) {
        console.warn('Error getting address from coordinates:', error);
      }
      
      // Create location object
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        endereco: address
      };
      
      // Send to parent component
      handleSelectAddress(locationData);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Erro de localização',
        'Não foi possível obter sua localização atual. Verifique se o GPS está ativado.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Get all available data to show
  const getData = () => {
    if (value.trim().length < 3) {
      return recentAddresses;
    }
    return suggestions;
  };

  // Render item in the suggestions list
  const renderItem = (item, index, isRecent) => {
    return (
      <TouchableOpacity
        key={`${isRecent ? 'recent' : 'suggestion'}-${index}`}
        style={styles.suggestionItem}
        onPress={() => handleSelectAddress(item)}
      >
        <Ionicons 
          name={isRecent ? "time-outline" : "location-outline"} 
          size={20} 
          color="#777" 
          style={styles.suggestionIcon} 
        />
        <Text style={styles.suggestionText} numberOfLines={1}>{item.endereco}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Autocomplete
        inputContainerStyle={styles.inputContainer}
        data={getData()}
        value={value}
        onChangeText={handleChangeText}
        hideResults={hideResults}
        flatListProps={{
          keyboardShouldPersistTaps: 'handled',
          keyExtractor: (_, idx) => `result-${idx}`,
          renderItem: ({ item, index }) => {
            const isRecent = value.trim().length < 3;
            return renderItem(item, index, isRecent);
          },
          ListHeaderComponent: () => (
            <>
              {value.trim().length < 3 && recentAddresses.length > 0 && (
                <Text style={styles.sectionHeader}>Recentes</Text>
              )}
              {value.trim().length >= 3 && suggestions.length > 0 && (
                <Text style={styles.sectionHeader}>Sugestões</Text>
              )}
              {value.trim().length >= 3 && suggestions.length === 0 && !loading && (
                <Text style={styles.noResults}>Nenhum resultado encontrado</Text>
              )}
              <TouchableOpacity
                style={styles.currentLocationItem}
                onPress={handleUseCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#4285F4" style={styles.suggestionIcon} />
                    <Text style={styles.currentLocationText}>Obtendo sua localização...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="navigate" size={20} color="#4285F4" style={styles.suggestionIcon} />
                    <Text style={styles.currentLocationText}>Usar minha localização atual</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ),
          ListEmptyComponent: loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4285F4" />
              <Text style={styles.loadingText}>Buscando endereços...</Text>
            </View>
          ) : null,
          style: styles.listStyle
        }}
        renderTextInput={(props) => (
          <View style={styles.textInputContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={24} color={iconColor} />
            </View>
            <TextInput
              {...props}
              ref={inputRef}
              placeholder={placeholder}
              style={[styles.input, inputStyle]}
              onFocus={() => setHideResults(false)}
            />
            {loading ? (
              <ActivityIndicator size="small" color="#4285F4" style={styles.loadingIndicator} />
            ) : value ? (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  onChangeText('');
                  setSuggestions([]);
                  setHideResults(true);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 999,
  },
  inputContainer: {
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginBottom: 0,
    padding: 0,
    flexDirection: 'column',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    height: 48,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    zIndex: 1,
  },
  loadingIndicator: {
    marginRight: 10,
  },
  clearButton: {
    padding: 10,
  },
  listStyle: {
    maxHeight: 250,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 12,
    color: '#888',
    backgroundColor: '#f8f9fa',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  noResults: {
    padding: 15,
    color: '#888',
    textAlign: 'center',
  },
});

export default AddressSearchInput;
