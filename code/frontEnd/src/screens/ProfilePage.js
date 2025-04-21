import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';

// Import reusable components
import {
  NavigationCard,
  ProfileHeader
} from '../components/common';
import { ErrorState, LoadingIndicator } from '../components/ui';

const ProfilePage = ({ navigation, route }) => {
  const { user, logoutUser, authToken } = useAuthContext();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [isCheckingDriver, setIsCheckingDriver] = useState(true);

  // Fetch user details from the backend
  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.debug('Fetching user details: ', user);

      const response = await apiClient.get(`/estudante/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        setUserDetails(response.data);
      } else {
        setError('Erro ao carregar dados do usuário');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Não foi possível carregar seus dados');
    } finally {
      setLoading(false);
    }
  }, [user?.id, authToken]);

  // Check if user is a driver
  const checkDriverStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsCheckingDriver(true);
      const response = await apiClient.get(`/estudante/${user?.id}/motorista`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        setDriverProfile(response.data);
      } else {
        setDriverProfile(null);
      }
    } catch (err) {
      console.error('Error checking driver status:', err);
      setDriverProfile(null);
    } finally {
      setIsCheckingDriver(false);
    }
  }, [user?.id, authToken]);

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      fetchUserDetails();
      checkDriverStatus();
    }
  }, [fetchUserDetails, checkDriverStatus, user]);

  // Refresh when screen comes into focus or after updates
  useFocusEffect(
    useCallback(() => {
      const timestamp = route?.params?.refresh || null;
      if (timestamp) {
        console.log('Refreshing user details at:', new Date(timestamp).toLocaleString());
        fetchUserDetails();
        checkDriverStatus();
      }
    }, [route?.params?.refresh, fetchUserDetails, checkDriverStatus])
  );

  // Handle profile navigation
  const handleUpdateProfile = useCallback(() => {
    navigation.navigate('UpdateProfile', { userDetails });
  }, [navigation, userDetails]);

  // Handle driver profile navigation
  const handleDriverProfile = useCallback(() => {
    if (driverProfile) {
      navigation.navigate('UpdateDriverProfile', { driverProfile });
    } else {
      navigation.navigate('CreateDriverProfile');
    }
  }, [navigation, driverProfile]);

  // Handle logout
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Sair', style: 'destructive', onPress: logoutUser }
      ]
    );
  }, [logoutUser]);

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <LoadingIndicator text="Carregando seu perfil..." />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <ErrorState 
          errorMessage={error} 
          onRetry={fetchUserDetails} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={{ height: 150, paddingTop: 20 }}
      >
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.text.light }}>Perfil</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, marginTop: -50 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[commonStyles.profileCard, styles.profileCard]}>
          <ProfileHeader 
            user={userDetails || user}
            showEditButton={false}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <NavigationCard
            title="Informações Pessoais"
            description="Atualize seu nome, matrícula e curso"
            icon="person"
            iconColor={COLORS.primary}
            onPress={handleUpdateProfile}
          />

          <NavigationCard
            title={driverProfile ? "Perfil de Motorista" : "Tornar-se Motorista"}
            description={driverProfile 
              ? "Gerencie suas informações de motorista e veículo" 
              : "Cadastre-se como motorista para oferecer caronas"
            }
            icon="car"
            iconColor={COLORS.secondary}
            onPress={handleDriverProfile}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md
  },
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    marginTop: SPACING.sm,
  },
});

export default ProfilePage;