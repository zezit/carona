import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const RECENT_ADDRESSES_KEY = 'recent_addresses';

/**
 * Helper function to format an address from location components
 * @param {Object} addressObj - The address object from expo-location
 * @returns {String} Formatted address string
 */
export const formatAddressFromComponents = (addressObj) => {
  if (!addressObj) return '';
  
  const addressParts = [
    addressObj.name,
    addressObj.street,
    addressObj.streetNumber,
    addressObj.district,
    addressObj.city,
    addressObj.region
  ].filter(Boolean);
  
  return addressParts.join(', ');
};

/**
 * Get current user location and format as address
 * @returns {Promise<Object>} Location object with coordinates and formatted address
 */
export const getCurrentLocation = async () => {
  // Request location permissions
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  // Get current position with high accuracy
  const location = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
    // Add timeout to prevent hanging if location service is slow
    new Promise((_, reject) => setTimeout(() => reject(new Error('Location timeout')), 8000))
  ]);

  const { latitude, longitude } = location.coords;

  // Get address details from coordinates
  const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

  if (reverseGeocode && reverseGeocode[0]) {
    const address = formatAddressFromComponents(reverseGeocode[0]);
    
    return {
      latitude,
      longitude,
      endereco: address,
      isCurrentLocation: true
    };
  }
  
  throw new Error('Could not determine address from coordinates');
};

/**
 * Search for addresses using given text
 * @param {String} searchText - The search text
 * @returns {Promise<Array>} Array of location objects
 */
export const searchAddresses = async (searchText) => {
  // Append region to improve search results
  const searchQuery = `${searchText}, Minas Gerais, Brasil`;
  
  // Perform geocoding search
  const geocodeResults = await Location.geocodeAsync(searchQuery);
  
  if (!geocodeResults?.length) {
    return [];
  }
  
  // Get detailed address for each result (limit to top 5 for performance)
  const addressPromises = geocodeResults.slice(0, 5).map(async (result) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: result.latitude,
        longitude: result.longitude
      });
      
      if (reverseGeocode?.[0]) {
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          endereco: formatAddressFromComponents(reverseGeocode[0])
        };
      }
    } catch (error) {
      console.debug('Error in reverse geocoding:', error);
    }
    return null;
  });
  
  const addressResults = await Promise.all(addressPromises);
  return addressResults.filter(addr => addr?.endereco);
};

/**
 * Save an address to recent addresses in storage
 * @param {Object} address - The address object to save
 * @param {Number} maxCount - Maximum number of recent addresses to keep (default: 5)
 */
export const saveRecentAddress = async (address, maxCount = 5) => {
  if (!address?.endereco) return;
  
  try {
    let addresses = [];
    const savedAddresses = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
    
    if (savedAddresses) {
      addresses = JSON.parse(savedAddresses);
    }
    
    // Check if this address already exists
    const existingIndex = addresses.findIndex(a => a.endereco === address.endereco);
    
    if (existingIndex === -1) {
      // Add new address at the beginning, keep only up to maxCount
      addresses = [address, ...addresses.slice(0, maxCount - 1)];
    } else {
      // Move existing address to the top
      const [existing] = addresses.splice(existingIndex, 1);
      addresses.unshift(existing);
    }
    
    await AsyncStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(addresses));
    return addresses;
  } catch (error) {
    console.error('Error saving recent address:', error);
    throw error;
  }
};

/**
 * Load recent addresses from storage
 * @returns {Promise<Array>} Array of recent addresses
 */
export const loadRecentAddresses = async () => {
  try {
    const addresses = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
    return addresses ? JSON.parse(addresses) : [];
  } catch (error) {
    console.error('Error loading recent addresses:', error);
    return [];
  }
};