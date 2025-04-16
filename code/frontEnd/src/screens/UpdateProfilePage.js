import React, { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';

const UpdateProfilePage = ({ navigation, route }) => {
  const { userDetails } = route.params || {};
  const [nome, setNome] = useState(userDetails?.nome || '');
  const [matricula, setMatricula] = useState(userDetails?.matricula || '');
  const [curso, setCurso] = useState(userDetails?.curso || '');
  const [isLoading, setIsLoading] = useState(false);
  const { user, authToken, setUser } = useAuthContext();
  const [image, setImage] = useState(null);
  
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
    if (!nome || nome.length < 3) {
      Alert.alert('Erro', 'Por favor, informe um nome válido (mínimo 3 caracteres).');
      return false;
    }

    if (!matricula || matricula.length < 5) {
      Alert.alert('Erro', 'Por favor, informe um número de matrícula válido (mínimo 5 caracteres).');
      return false;
    }

    if (!curso || curso.length < 3) {
      Alert.alert('Erro', 'Por favor, informe o curso.');
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    // Pede permissão para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permissão para acessar a galeria é necessária!');
      return;
    }

    // Abre a galeria
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });

        const options = {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        };

        const response = await apiClient.patch(
          `/usuario/${user.id}/imagem`,
          formData,
          options
        );

        if (response.success) {
          // Update the user photoUrl in context
          const updatedUser = {
            ...user,
            photoUrl: result.assets[0].uri
          };
          
          // Update user context
          setUser(updatedUser);
          
          // Update AsyncStorage
          await AsyncStorage.setItem('photoUrl', result.assets[0].uri);
          
          Alert.alert("Sucesso", "Imagem de perfil atualizada com sucesso!");
        } else {
          Alert.alert("Erro", response.error?.message || "Não foi possível atualizar a imagem.");
        }
      } catch (error) {
        console.error("Erro ao atualizar imagem:", error);
        Alert.alert("Erro", "Ocorreu um erro ao atualizar a imagem. Tente novamente.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const userData = {
        nome,
        matricula,
        curso
      };
      
      const options = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await apiClient.put(
        `/estudante/${user.id}`,
        userData,
        options
      );
      
      if (response.success) {
        // Update the user in AuthContext
        const updatedUser = {
          ...user,
          name: nome
        };
        
        // Update user context
        setUser(updatedUser);
        
        // Update AsyncStorage
        await AsyncStorage.setItem('userName', nome);
        
        Alert.alert(
          "Sucesso",
          "Perfil atualizado com sucesso!",
          [
            { 
              text: "OK", 
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        console.error("Erro ao atualizar perfil:", JSON.stringify(response.error));
        Alert.alert(
          "Erro",
          response.error?.message || "Não foi possível atualizar o perfil."
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil throw:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao atualizar o perfil. Tente novamente."
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
        <Text style={styles.headerTitle}>Atualizar Perfil</Text>
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
          <Text style={styles.subtitle}>Informações Pessoais</Text>

          <View style={styles.imgView}>
          <TouchableOpacity style={styles.imgButton} onPress={pickImage}>
          {image ? (
    <Image
      source={{ uri: image }}
      style={styles.imgPreview}
    />
  ) : (
    <Ionicons name="image" size={24} color="#4285F4" />
  )}
          </TouchableOpacity>
          </View>
          
          
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput 
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
          />
          
          <Text style={styles.label}>Matrícula</Text>
          <TextInput 
            style={styles.input}
            value={matricula}
            onChangeText={setMatricula}
            placeholder="Número de matrícula"
          />
          
          <Text style={styles.label}>Curso</Text>
          <TextInput 
            style={styles.input}
            value={curso}
            onChangeText={setCurso}
            placeholder="Seu curso"
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
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  disabledButton: {
    backgroundColor: '#A0C4E8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imgButton:{
    width: 100,
    backgroundColor:'white',
    borderRadius:50,
    borderColor: '#4285F4',
    borderWidth: 1,
    height:100,
    alignItems:"center",
    flexDirection:"column",
    justifyContent:"center"
  },
  imgView:{
  width:"full",
 
  alignItems:"center",
  },
  imgPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  }
});

export default UpdateProfilePage;
