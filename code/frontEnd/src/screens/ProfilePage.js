import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { useFadeAnimation } from '../hooks/animations';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';

const ProfilePage = ({ navigation, route }) => {
  const { user, logout, authToken } = useAuthContext();
  const [userDetails, setUserDetails] = useState(null);
  const [isDriverProfile, setIsDriverProfile] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use our custom animation hook
  const { animatedStyle } = useFadeAnimation({
    duration: 100
  });

  // Simplified API fetch with clearer logging
  const fetchUserDetails = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      console.log('Fetching user details for ID:', user.id);

      // Get user profile data
      const response = await apiClient.get(`/estudante/${user.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        console.log('Successfully fetched user details, updating state');
        setUserDetails(response.data);
      } else {
        console.error('Failed to fetch user details:', response.error);
      }

      // Get driver profile data (if exists)
      const driverResponse = await apiClient.get(`/estudante/${user.id}/motorista`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (driverResponse.success) {
        console.log('Successfully fetched driver profile, updating state');
        setIsDriverProfile(true);
        setDriverProfile(driverResponse.data);
      } else {
        console.log('No driver profile found or error:', driverResponse.error);
        setIsDriverProfile(false);
        setDriverProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do usuário.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, authToken]);

  // Clearer, more reliable focus effect
  useFocusEffect(
    useCallback(() => {
      const timestamp = route?.params?.refresh || Date.now();
      console.log('Profile screen focused with timestamp:', timestamp);
      fetchUserDetails();

      return () => {
        // No cleanup needed
      };
    }, [fetchUserDetails, route?.params?.refresh])
  );

  const handleLogout = useCallback(async () => {
    try {
      const success = await logout();
      if (success) {
        // Logout successful, navigation will be handled by AppNavigator
      } else {
        Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar sair da conta.');
    }
  }, [logout]);

  const confirmLogout = useCallback(() => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: handleLogout }
      ]
    );
  }, [handleLogout]);

  const navigateToUpdateProfile = useCallback(() => {
    navigation.navigate('UpdateProfile', { userDetails });
  }, [navigation, userDetails]);

  const navigateToCreateDriverProfile = useCallback(() => {
    navigation.navigate('CreateDriverProfile');
  }, [navigation]);

  const navigateToUpdateDriverProfile = useCallback(() => {
    navigation.navigate('UpdateDriverProfile', { driverProfile });
  }, [navigation, driverProfile]);

  const navigateToRidesPage = useCallback(() => {
    navigation.navigate('RidesPage', { mode: 'my-rides' });
  }, [navigation]);

  // Function to render account status badge
  const renderAccountStatusBadge = () => {
    if (!userDetails || !userDetails.statusCadastro) return null;

    let badgeStyle = {};
    let badgeTextStyle = {};
    let statusText = '';
    let statusIcon = null;

    switch (userDetails.statusCadastro) {
      case 'APROVADO':
        badgeStyle = styles.approvedBadge;
        badgeTextStyle = styles.approvedBadgeText;
        statusText = 'Aprovado';
        statusIcon = <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />;
        break;
      case 'PENDENTE':
        badgeStyle = styles.pendingBadge;
        badgeTextStyle = styles.pendingBadgeText;
        statusText = 'Pendente';
        statusIcon = <Ionicons name="time" size={16} color={COLORS.warning} />;
        break;
      case 'REJEITADO':
        badgeStyle = styles.rejectedBadge;
        badgeTextStyle = styles.rejectedBadgeText;
        statusText = 'Rejeitado';
        statusIcon = <Ionicons name="close-circle" size={16} color={COLORS.danger} />;
        break;
      default:
        return null;
    }

    return (
      <View style={badgeStyle}>
        {statusIcon}
        <Text style={badgeTextStyle}>{statusText}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={{ height: 150, paddingTop: SPACING.lg }}
      >
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.text.light }}>Perfil</Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[{ flex: 1, marginTop: -50 }, animatedStyle]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Start of content */}
        <View style={[commonStyles.profileCard, {
          marginHorizontal: SPACING.lg,
          paddingVertical: SPACING.lg,
          marginBottom: SPACING.lg,
        }]}>
          <View style={{ alignItems: 'center' }}>
            {user?.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={commonStyles.profileImage}
                // Add key to force re-render when photoUrl changes
                key={user.photoUrl}
              />
            ) : (
              <View style={commonStyles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#FFF" />
              </View>
            )}
            <Text style={commonStyles.userNameText}>{userDetails?.nome || user?.name || 'Usuário'}</Text>
            <Text style={commonStyles.userEmailText}>{userDetails?.email || user?.email}</Text>

            {/* Account Status Badge */}
            {renderAccountStatusBadge()}

            <TouchableOpacity
              style={commonStyles.profileButton}
              onPress={navigateToUpdateProfile}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
              <Text style={commonStyles.profileButtonText}>Atualizar Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: SPACING.lg }}>
          <Text style={commonStyles.sectionTitle}>Informações Pessoais</Text>

          <View style={commonStyles.profileCard}>
            <View style={commonStyles.infoListItem}>
              <View style={commonStyles.infoIcon}>
                <Ionicons name="school-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={commonStyles.infoTextContainer}>
                <Text style={commonStyles.infoLabel}>Matrícula</Text>
                <Text style={commonStyles.infoValue}>{userDetails?.matricula || 'Não informado'}</Text>
              </View>
            </View>

            <View style={commonStyles.divider} />

            <View style={commonStyles.infoListItem}>
              <View style={commonStyles.infoIcon}>
                <Ionicons name="book-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={commonStyles.infoTextContainer}>
                <Text style={commonStyles.infoLabel}>Curso</Text>
                <Text style={commonStyles.infoValue}>{userDetails?.curso || 'Não informado'}</Text>
              </View>
            </View>

            {userDetails?.avaliacaoMedia && (
              <>
                <View style={commonStyles.divider} />

                <View style={commonStyles.infoListItem}>
                  <View style={commonStyles.infoIcon}>
                    <Ionicons name="star" size={24} color={COLORS.warning} />
                  </View>
                  <View style={commonStyles.infoTextContainer}>
                    <Text style={commonStyles.infoLabel}>Avaliação Média</Text>
                    <Text style={commonStyles.infoValue}>
                      {userDetails.avaliacaoMedia.toFixed(1)} / 5.0
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {isDriverProfile ? (
          <View style={{ paddingHorizontal: SPACING.lg }}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={commonStyles.sectionTitle}>Perfil de Motorista</Text>

              <TouchableOpacity
                style={styles.editDriverButton}
                onPress={navigateToUpdateDriverProfile}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                <Text style={styles.editDriverButtonText}>Editar</Text>
              </TouchableOpacity>

              {/* Driver Profile Status Badge */}
              {driverProfile?.statusCadastro && 
                <View style={
                  driverProfile.statusCadastro === 'APROVADO' ? styles.approvedBadge :
                  driverProfile.statusCadastro === 'PENDENTE' ? styles.pendingBadge :
                  styles.rejectedBadge
                }>
                  <Ionicons
                    name={
                      driverProfile.statusCadastro === 'APROVADO' ? "checkmark-circle" :
                      driverProfile.statusCadastro === 'PENDENTE' ? "time" :
                      "close-circle"
                    }
                    size={16}
                    color={
                      driverProfile.statusCadastro === 'APROVADO' ? COLORS.success :
                      driverProfile.statusCadastro === 'PENDENTE' ? COLORS.warning :
                      COLORS.danger
                    }
                  />
                  <Text style={
                    driverProfile.statusCadastro === 'APROVADO' ? styles.approvedBadgeText :
                    driverProfile.statusCadastro === 'PENDENTE' ? styles.pendingBadgeText :
                    styles.rejectedBadgeText
                  }>
                    {driverProfile.statusCadastro === 'APROVADO' ? 'Aprovado' :
                     driverProfile.statusCadastro === 'PENDENTE' ? 'Pendente' :
                     'Rejeitado'}
                  </Text>
                </View>
              }
            </View>

            <View style={commonStyles.profileCard}>
              <View style={commonStyles.infoListItem}>
                <View style={commonStyles.infoIcon}>
                  <Ionicons name="car-outline" size={24} color={COLORS.success} />
                </View>
                <View style={commonStyles.infoTextContainer}>
                  <Text style={commonStyles.infoLabel}>Veículo</Text>
                  <Text style={commonStyles.infoValue}>
                    {driverProfile?.carro?.modelo} ({driverProfile?.carro?.cor})
                  </Text>
                </View>
              </View>

              <View style={commonStyles.divider} />

              <View style={commonStyles.infoListItem}>
                <View style={commonStyles.infoIcon}>
                  <Ionicons name="speedometer-outline" size={24} color={COLORS.success} />
                </View>
                <View style={commonStyles.infoTextContainer}>
                  <Text style={commonStyles.infoLabel}>Placa</Text>
                  <Text style={commonStyles.infoValue}>{driverProfile?.carro?.placa}</Text>
                </View>
              </View>

              <View style={commonStyles.divider} />

              <View style={commonStyles.infoListItem}>
                <View style={commonStyles.infoIcon}>
                  <Ionicons name="people-outline" size={24} color={COLORS.success} />
                </View>
                <View style={commonStyles.infoTextContainer}>
                  <Text style={commonStyles.infoLabel}>Capacidade</Text>
                  <Text style={commonStyles.infoValue}>{driverProfile?.carro?.capacidadePassageiros} passageiros</Text>
                </View>
              </View>

              {driverProfile?.whatsapp && (
                <>
                  <View style={commonStyles.divider} />

                  <View style={commonStyles.infoListItem}>
                    <View style={commonStyles.infoIcon}>
                      <Ionicons name="logo-whatsapp" size={24} color={COLORS.success} />
                    </View>
                    <View style={commonStyles.infoTextContainer}>
                      <Text style={commonStyles.infoLabel}>WhatsApp</Text>
                      <Text style={commonStyles.infoValue}>{driverProfile?.whatsapp}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Show message if driver profile is pending or rejected */}
            {driverProfile?.statusCadastro && driverProfile.statusCadastro !== 'APROVADO' && (
              <View style={styles.statusMessageContainer}>
                <Ionicons
                  name={driverProfile.statusCadastro === 'PENDENTE' ? "information-circle" : "alert-circle"}
                  size={24}
                  color={driverProfile.statusCadastro === 'PENDENTE' ? COLORS.warning : COLORS.danger}
                />
                <Text style={styles.statusMessageText}>
                  {driverProfile.statusCadastro === 'PENDENTE'
                    ? 'Seu perfil de motorista está em análise. Você poderá oferecer caronas assim que for aprovado.'
                    : 'Seu perfil de motorista foi rejeitado. Entre em contato com o suporte para mais informações.'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[commonStyles.profileCard, {
            marginHorizontal: SPACING.lg,
            alignItems: 'center',
            padding: SPACING.lg
          }]}>
            <Ionicons name="car-outline" size={40} color={COLORS.text.secondary} />
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: COLORS.text.primary,
              marginTop: SPACING.md,
              marginBottom: SPACING.sm
            }}>
              Torne-se um Motorista
            </Text>
            <Text style={{
              fontSize: 14,
              color: COLORS.text.secondary,
              textAlign: 'center',
              marginBottom: SPACING.lg
            }}>
              Cadastre-se como motorista para poder oferecer caronas para outros estudantes.
            </Text>
            <TouchableOpacity
              style={[commonStyles.secondaryButton, { width: '100%' }]}
              onPress={navigateToCreateDriverProfile}
              disabled={userDetails?.statusCadastro !== 'APROVADO'}
            >
              <Text style={commonStyles.secondaryButtonText}>Cadastrar como Motorista</Text>
            </TouchableOpacity>

            {/* Show message if user account is not approved */}
            {userDetails?.statusCadastro && userDetails.statusCadastro !== 'APROVADO' && (
              <View style={styles.statusMessageContainer}>
                <Ionicons
                  name={userDetails.statusCadastro === 'PENDENTE' ? "information-circle" : "alert-circle"}
                  size={20}
                  color={userDetails.statusCadastro === 'PENDENTE' ? COLORS.warning : COLORS.danger}
                />
                <Text style={[styles.statusMessageText, { fontSize: 12 }]}>
                  {userDetails.statusCadastro === 'PENDENTE'
                    ? 'Sua conta precisa ser aprovada antes de se cadastrar como motorista.'
                    : 'Sua conta foi rejeitada. Entre em contato com o suporte.'}
                </Text>
              </View>
            )}
          </View>
        )
        }

        <TouchableOpacity
          style={[commonStyles.dangerButton, {
            marginHorizontal: SPACING.lg,
            marginTop: SPACING.lg
          }]}
          onPress={confirmLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.text.light} />
          <Text style={commonStyles.dangerButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </Animated.ScrollView >
    </SafeAreaView >
  );
};

// Add new styles for status badges and messages
const styles = StyleSheet.create({
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 181, 67, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
  },
  approvedBadgeText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 191, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
  },
  pendingBadgeText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 87, 87, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
  },
  rejectedBadgeText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  statusMessageText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  editDriverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: SPACING.md,
  },
  editDriverButtonText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: FONT_SIZE.xs,
    marginLeft: 2,
  }
});

export default React.memo(ProfilePage);