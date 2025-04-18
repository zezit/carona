import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';

// Import reusable components
import { ActionButton, PageHeader } from '../components/common';
import { FormCard, FormField } from '../components/form';
import { LoadingIndicator } from '../components/ui';

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
  const [isFetching, setIsFetching] = useState(false);
  const { user, authToken } = useAuthContext();

  // Add useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only fetch if we didn't receive driver profile as a parameter
      if (!driverProfile) {
        fetchDriverProfile();
      }

      return () => {
        // Clean up code if needed
      };
    }, [driverProfile])
  );

  const fetchDriverProfile = async () => {
    try {
      setIsFetching(true);
      const response = await apiClient.get(`/estudante/${user.id}/motorista`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        const profile = response.data;
        setCnh(profile.cnh || '');
        setWhatsapp(profile.whatsapp || '');
        setShowWhatsapp(profile.mostrarWhatsapp || false);

        if (profile.carro) {
          setModelo(profile.carro.modelo || '');
          setPlaca(profile.carro.placa || '');
          setCor(profile.carro.cor || '');
          setCapacidade(profile.carro.capacidadePassageiros?.toString() || '4');
        }
      } else {
        // No driver profile found or error
        Alert.alert('Erro', 'Não foi possível carregar os dados do motorista.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do motorista.');
      navigation.goBack();
    } finally {
      setIsFetching(false);
    }
  };

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

    return true;
  };

  const handleUpdateDriverProfile = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Estrutura os dados conforme esperado pela API
      const driverData = {
        cnh,
        whatsapp,
        mostrarWhatsapp: showWhatsapp,
        carro: {
          modelo,
          placa,
          cor,
          capacidadePassageiros: parseInt(capacidade, 10)
        }
      };

      // Envia para a API
      const response = await apiClient.put(`/estudante/${user.id}/motorista`, driverData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        Alert.alert('Sucesso', 'Perfil de motorista atualizado com sucesso!', [{
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
        Alert.alert('Erro', response.message || 'Erro ao atualizar perfil de motorista.');
      }
    } catch (error) {
      console.error('Error updating driver profile:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil de motorista. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <LoadingIndicator text="Carregando perfil de motorista..." />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <PageHeader
        title="Editar Perfil de Motorista"
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
          <View style={styles.formContainer}>
            <FormCard
              title="Informações do Motorista"
              icon="person"
              iconColor={COLORS.primary}
            >
              <FormField
                label="Número da CNH"
                value={cnh}
                onChangeText={setCnh}
                placeholder="Informe o número da sua CNH"
                keyboardType="numeric"
              />

              <FormField
                label="WhatsApp"
                value={whatsapp}
                onChangeText={setWhatsapp}
                placeholder="Número com DDD (ex: 31999999999)"
                keyboardType="phone-pad"
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Mostrar WhatsApp para passageiros</Text>
                <Switch
                  value={showWhatsapp}
                  onValueChange={setShowWhatsapp}
                  trackColor={{ false: '#E0E0E0', true: `${COLORS.primary}80` }}
                  thumbColor={showWhatsapp ? COLORS.primary : '#BDBDBD'}
                />
              </View>
            </FormCard>

            <FormCard
              title="Informações do Veículo"
              icon="car"
              iconColor={COLORS.secondary}
            >
              <FormField
                label="Modelo do Carro"
                value={modelo}
                onChangeText={setModelo}
                placeholder="Ex: Ford Ka, Fiat Uno, etc."
              />

              <FormField
                label="Placa"
                value={placa}
                onChangeText={setPlaca}
                placeholder="Ex: ABC1234"
                autoCapitalize="characters"
              />

              <FormField
                label="Cor"
                value={cor}
                onChangeText={setCor}
                placeholder="Ex: Branco, Preto, Prata"
              />

              <View style={styles.capacityContainer}>
                <Text style={styles.capacityLabel}>Capacidade de Passageiros</Text>
                <View style={styles.capacitySelector}>
                  <ActionButton
                    title="-"
                    onPress={() => {
                      const current = parseInt(capacidade, 10);
                      if (current > 1) {
                        setCapacidade((current - 1).toString());
                      }
                    }}
                    style={styles.capacityButton}
                    disabled={parseInt(capacidade, 10) <= 1}
                  />
                  <Text style={styles.capacityValue}>{capacidade}</Text>
                  <ActionButton
                    title="+"
                    onPress={() => {
                      const current = parseInt(capacidade, 10);
                      if (current < 8) {
                        setCapacidade((current + 1).toString());
                      }
                    }}
                    style={styles.capacityButton}
                    disabled={parseInt(capacidade, 10) >= 8}
                  />
                </View>
              </View>
            </FormCard>

            <ActionButton
              title="Atualizar Perfil de Motorista"
              onPress={handleUpdateDriverProfile}
              isLoading={isLoading}
              icon="save-outline"
              style={styles.updateButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: SPACING.lg,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  switchLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  capacityContainer: {
    marginVertical: SPACING.sm,
  },
  capacityLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  capacitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  capacityButton: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
  },
  capacityValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  updateButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  }
});

export default UpdateDriverProfilePage;