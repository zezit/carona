import { Alert } from 'react-native';
import { apiClient } from '../../services/api/apiClient';

/**
 * RouteCalculator - Utility class for handling route calculations and API calls
 * Follows SRP by handling only route calculation logic
 */
export class RouteCalculator {
  static async calculateRoutes(startLocation, endLocation, authToken) {
    if (!startLocation || !endLocation) {
      return { routes: [], error: null };
    }

    try {
      const options = {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await apiClient.get(
        `/maps/trajectories?startLat=${startLocation.latitude}&startLon=${startLocation.longitude}&endLat=${endLocation.latitude}&endLon=${endLocation.longitude}`,
        options
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

        return { routes: limitedRoutes, error: null };
      }

      return { routes: [], error: null };
    } catch (error) {
      console.error('Error fetching routes:', error);
      return { 
        routes: [], 
        error: 'Não foi possível calcular a rota. Tente novamente.' 
      };
    }
  }

  static formatDuration(seconds) {
    if (!seconds) return '0 min';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} min`;
    }
  }

  static formatDistance(meters) {
    if (!meters) return '0 km';
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  }

  static formatLocalDateTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
