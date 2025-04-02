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

const CreateDriverProfilePage = ({ navigation }) => {
  // Driver info
  const [cnh, setCnh] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  
  // Car info
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [capacidade, setCapacidade] = useState('4');
  
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
      
      const response = await apiClient.post(
        `/estudante/${user.id}/motorista`,
        driverData,
        options
      );
      
      if (response.success) {
        Alert.alert(
          "Sucesso",
          "Perfil de motorista criado com sucesso!",
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
          response.error?.message || "Não foi possível criar o perfil de motorista."
        );
      }
    } catch (error) {
      console.error("Erro ao criar perfil de motorista:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao criar o perfil de motorista. Tente novamente."
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
        <Text style={styles.headerTitle}>Tornar-se Motorista</Text>
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
                Cadastrar como Motorista
              </Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Ao se cadastrar como motorista, você concorda em oferecer caronas a outros estudantes
            da sua instituição de acordo com as regras do aplicativo.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 24,
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
    width: 24, // Same as back button icon to center the title
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
  submitButton: {
    backgroundColor: '#34A853',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  disabledButton: {
    backgroundColor: '#A0D9B4',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
});

export default CreateDriverProfilePage;
