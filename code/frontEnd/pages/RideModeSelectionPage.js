import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';

const RideModeSelectionPage = ({ navigation }) => {
  const { user, authToken } = useAuthContext();
  const [isDriver, setIsDriver] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();

    // Check if user is a driver
    checkDriverStatus();
  }, []);

  const checkDriverStatus = async () => {
    try {
      const response = await apiClient.get(`/estudante/${user.id}/motorista`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setIsDriver(response.success);
    } catch (error) {
      setIsDriver(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDrive = () => {
    navigation.navigate('RegisterRide');
  };

  const handleSearchRide = () => {
    Alert.alert(
      'Em breve',
      'Essa funcionalidade ainda não está disponível.',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>O que você deseja fazer?</Text>
        </View>

        {isDriver && (
          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={handleStartDrive}
          >
            <View style={styles.optionContent}>
              <Ionicons name="car" size={32} color="#4285F4" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Oferecer Carona</Text>
                <Text style={styles.optionDescription}>
                  Cadastre uma nova carona como motorista
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#4285F4" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={handleSearchRide}
        >
          <View style={styles.optionContent}>
            <Ionicons name="search" size={32} color="#34A853" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Buscar Carona</Text>
              <Text style={styles.optionDescription}>
                Encontre caronas disponíveis
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#34A853" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default RideModeSelectionPage;