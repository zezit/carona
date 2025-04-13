import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker, Region, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';

const RegisterRidePage = ({ navigation }) => {
  const { user, logout, authToken } = useAuthContext();
  const [region, setRegion] = useState(null);
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
 const[coordenadasChegada,setCoordenadasChegada]= useState([]);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização negada');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleSubmit = async () => {
    try {
      const resPartida = await apiClient.get('/maps/geocode', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        params: { address: departure },
      });

      const resChegada = await apiClient.get('/maps/geocode', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        params: { address: arrival },
      });

      const coordenadasPartida = resPartida.data[0];
      const coordenadasChegada = resChegada.data[0];
      setCoordenadasChegada(coordenadasChegada);

      console.log(coordenadasChegada)

      const resTrajeto = await apiClient.get('/maps/trajectories', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          startLat: coordenadasPartida.latitude,
          startLon: coordenadasPartida.longitude,
          endLat: coordenadasChegada.latitude,
          endLon: coordenadasChegada.longitude,
        },
      });
      
      console.log(JSON.stringify(resTrajeto.data[0]))
      const coordenadasValidas = resTrajeto.data[0].coordenadas.filter(coord => 
        Array.isArray(coord) && coord.length === 2 && 
        typeof coord[0] === 'number' && typeof coord[1] === 'number'
      );
  
      // Mapeia as coordenadas válidas
      const rota = coordenadasValidas.map(([lat, lon]) => ({
        latitude: lat,
        longitude: lon,
      }));

      setRouteCoordinates(rota);

      // Atualizar o centro do mapa para o ponto de partida
      setRegion({
        latitude: coordenadasPartida.latitude,
        longitude: coordenadasPartida.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Erro ao buscar trajeto:', error);
      alert('Erro ao calcular trajeto. Verifique os endereços e tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Oferecer carona</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.container}>
        {region && (
          <MapView style={styles.map} region={region}>
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="Saída" />
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor="#4285F4"
              />
             
            )}
             {routeCoordinates.length > 0 && coordenadasChegada&& <Marker coordinate={{ latitude: coordenadasChegada.latitude, longitude: coordenadasChegada.longitude }} title="Chegada">  </Marker>}
          </MapView>
        )}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Endereço de saída"
            value={departure}
            onChangeText={setDeparture}
          />
          <TextInput
            style={styles.input}
            placeholder="Endereço de chegada"
            value={arrival}
            onChangeText={setArrival}
          />
          <TouchableOpacity  style={styles.confirmButton} onPress={handleSubmit} ><Text style={styles.buttonText}>Confirmar carona</Text> </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#4285F4',
  },
  backButton: {
    paddingLeft: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  placeholderView: {
    width: 24, // para equilibrar o botão de voltar
  },
  confirmButton:{
    backgroundColor: "#4285F4",
    width: "full",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    margin:10,
  },
  buttonText:{
    color:"white"
  }
});

export default RegisterRidePage;
