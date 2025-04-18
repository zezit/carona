import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Animated, StyleSheet, Text, TouchableOpacity, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { useFadeAnimation } from '../hooks/animations';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';

// Import reusable components
import { LoadingIndicator, OptionButton, EmptyState } from '../components/ui';

const RideModeSelectionPage = ({ navigation, route }) => {
  const { user, authToken } = useAuthContext();
  const [isDriver, setIsDriver] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Use our custom animation hook
  const { animatedStyle } = useFadeAnimation({
    duration: 100
  });

  // Memoized API call for driver status check
  const checkDriverStatus = useCallback(async () => {
    try {
      const response = await apiClient.get(`/estudante/${user?.id}/motorista`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.debug('Driver status response:', JSON.stringify(response.data, null, 2));

      // Check if driver is approved
      if (response.success && response.data) {
        setIsDriver(true);
      } else {
        setIsDriver(false);
      }
    } catch (error) {
      console.error('Error checking driver status:', error);
      setIsDriver(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authToken]);

  // Check if user is a driver on mount
  useEffect(() => {
    checkDriverStatus();
  }, [checkDriverStatus]);

  useFocusEffect(
    useCallback(() => {
      const timestamp = route?.params?.refresh || Date.now();
      console.log('Refreshing user details at:', new Date(timestamp).toLocaleString());
      checkDriverStatus();

      return () => {
        // No cleanup needed
      };
    }, [checkDriverStatus, route?.params?.refresh])
  );

  // Memoized handlers for navigation
  const handleStartDrive = useCallback(() => {
    navigation.navigate('RegisterRide');
  }, [navigation]);

  const handleHistoryRide = useCallback((mode) => {
    // TODO:  navigation.navigate('RidesPage', { mode });
    Alert.alert('Em breve!', 'Essa funcionalidade ainda está em desenvolvimento.');
  }, [navigation]);

  const handleSearchRide = useCallback(() => {
    // TODO: navigation.navigate('RidesPage', { mode: 'available-rides' });
    Alert.alert('Em breve!', 'Essa funcionalidade ainda não está disponível.');
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingIndicator text="Carregando seus dados..." />
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
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.text.light }}>Caronas</Text>
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
          <Text style={styles.title}>O que você deseja fazer?</Text>
          <Text style={styles.subtitle}>Escolha uma das opções abaixo</Text>
        </View>

        <View style={{ paddingHorizontal: SPACING.lg }}>
          {isDriver && (
            <View>
              <OptionButton
                title="Oferecer Carona"
                description="Cadastre uma nova carona como motorista"
                icon="car"
                color={COLORS.primary}
                onPress={handleStartDrive}
              />

              <OptionButton
                title="Minhas Caronas"
                description="Visualize suas caronas agendadas e histórico"
                icon="list"
                color={COLORS.secondary}
                onPress={() => handleHistoryRide('my-rides')}
              />
            </View>
          )}

          <OptionButton
            title="Buscar Carona"
            description="Encontre caronas disponíveis para seu destino"
            icon="search"
            color={COLORS.success}
            onPress={handleSearchRide}
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  notDriverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  notDriverTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  notDriverText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});

export default RideModeSelectionPage;