import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../constants';
import { 
  RECENT_ADDRESSES_KEY,
  getCurrentLocation,
  loadRecentAddresses,
  saveRecentAddress,
  searchAddresses
} from '../../utils/locationUtils';

const DEBOUNCE_DELAY = 300;

/**
 * SuggestionsPanel - Component that displays address search suggestions
 */
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
  const [timeoutId, setTimeoutId] = useState(null);
  
  // Load recent addresses on component mount
  useEffect(() => {
    const fetchRecentAddresses = async () => {
      const addresses = await loadRecentAddresses();
      setRecentAddresses(addresses);
    };
    
    fetchRecentAddresses();
  }, []);

  // Handle search value changes with debouncing
  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (searchValue.trim().length > 2) {
      const id = setTimeout(() => {
        fetchAddressSuggestions(searchValue);
      }, DEBOUNCE_DELAY);
      
      setTimeoutId(id);
    } else {
      setSuggestions([]);
      setShowNoResults(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchValue]);

  // Simplified address search using locationUtils
  const fetchAddressSuggestions = async (searchText) => {
    try {
      setLoading(true);
      setError(null);
      setShowNoResults(false);
      
      const results = await searchAddresses(searchText);
      
      if (results.length === 0) {
        setShowNoResults(true);
      }
      
      setSuggestions(results);
    } catch (error) {
      console.error('Error in address search:', error);
      setError('Erro ao buscar endereço. Tente novamente.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle selection of an address suggestion
  const handleSelectItem = async (item) => {
    try {
      const updatedAddresses = await saveRecentAddress(item);
      setRecentAddresses(updatedAddresses);
      onSelectAddress(item);
    } catch (error) {
      console.error('Error saving address selection:', error);
      // Still call onSelectAddress even if saving failed
      onSelectAddress(item);
    }
  };

  // Get current user location
  const handleGetCurrentLocation = async () => {
    try {
      setCurrentLocationLoading(true);
      
      const locationData = await getCurrentLocation();
      handleSelectItem(locationData);
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Show appropriate error message based on error type
      const errorMessage = error.message === 'Location permission denied'
        ? 'Precisamos de permissão para acessar sua localização atual.'
        : 'Não foi possível obter sua localização atual. Verifique se o GPS está ativado.';
        
      Alert.alert('Erro', errorMessage, [{ text: 'OK' }]);
    } finally {
      setCurrentLocationLoading(false);
    }
  };

  // Get displayed data based on search value
  const getData = () => {
    if (searchValue.trim().length < 3) {
      return recentAddresses;
    }
    return suggestions;
  };

  // Get hint text to display
  const renderHintText = () => {
    if (loading) {
      return 'Buscando endereços...';
    }
    if (showNoResults) {
      return 'Nenhum endereço encontrado. Tente ser mais específico (adicione bairro ou cidade).';
    }
    if (error) {
      return error;
    }
    if (searchValue.trim().length > 0 && searchValue.trim().length < 3) {
      return 'Digite pelo menos 3 caracteres para buscar';
    }
    return '';
  };

  const data = getData();
  const hintText = renderHintText();

  return (
    <View style={styles.container}>
      {/* Current location button */}
      {includeCurrentLocation && (
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
          disabled={currentLocationLoading}
        >
          <View style={styles.currentLocationIconWrapper}>
            <Ionicons name="locate" size={18} color={COLORS.primary.main} />
          </View>
          <Text style={styles.currentLocationText}>
            {currentLocationLoading ? 'Obtendo localização...' : 'Usar minha localização atual'}
          </Text>
          {currentLocationLoading && (
            <ActivityIndicator size="small" color={COLORS.primary.main} style={styles.locationLoading} />
          )}
        </TouchableOpacity>
      )}

      {/* Hint text */}
      {hintText ? (
        <Text style={[
          styles.hintText,
          error ? { color: COLORS.danger } : { color: COLORS.text.secondary }
        ]}>
          {hintText}
        </Text>
      ) : null}
      
      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary.main} />
        </View>
      )}

      {/* Suggestions list */}
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
                name={item.isCurrentLocation ? "locate-outline" : "location-outline"} 
                size={16} 
                color={COLORS.text.secondary}
                style={styles.suggestionIcon}
              />
              <Text style={styles.suggestionText} numberOfLines={2}>
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
  // Styles remain unchanged
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
    borderColor: COLORS.border.main,
    backgroundColor: COLORS.background.main,
  },
  currentLocationIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary.light + '30',
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
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.md,
    maxHeight: 250,
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
    borderBottomColor: COLORS.border.main,
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

export default React.memo(SuggestionsPanel);