import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Animated, StyleSheet, Text, TouchableOpacity, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingIndicator } from '../components/ui';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { useFadeAnimation } from '../hooks/animations';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';

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
      const response = await apiClient.get(`/estudante/${user.id}/motorista`, {
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
    Alert.alert(
      "Aviso",
      "Funcionalidade em desenvolvimento.",
      [{ text: "OK" }]
    );  
    // navigation.navigate('RidesPage', { mode });
  }, [navigation]);

  const handleSearchRide = useCallback(() => {
    Alert.alert(
      "Aviso",
      "Funcionalidade em desenvolvimento.",
      [{ text: "OK" }]
    );
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingIndicator />
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
              <View style={[commonStyles.profileCard, { marginBottom: SPACING.md }]}>
                <View style={styles.optionHeader}>
                  <Ionicons name="car" size={32} color={COLORS.primary} />
                  <Text style={styles.optionTitle}>Oferecer Carona</Text>
                </View>

                <Text style={styles.optionDescription}>
                  Cadastre uma nova carona como motorista e ajude outros estudantes a chegarem ao seu destino.
                </Text>

                <TouchableOpacity
                  style={[commonStyles.primaryButton, { marginTop: SPACING.md }]}
                  onPress={handleStartDrive}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.text.light} />
                    <Text style={[commonStyles.primaryButtonText, { marginLeft: 8 }]}>
                      Cadastrar Carona
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={[commonStyles.profileCard, { marginTop: SPACING.md }]}>
                <View style={styles.optionHeader}>
                  <Ionicons name="list" size={32} color={COLORS.secondary} />
                  <Text style={styles.optionTitle}>Minhas Caronas</Text>
                </View>

                <Text style={styles.optionDescription}>
                  Visualize suas caronas agendadas, histórico e status.
                </Text>

                <TouchableOpacity
                  style={[commonStyles.secondaryButton, { marginTop: SPACING.md, backgroundColor: COLORS.secondary }]}
                  onPress={() => handleHistoryRide('driver')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="list-outline" size={20} color={COLORS.text.light} />
                    <Text style={[commonStyles.secondaryButtonText, { marginLeft: 8 }]}>
                      Ver Minhas Caronas
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={commonStyles.profileCard}>
            <View style={styles.optionHeader}>
              <Ionicons name="search" size={32} color={COLORS.success} />
              <Text style={styles.optionTitle}>Buscar Carona</Text>
            </View>

            <Text style={styles.optionDescription}>
              Encontre caronas disponíveis para o seu destino e economize tempo e dinheiro.
            </Text>

            <TouchableOpacity
              style={[commonStyles.secondaryButton, { marginTop: SPACING.md, backgroundColor: COLORS.success }]}
              onPress={handleSearchRide}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="search" size={20} color={COLORS.text.light} />
                <Text style={[commonStyles.secondaryButtonText, { marginLeft: 8 }]}>
                  Buscar Caronas
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  optionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
  },
  optionDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
});

export default React.memo(RideModeSelectionPage);