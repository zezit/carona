import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, ActivityIndicator, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../constants';
import AutocompleteInput from './AutocompleteInput';

const RECENT_ADDRESSES_KEY = 'recent_addresses';
const DEBOUNCE_DELAY = 300;

/**
 * AddressSearchInput - A component for searching addresses with autocomplete suggestions
 * Simplified version with focus on core functionality
 */
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
  hideInput = false
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);
  
  // Load recent addresses on mount
  useEffect(() => {
    loadRecentAddresses();
  }, []);

  // Clear suggestions when input is empty
  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      setShowNoResults(false);
    }
  }, [value]);
  
  // Handler for input changes with debounce
  const handleChangeText = useCallback((text) => {
    setError(null);
    setShowNoResults(false);
    onChangeText(text);
    
    if (text.trim().length > 2) {
      // Implement debouncing to improve search performance
      const timer = setTimeout(() => {
        setLoading(true);
        fetchSuggestions(text);
      }, DEBOUNCE_DELAY);
      
      return () => clearTimeout(timer);
    }
  }, [onChangeText]);
  
  // Load recent addresses from storage
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

  // Save an address to recent addresses
  const saveRecentAddress = async (address) => {
    try {
      if (!address || !address.endereco) return;
      
      let addresses = [];
      const savedAddresses = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
      if (savedAddresses) {
        addresses = JSON.parse(savedAddresses);
      }
      
      // Check if address exists and move it to the top or add it
      const existingIndex = addresses.findIndex(a => a.endereco === address.endereco);
      
      if (existingIndex === -1) {
        // Keep only 5 most recent
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
  
  // Stub function for simplicity - this will be called by LocationSelectionPage
  const fetchSuggestions = () => {
    // This is simplified now - the main search logic is in SuggestionsPanel
    setLoading(false);
  };

  // Handle address selection
  const handleSelectItem = (item) => {
    onSelectAddress(item);
    saveRecentAddress(item);
    setSuggestions([]);
    setShowNoResults(false);
  };

  // Get data to display based on search context
  const getData = () => {
    if (value.trim().length < 3) {
      return recentAddresses;
    }
    return suggestions;
  };

  // Get contextual hint message
  const getHintText = () => {
    if (loading) {
      return 'Buscando endereços...';
    }
    if (showNoResults) {
      return 'Nenhum endereço encontrado.';
    }
    if (error) {
      return error;
    }
    if (value.trim().length > 0 && value.trim().length < 3) {
      return 'Digite pelo menos 3 caracteres para buscar';
    }
    return suggestions.length > 0 ? 'Selecione um endereço da lista' : '';
  };

  // If hideInput is true, render just suggestions directly
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
        renderRightButton={() => {
          if (loading) {
            return (
              <View style={styles.rightButton}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            );
          } else if (value.length > 0) {
            return (
              <TouchableOpacity 
                style={styles.rightButton}
                onPress={() => onChangeText('')}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.text.secondary} />
              </TouchableOpacity>
            );
          }
          return null;
        }}
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
  rightButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  suggestionsList: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xs,
    maxHeight: 260,
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
    padding: SPACING.sm,
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
