import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { COLORS, SPACING } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';
import { useFadeAnimation } from '../hooks/animations';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Import reusable components
import { PageHeader } from '../components/common';
import { FormCard, FormField } from '../components/form';
import { LoadingIndicator } from '../components/ui';
import { ActionButton } from '../components/common';

const UpdateProfilePage = ({ navigation, route }) => {
  const { userDetails } = route.params || {};
  const [nome, setNome] = useState(userDetails?.nome || '');
  const [matricula, setMatricula] = useState(userDetails?.matricula || '');
  const [curso, setCurso] = useState(userDetails?.curso || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { user, authToken, setUser } = useAuthContext();
  const [image, setImage] = useState(user?.photoUrl || null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

  // Use our custom animation hook
  const { animatedStyle } = useFadeAnimation({
    duration: 100
  });

  // Check for gallery permission when component mounts
  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);

  const validateForm = () => {
    if (!nome || nome.length < 3) {
      Alert.alert('Erro', 'Por favor, informe um nome válido (mínimo 3 caracteres).');
      return false;
    }

    if (!matricula) {
      Alert.alert('Erro', 'Por favor, informe sua matrícula.');
      return false;
    }

    return true;
  };

  const handlePickImage = async () => {
    if (!hasGalleryPermission) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar uma foto.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        // Here you would implement image upload to your server
        // and update the user's profile with the new image URL
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível carregar a imagem selecionada.');
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const userData = {
        nome,
        matricula,
        curso: curso || null,
      };

      // Call your API to update the user profile
      const response = await apiClient.put(`/estudante/${user.id}`, userData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        // If an image is selected, upload it
        if (image && image !== user?.photoUrl) {
          try {
            const formData = new FormData();
            formData.append('file', {
              uri: image,
              name: 'profile.jpg',
              type: 'image/jpeg',
            });

            const options = {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
              },
            };

            const imageResponse = await apiClient.patch(
              `/usuario/${user.id}/imagem`,
              formData,
              options
            );

            if (!imageResponse.success) {
              Alert.alert("Erro ao atualizar imagem:", imageResponse.error?.message || "Não foi possível atualizar a imagem.");
            }
          } catch (error) {
            console.error("Erro ao atualizar imagem:", error);
            Alert.alert("Erro", "Ocorreu um erro ao atualizar a imagem. Tente novamente.");
          }
        }

        // Update local user state with new data
        setUser({
          ...user,
          nome,
          matricula,
          curso,
          photoUrl: image || user?.photoUrl,
        });

        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [{
          text: 'OK',
          onPress: () => {
            // Fix: Navigate to TabNavigator first, then to Profile tab
            console.log('Navigating back to Main->TabNavigator->Profile with refresh param');
            navigation.navigate('TabNavigator', { 
              screen: 'Profile',
              params: { 
                refresh: Date.now(),
                updated: true
              }
            });
          }
        }
        ]);
      } else {
        Alert.alert('Erro', response.message || 'Erro ao atualizar o perfil.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !userDetails) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <LoadingIndicator text="Carregando seu perfil..." />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <PageHeader
        title="Editar Perfil"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={{ flex: 1, marginTop: -50 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[commonStyles.profileCard, styles.profileImageCard]}>
            <TouchableOpacity onPress={handlePickImage} style={styles.imageContainer}>
              {image ? (
                <Image source={{ uri: image }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="person" size={60} color={COLORS.primary} />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={18} color={COLORS.text.light} />
              </View>
            </TouchableOpacity>

            <Text style={styles.profileNameText}>{nome || user?.nome || 'Seu nome'}</Text>
            <Text style={styles.profileEmailText}>{user?.email || 'seu.email@exemplo.com'}</Text>
          </View>

          <View style={styles.formContainer}>
            <FormCard
              title="Informações Pessoais"
              icon="person"
              iconColor={COLORS.primary}
            >
              <FormField
                label="Nome"
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome completo"
                autoCapitalize="words"
              />

              <FormField
                label="Matrícula"
                value={matricula}
                onChangeText={setMatricula}
                placeholder="Número de matrícula"
                keyboardType="numeric"
              />

              <FormField
                label="Curso (opcional)"
                value={curso}
                onChangeText={setCurso}
                placeholder="Seu curso"
              />

              <ActionButton
                title="Salvar Alterações"
                onPress={handleUpdateProfile}
                isLoading={isLoading}
                icon="save"
                style={styles.saveButton}
              />
            </FormCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  profileImageCard: {
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  imageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileNameText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  profileEmailText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
  },
  saveButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  }
});

export default UpdateProfilePage;