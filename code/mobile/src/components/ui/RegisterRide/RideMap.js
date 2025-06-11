import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS } from '../../../constants';

/**
 * RideMap - Map component for displaying routes, markers, and handling map interactions
 * Follows SRP by handling only map-related functionality
 */
const RideMap = React.forwardRef(({
  mapHeight,
  departureLocation,
  arrivalLocation,
  routes,
  selectedRoute,
  onMapPress,
  onRegionChange,
  onSelectRoute,
}, ref) => {
  return (
    <MapView
      testID="ride-map"
      ref={ref}
      style={[styles.map, { height: mapHeight }]}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: -19.9322352, // Default to Belo Horizonte
        longitude: -43.9376369,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      onPress={onMapPress}
      onRegionChangeComplete={onRegionChange}
    >
      {departureLocation && (
        <Marker
          testID="departure-marker"
          coordinate={departureLocation}
          title="Ponto de Partida"
          description="Local de saída da carona"
          pinColor={COLORS.primary.main}
        />
      )}

      {arrivalLocation && (
        <Marker
          testID="arrival-marker"
          coordinate={arrivalLocation}
          title="Ponto de Chegada"
          description="Destino da carona"
          pinColor={COLORS.success.main.main}
        />
      )}

      {/* Render all routes with the selected one having a thicker line */}
      {routes.map((route, index) => (
        <Polyline
          testID={`route-polyline-${index}`}
          key={index}
          coordinates={route.pontos}
          strokeWidth={route === selectedRoute ? 6 : 4}
          strokeColor={route === selectedRoute ? COLORS.primary.main : COLORS.primary.light}
          lineCap="round"
          lineJoin="round"
          onPress={() => onSelectRoute(route)}
        />
      ))}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
  },
});

RideMap.displayName = 'RideMap';

export default React.memo(RideMap);
