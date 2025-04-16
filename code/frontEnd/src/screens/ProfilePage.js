import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { Image } from 'react-native';

const ProfilePage = ({ navigation }) => {
  const { user, logout, authToken } = useAuthContext();
  const [userDetails, setUserDetails] = useState(null);
  const [isDriverProfile, setIsDriverProfile] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    fetchUserDetails();
  }, []);

  // Update after navigation back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserDetails();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        console.log("No user ID available to fetch profile");
        setLoading(false);
        return;
      }

      const options = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };

      // Fetch student details
      const response = await apiClient.get(`/estudante/${user.id}`, options);

      if (response.success) {
        setUserDetails(response.data);

        // Check if user has driver profile
        try {
          const driverResponse = await apiClient.get(`/estudante/${user.id}/motorista`, options);
          if (driverResponse.success) {
            setIsDriverProfile(true);
            setDriverProfile(driverResponse.data);
          } else {
            setIsDriverProfile(false);
            setDriverProfile(null);
          }
        } catch (err) {
          console.log("User doesn't have a driver profile yet or there was an error:", err.message);

          // Check if the error is because the user is not a driver (HTTP 400 with specific message)
          if (err.response && err.response.status === 400 &&
            (err.response.data?.message?.includes('não é motorista') ||
              err.response.data?.error?.includes('não é motorista'))) {
            console.log("User is not a driver yet");
          } else {
            console.error("Error fetching driver profile:", err);
          }

          setIsDriverProfile(false);
          setDriverProfile(null);
        }
      } else {
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriverProfile = () => {
    navigation.navigate('CreateDriverProfile');
  };

  const handleUpdateDriverProfile = () => {
    navigation.navigate('UpdateDriverProfile', { driverProfile });
  };

  const handleUpdateProfile = () => {
    navigation.navigate('UpdateProfile', { userDetails });
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  // Check if user has completed their basic profile
  const isProfileComplete = () => {
    return userDetails &&
      userDetails.nome &&
      userDetails.matricula &&
      userDetails.curso;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {userDetails ? (
            <>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {userDetails.imgUrl ? (
                    <Image
                      source={{ uri: userDetails.imgUrl }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {userDetails.nome ? userDetails.nome[0].toUpperCase() : "?"}
                    </Text>
                  )}
                </View>

                <Text style={styles.userName}>{userDetails.nome}</Text>
                <Text style={styles.userEmail}>{userDetails.email}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Informações Pessoais</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Matrícula:</Text>
                  <Text style={styles.infoValue}>{userDetails.matricula || 'Não informado'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Curso:</Text>
                  <Text style={styles.infoValue}>{userDetails.curso || 'Não informado'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <Text style={[styles.infoValue,
                  userDetails.statusCadastro === 'APROVADO' ? styles.statusApproved :
                    userDetails.statusCadastro === 'PENDENTE' ? styles.statusPending :
                      styles.statusRejected]}>
                    {userDetails.statusCadastro || 'PENDENTE'}
                  </Text>
                </View>
              </View>

              {isDriverProfile && driverProfile ? (
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Perfil de Motorista</Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleUpdateDriverProfile}
                    >
                      <Ionicons name="pencil" size={18} color="#4285F4" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>CNH:</Text>
                    <Text style={styles.infoValue}>{driverProfile.cnh || 'Não informado'}</Text>
                  </View>

                  {driverProfile.whatsapp && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>WhatsApp:</Text>
                      <Text style={styles.infoValue}>{driverProfile.whatsapp}</Text>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mostrar WhatsApp:</Text>
                    <Text style={styles.infoValue}>{driverProfile.mostrarWhatsapp ? 'Sim' : 'Não'}</Text>
                  </View>

                  <View style={styles.sectionSubtitle}>
                    <Text style={styles.sectionSubtitleText}>Informações do Veículo</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Modelo:</Text>
                    <Text style={styles.infoValue}>{driverProfile.carro?.modelo || 'Não informado'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Placa:</Text>
                    <Text style={styles.infoValue}>{driverProfile.carro?.placa || 'Não informado'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Cor:</Text>
                    <Text style={styles.infoValue}>{driverProfile.carro?.cor || 'Não informado'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Capacidade:</Text>
                    <Text style={styles.infoValue}>{driverProfile.carro?.capacidadePassageiros || '4'} passageiros</Text>
                  </View>
                </View>
              ) : (
                userDetails && userDetails.statusCadastro === 'APROVADO' && (
                  <TouchableOpacity
                    style={styles.createDriverButton}
                    onPress={handleCreateDriverProfile}
                  >
                    <Ionicons name="car-outline" size={24} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.createDriverButtonText}>Tornar-se Motorista</Text>
                  </TouchableOpacity>
                )
              )}

              {/* Show profile button based on completion status */}
              {userDetails && (
                <TouchableOpacity
                  style={styles.updateProfileButton}
                  onPress={handleUpdateProfile}
                >
                  <Ionicons name="person-outline" size={22} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.updateProfileButtonText}>
                    {isProfileComplete() ? "Atualizar Perfil" : "Completar Perfil"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Não foi possível carregar os dados do perfil</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchUserDetails}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: '40%',
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    width: '60%',
    fontSize: 15,
    color: '#333',
  },
  statusApproved: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  statusRejected: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  createDriverButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createDriverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateProfileButton: {
    backgroundColor: '#34A853',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  updateProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionSubtitle: {
    marginTop: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  sectionSubtitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    padding: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateDriverButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  updateDriverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfilePage;
