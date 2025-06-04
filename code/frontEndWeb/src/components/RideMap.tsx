import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { Ride } from '@/types/ride';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for start and end points
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RideMapProps {
  ride: Ride;
  height?: string;
  className?: string;
}

export const RideMap: React.FC<RideMapProps> = ({ 
  ride, 
  height = "400px", 
  className = "" 
}) => {
  const [routeCoordinates, setRouteCoordinates] = useState<LatLngExpression[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Start and end coordinates
  const startCoord: LatLngExpression = [ride.latitudePartida, ride.longitudePartida];
  const endCoord: LatLngExpression = [ride.latitudeDestino, ride.longitudeDestino];
  
  // Calculate center point for map
  const centerLat = (ride.latitudePartida + ride.latitudeDestino) / 2;
  const centerLng = (ride.longitudePartida + ride.longitudeDestino) / 2;
  const center: LatLngExpression = [centerLat, centerLng];
  
  // Calculate appropriate zoom level based on distance
  const getZoomLevel = () => {
    const latDiff = Math.abs(ride.latitudePartida - ride.latitudeDestino);
    const lngDiff = Math.abs(ride.longitudePartida - ride.longitudeDestino);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    if (maxDiff > 1) return 8;
    if (maxDiff > 0.5) return 10;
    if (maxDiff > 0.1) return 12;
    if (maxDiff > 0.05) return 14;
    return 16;
  };

  // Fetch route from OSRM (Open Source Routing Machine)
  const fetchRouteFromOSRM = async (start: LatLngExpression, end: LatLngExpression): Promise<LatLngExpression[]> => {
    try {
      const startLat = Array.isArray(start) ? start[0] : start.lat;
      const startLng = Array.isArray(start) ? start[1] : start.lng;
      const endLat = Array.isArray(end) ? end[0] : end.lat;
      const endLng = Array.isArray(end) ? end[1] : end.lng;
      
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        // OSRM returns coordinates as [lng, lat], so we need to flip them
        return coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as LatLngExpression);
      }
      
      return [start, end];
    } catch (error) {
      console.error('Error fetching route from OSRM:', error);
      return [start, end];
    }
  };

  // Create route path from trajectory data or fetch from routing service
  useEffect(() => {
    const loadRoute = async () => {
      setIsLoadingRoute(true);
      setRouteError(null);
      
      try {
        // First, try to use trajectory data if available and has sufficient points
        if (ride.trajetos && ride.trajetos.length > 0) {
          const coords: LatLngExpression[] = [startCoord];
          
          // Add all trajectory points in order
          for (const trajeto of ride.trajetos) {
            if (trajeto.pontoInicial && trajeto.pontoInicial.latitude && trajeto.pontoInicial.longitude) {
              coords.push([trajeto.pontoInicial.latitude, trajeto.pontoInicial.longitude]);
            }
            if (trajeto.pontoFinal && trajeto.pontoFinal.latitude && trajeto.pontoFinal.longitude) {
              coords.push([trajeto.pontoFinal.latitude, trajeto.pontoFinal.longitude]);
            }
          }
          
          coords.push(endCoord);
          
          // Remove duplicates
          const uniqueCoords = coords.filter((coord, index, self) => {
            if (index === 0) return true;
            const prev = self[index - 1];
            const currentLat = Array.isArray(coord) ? coord[0] : coord.lat;
            const currentLng = Array.isArray(coord) ? coord[1] : coord.lng;
            const prevLat = Array.isArray(prev) ? prev[0] : prev.lat;
            const prevLng = Array.isArray(prev) ? prev[1] : prev.lng;
            
            return Math.abs(currentLat - prevLat) > 0.0001 || Math.abs(currentLng - prevLng) > 0.0001;
          });
          
          // If we have enough points from trajectory data, use them
          if (uniqueCoords.length > 2) {
            setRouteCoordinates(uniqueCoords);
            setIsLoadingRoute(false);
            return;
          }
        }
        
        // If trajectory data is insufficient, fetch from routing service
        console.log('Fetching route from OSRM routing service...');
        const routeFromOSRM = await fetchRouteFromOSRM(startCoord, endCoord);
        setRouteCoordinates(routeFromOSRM);
        
      } catch (error) {
        console.error('Error loading route:', error);
        setRouteError('Erro ao carregar rota');
        // Fallback to straight line
        setRouteCoordinates([startCoord, endCoord]);
      } finally {
        setIsLoadingRoute(false);
      }
    };

    loadRoute();
  }, [ride.id]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  // Format distance
  const formatDistance = (meters: number) => {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`} style={{ height }}>
      <MapContainer 
        center={center} 
        zoom={getZoomLevel()} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Start point marker */}
        <Marker position={startCoord} icon={startIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-green-600 mb-1">Ponto de Partida</h3>
              <p className="text-sm text-gray-700">{ride.pontoPartida}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(ride.dataHoraPartida).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-400">
                Lat: {ride.latitudePartida.toFixed(6)}, Lng: {ride.longitudePartida.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
        
        {/* End point marker */}
        <Marker position={endCoord} icon={endIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-red-600 mb-1">Ponto de Destino</h3>
              <p className="text-sm text-gray-700">{ride.pontoDestino}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(ride.dataHoraChegada).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-400">
                Lat: {ride.latitudeDestino.toFixed(6)}, Lng: {ride.longitudeDestino.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
        
        {/* Route line */}
        {routeCoordinates.length > 1 && (
          <Polyline 
            positions={routeCoordinates} 
            color="#3b82f6" 
            weight={4}
            opacity={0.8}
            smoothFactor={1}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-600 mb-1">Rota da Viagem</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Distância: {formatDistance(ride.distanciaEstimadaMetros)}</p>
                  <p>Tempo estimado: {formatDuration(ride.tempoEstimadoSegundos)}</p>
                  <p>Pontos da rota: {routeCoordinates.length}</p>
                  {isLoadingRoute && <p className="text-blue-500">Carregando rota...</p>}
                  {routeError && <p className="text-red-500">{routeError}</p>}
                </div>
              </div>
            </Popup>
          </Polyline>
        )}
        
        {/* Additional trajectory waypoint markers */}
        {ride.trajetos && ride.trajetos.map((trajeto, index) => (
          trajeto.pontoInicial && trajeto.pontoInicial.latitude && trajeto.pontoInicial.longitude && (
            <Marker 
              key={`traj-${trajeto.id}-${index}`}
              position={[trajeto.pontoInicial.latitude, trajeto.pontoInicial.longitude]}
              icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [20, 33],
                iconAnchor: [10, 33],
                popupAnchor: [1, -28],
                shadowSize: [33, 33]
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-blue-600 mb-1">Ponto da Rota #{index + 1}</h3>
                  <p className="text-sm text-gray-700">{trajeto.pontoInicial.endereco}</p>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <p>Distância do segmento: {formatDistance(trajeto.distanciaMetros)}</p>
                    <p>Tempo do segmento: {formatDuration(trajeto.tempoSegundos)}</p>
                    <p className="text-gray-400">
                      Lat: {trajeto.pontoInicial.latitude.toFixed(6)}, Lng: {trajeto.pontoInicial.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
        
        {/* Loading indicator */}
        {isLoadingRoute && (
          <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 shadow text-xs text-blue-600 z-[1000]">
            Carregando rota...
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default RideMap;
