import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Alert,
  Animated,
  Switch,
  StyleSheet,
  Text
} from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';
import { COLORS, SPACING, FONT_SIZE } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';
import { useFadeAnimation } from '../hooks/animations';

// Import reusable components
import FormCard from '../components/form/FormCard';
import FormField from '../components/form/FormField';
import ActionButton from '../components/common/ActionButton';
import PageHeader from '../components/common/PageHeader';

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
  const { user, authToken } = useAuthContext();

  // Use our custom animation hook
  const { animatedStyle } = useFadeAnimation({
    duration: 600
  });

  // Add useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // No need to implement anything here since this is the update page
      // We just want to make sure we're properly passing refresh params to the profile page
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

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

      console.log('Updating driver profile with data:', JSON.stringify(driverData));

      const response = await apiClient.put(
        `/estudante/${user.id}/motorista`,
        driverData,
        options
      );

      if (response.success) {
        console.log('Driver profile updated successfully');
        
        Alert.alert(
          "Sucesso",
          "Perfil de motorista atualizado com sucesso!",
          [
            {
              text: "OK",
              onPress: () => {
                // Fix: Navigate to TabNavigator first, then to Profile tab
                navigation.navigate('TabNavigator', {
                  screen: 'Profile',
                  params: { 
                    refresh: Date.now(),
                    driverUpdated: true
                  }
                });
              }
            }
          ]
        );
      } else {
        console.error("Error updating driver profile:", response.error);
        Alert.alert(
          "Erro",
          response.error?.message || "Não foi possível atualizar o perfil de motorista."
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil de motorista:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao atualizar o perfil de motorista. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <PageHeader
        title="Atualizar Perfil de Motorista"
        onBack={() => navigation.goBack()}
      />

      <Animated.ScrollView
        style={[{ flex: 1, marginTop: -50 }, animatedStyle]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <FormCard title="Informações do Motorista" icon="person-circle" iconColor={COLORS.primary}>
            <FormField
              label="Número da CNH"
              value={cnh}
              onChangeText={setCnh}
              placeholder="Ex: 12345678901"
              keyboardType="number-pad"
              maxLength={15}
            />

            <FormField
              label="WhatsApp (opcional)"
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
                trackColor={{ false: "#767577", true: COLORS.primaryLight }}
                thumbColor={showWhatsapp ? COLORS.primary : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          </FormCard>

          <FormCard title="Informações do Veículo" icon="car" iconColor={COLORS.success}>
            <FormField
              label="Modelo do Carro"
              value={modelo}
              onChangeText={setModelo}
              placeholder="Ex: Gol 1.0"
            />

            <FormField
              label="Placa"
              value={placa}
              onChangeText={text => setPlaca(text.toUpperCase())}
              placeholder="Ex: ABC1234"
              autoCapitalize="characters"
              maxLength={10}
            />

            <FormField
              label="Cor"
              value={cor}
              onChangeText={setCor}
              placeholder="Ex: Prata"
            />

            <FormField
              label="Capacidade de Passageiros"
              value={capacidade}
              onChangeText={setCapacidade}
              placeholder="Ex: 4"
              keyboardType="number-pad"
              maxLength={1}
            />
          </FormCard>

          <ActionButton
            title="Salvar Alterações"
            onPress={handleSubmit}
            isLoading={isLoading}
            icon="save-outline"
            style={styles.submitButton}
          />

          <ActionButton
            title="Cancelar"
            onPress={() => navigation.goBack()}
            type="secondary"
            icon="close-outline"
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  switchLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    flex: 1,
    marginRight: SPACING.md,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    marginTop: SPACING.md,
  }
});

export default UpdateDriverProfilePage;