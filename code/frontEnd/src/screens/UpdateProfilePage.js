import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { useFadeAnimation } from '../hooks/animations';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';

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

  // Helper function to parse API error messages
  const parseApiError = (error) => {
    // Default error message
    let errorMessage = "Ocorreu um erro ao processar sua solicitação.";

    try {
      // Check if there's a response body with error details
      if (error?.body) {
        const { codigo, descricao } = error.body;

        // Handle specific error codes
        switch (codigo) {
          case 'arquivo.imagem.muito.grande':
            return "A imagem selecionada é muito grande. Por favor, escolha uma imagem menor (máximo 5MB).";
          case 'arquivo.formato.invalido':
            return "O formato da imagem é inválido. Por favor, use JPG, PNG ou JPEG.";
          case 'arquivo.upload.erro':
            return "Erro ao fazer upload da imagem. Por favor, tente novamente.";
          default:
            // If we have a description, use it
            if (descricao) {
              return descricao;
            }
        }
      }

      // Check for network errors
      if (error?.original?.message) {
        if (error.original.message.includes('Network Error')) {
          return "Erro de conexão. Verifique sua internet e tente novamente.";
        }
        if (error.original.message.includes('timeout')) {
          return "A solicitação excedeu o tempo limite. Tente novamente.";
        }
      }

      // If we have an error message directly, use it
      if (error?.message) {
        return error.message;
      }

    } catch (e) {
      console.error("Error parsing API error:", e);
    }

    return errorMessage;
  };

  const pickImage = async () => {
    if (hasGalleryPermission === false) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para selecionar uma foto.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Configurações",
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality to decrease file size
        maxWidth: 400,
        maxHeight: 400,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem. Tente novamente.");
    }
  };

  const uploadImage = async (imageUri) => {
    setIsUploadingImage(true);

    try {
      // Get file info
      const fileInfo = await getFileInfo(imageUri);

      // Check file size (limit to 5MB)
      if (fileInfo.size > 5 * 1024 * 1024) {
        Alert.alert(
          "Arquivo muito grande",
          "A imagem selecionada é muito grande (máximo 5MB). Por favor, escolha uma imagem menor."
        );
        setIsUploadingImage(false);
        return;
      }

      // Create form data for image upload
      const formData = new FormData();

      // Get file extension
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();

      // Check if file type is supported
      if (!['jpg', 'jpeg', 'png'].includes(fileType)) {
        Alert.alert(
          "Formato não suportado",
          "Por favor, selecione uma imagem nos formatos JPG, JPEG ou PNG."
        );
        setIsUploadingImage(false);
        return;
      }

      formData.append('file', {
        uri: imageUri,
        name: `profile.${fileType}`,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
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

      console.log("Response from image upload:", response);

      if (response.success) {
        // Update local state
        setImage(imageUri);

        // Update the user photoUrl in context
        const updatedUser = {
          ...user,
          photoUrl: imageUri
        };

        // Update user context
        setUser(updatedUser);

        // Update AsyncStorage
        await AsyncStorage.setItem('photoUrl', imageUri);

        Alert.alert("Sucesso", "Imagem de perfil atualizada com sucesso!");
      } else {
        const errorMessage = parseApiError(response.error);
        Alert.alert("Erro ao atualizar imagem", errorMessage);
      }
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
      const errorMessage = parseApiError(error);
      Alert.alert("Erro", `Ocorreu um erro ao atualizar a imagem: ${errorMessage}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Helper function to get file info
  const getFileInfo = async (fileUri) => {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo;
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

      console.log('Updating user profile with data:', userData);
      
      const response = await apiClient.put(
        `/estudante/${user.id}`,
        userData,
        options
      );

      if (response.success) {
        console.log('Profile updated successfully');
        
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
          ]
        );
      } else {
        console.error("Error updating profile:", JSON.stringify(response.error));
        const errorMessage = parseApiError(response.error);
        Alert.alert("Erro", errorMessage);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = parseApiError(error);
      Alert.alert("Erro", `Ocorreu um erro ao atualizar o perfil: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={{ height: 150, paddingTop: SPACING.lg }}
      >
        <View style={styles.headerView}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Atualizar Perfil</Text>

          <View style={{ width: 24 }}>
            {/* Empty Text to avoid warning */}
            <Text style={{ display: 'none' }}></Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[{ flex: 1, marginTop: -50 }, animatedStyle]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[commonStyles.profileCard, {
          marginHorizontal: SPACING.lg,
          paddingVertical: SPACING.lg,
          marginBottom: SPACING.lg,
          alignItems: 'center'
        }]}>
          <TouchableOpacity
            onPress={pickImage}
            disabled={isUploadingImage}
            style={styles.profileImageContainer}
          >
            {isUploadingImage ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : null}

            {image ? (
              <Image
                source={{ uri: image }}
                style={commonStyles.profileImage}
              />
            ) : (
              <View style={commonStyles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#FFF" />
              </View>
            )}

            <View style={styles.editImageBadge}>
              <Ionicons name="image" size={16} color={COLORS.text.light} />
            </View>
          </TouchableOpacity>

          <Text style={[commonStyles.userNameText, { marginTop: SPACING.md }]}>
            {nome || userDetails?.nome || user?.name || 'Usuário'}
          </Text>
          <Text style={commonStyles.userEmailText}>
            {userDetails?.email || user?.email}
          </Text>

          <Text style={styles.imageHelpText}>
            Toque na imagem para alterar sua foto de perfil
          </Text>
        </View>

        <View style={{ paddingHorizontal: SPACING.lg }}>
          <Text style={commonStyles.sectionTitle}>Informações Pessoais</Text>

          <View style={commonStyles.profileCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome completo"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Matrícula</Text>
              <TextInput
                style={styles.input}
                value={matricula}
                onChangeText={setMatricula}
                placeholder="Número de matrícula"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Curso</Text>
              <TextInput
                style={styles.input}
                value={curso}
                onChangeText={setCurso}
                placeholder="Seu curso"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              commonStyles.primaryButton,
              styles.submitButton,
              isLoading && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.text.light} size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="save-outline" size={20} color={COLORS.text.light} />
                <Text style={[commonStyles.primaryButtonText, { marginLeft: 8 }]}>
                  Salvar Alterações
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.secondaryButton, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="close-outline" size={20} color={COLORS.text.light} />
              <Text style={[commonStyles.secondaryButtonText, { marginLeft: 8 }]}>
                Cancelar
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButton: {
    marginTop: SPACING.md,
  },
  profileImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHelpText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  }
});

export default UpdateProfilePage;