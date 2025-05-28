/**
 * MapController - Utility class for handling map-related operations
 * Follows SRP by handling only map positioning and coordinate calculations
 */
export class MapController {
  static centerMapOnLocations(mapRef, departureLocation, arrivalLocation, selectedRoute, bottomSheetHeight) {
    if (!mapRef.current) return;

    if (selectedRoute && selectedRoute.pontos && selectedRoute.pontos.length > 0) {
      // If we have a route, fit to the entire route
      this.fitMapToCoordinates(mapRef, selectedRoute.pontos, bottomSheetHeight);
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
  }

  static fitMapToCoordinates(mapRef, coordinates, bottomSheetHeight) {
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
  }

  static animateToLocation(mapRef, location) {
    if (!mapRef.current || !location) return;

    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  }
}
