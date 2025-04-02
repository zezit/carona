import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Animated,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import { Ionicons } from '@expo/vector-icons';

const UpdateDriverProfilePage = ({ navigation, route }) => {
  const { driverProfile } = route.params || {};
  
  // Driver info
  const [cnh, setCnh] = useState(driverProfile?.cnh || '');
  const [whatsapp, setWhatsapp] = useState(driverProfile?.whatsapp || '');
  const [showWhatsapp, setShowWhatsapp] = useState(driverProfile?.mostrarWhatsapp || false);
  
  // Car info
  const [modelo, setModelo] = useState(driverProfile?.carro?.modelo || '');
  const [placa, setPlaca] = useState(driverProfile?.carro?.placa || '');
  const [cor, setCor] = useState(driverProfile?.carro?.cor || '');
  const [capacidade, setCapacidade] = useState(
    driverProfile?.carro?.capacidadePassageiros?.toString() || '4'
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const { user, authToken } = useAuthContext();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const validateForm = () => {
    if (!cnh || cnh.length < 5) {
      Alert.alert('Erro', 'Por favor, informe um número de CNH válido.');
      return false;
    }

    if (whatsapp && !/^\+?[0-9]{10,15}$/.test(whatsapp)) {
      Alert.alert('Erro', 'Por favor, informe um número de WhatsApp válido.');
      return false;
    }

    if (!modelo || modelo.length < 3) {
      Alert.alert('Erro', 'Por favor, informe o modelo do carro.');
      return false;
    }

    if (!placa || placa.length < 6) {
      Alert.alert('Erro', 'Por favor, informe uma placa válida.');
      return false;
    }

    if (!cor) {
      Alert.alert('Erro', 'Por favor, informe a cor do veículo.');
      return false;
    }

    const capacidadeNum = parseInt(capacidade);
    if (isNaN(capacidadeNum) || capacidadeNum < 1 || capacidadeNum > 6) {
      Alert.alert('Erro', 'A capacidade de passageiros deve ser entre 1 e 6.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const driverData = {
        cnh,
        whatsapp: whatsapp || null,
        mostrarWhatsapp: showWhatsapp,
        carro: {
          modelo,
          placa: placa.toUpperCase(),
          cor,
          capacidadePassageiros: parseInt(capacidade)
        }
      };
      
      const options = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await apiClient.put(
        `/estudante/${user.id}/motorista`,
        driverData,
        options
      );
      
      if (response.success) {
        Alert.alert(
          "Sucesso",
          "Perfil de motorista atualizado com sucesso!",
          [
            { 
              text: "OK", 
              onPress: () => {
                // Force refresh when returning to profile page
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Erro",
          response.error?.message || "Não foi possível atualizar o perfil de motorista."
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil de motorista:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao atualizar o perfil de motorista. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Atualizar Perfil de Motorista</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content, 
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.subtitle}>Informações do Motorista</Text>
          
          <Text style={styles.label}>Número da CNH</Text>
          <TextInput 
            style={styles.input}
            value={cnh}
            onChangeText={setCnh}
            placeholder="Ex: 12345678901"
            keyboardType="number-pad"
            maxLength={15}
          />
          
          <Text style={styles.label}>WhatsApp (opcional)</Text>
          <TextInput 
            style={styles.input}
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="Ex: +5531912345678"
            keyboardType="phone-pad"
          />
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Mostrar WhatsApp para passageiros</Text>
            <Switch 
              value={showWhatsapp}
              onValueChange={setShowWhatsapp}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={showWhatsapp ? "#4285F4" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={styles.sectionDivider} />
          
          <Text style={styles.subtitle}>Informações do Veículo</Text>
          
          <Text style={styles.label}>Modelo do Carro</Text>
          <TextInput 
            style={styles.input}
            value={modelo}
            onChangeText={setModelo}
            placeholder="Ex: Gol 1.0"
          />
          
          <Text style={styles.label}>Placa</Text>
          <TextInput 
            style={styles.input}
            value={placa}
            onChangeText={text => setPlaca(text.toUpperCase())}
            placeholder="Ex: ABC1234"
            autoCapitalize="characters"
            maxLength={10}
          />
          
          <Text style={styles.label}>Cor</Text>
          <TextInput 
            style={styles.input}
            value={cor}
            onChangeText={setCor}
            placeholder="Ex: Prata"
          />
          
          <Text style={styles.label}>Capacidade de Passageiros</Text>
          <TextInput 
            style={styles.input}
            value={capacidade}
            onChangeText={setCapacidade}
            placeholder="Ex: 4"
            keyboardType="number-pad"
            maxLength={1}
          />
          
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isLoading && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                Salvar Alterações
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholderView: {
    width: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#444',
    flex: 1,
    marginRight: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 24,
  },
  submitButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  disabledButton: {
    backgroundColor: '#FFCC80',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UpdateDriverProfilePage;
