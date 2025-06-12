import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';
import { commonStyles } from '../../theme/styles/commonStyles';
import { LoadingIndicator } from '../../components/ui';
import { apiClient } from '../../services/api/apiClient';
import { useAuthContext } from '../../contexts/AuthContext';

const ManagePassengers = ({ navigation, route }) => {
  const { authToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  // Pega os passageiros do objeto ride, se houver
  const { ride } = route.params || {};
  const passengers = ride?.passageiros || [];

  const handleRemovePassenger = (passenger) => {
    Alert.alert(
      'Remover Passageiro',
      `Tem certeza que deseja remover ${passenger.nome || 'este passageiro'} da viagem?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await apiClient.patch(
                `/carona/remover-passageiro/${ride.id}/${passenger.id}`,
                null,
                {
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (response.success) {
                Alert.alert('Sucesso', 'Passageiro removido com sucesso!', [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to refresh the parent screen
                      navigation.goBack();
                    }
                  }
                ]);
              } else {
                Alert.alert('Erro', response.error?.message || 'Não foi possível remover o passageiro.');
              }
            } catch (error) {
              console.error('Error removing passenger:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao remover o passageiro.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderPassengerItem = ({ item }) => (
    console.log('Renderizando passageiro:', item),
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {item.imgUrl ? (
          <Image
            source={{ uri: item?.photoUrl }}
                  style={styles.userImage}
          />
        ) : (
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: COLORS.gray[200],
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <Ionicons name="person" size={28} color={COLORS.text.light} />
          </View>
        )}
        <View>
          <Text style={styles.name}>{item.nome}</Text>
          {item.avaliacaoMedia !== undefined && (
            <Text style={{ color: COLORS.gray[300], fontSize: FONT_SIZE.sm }}>
              Avaliação: {(item.avaliacaoMedia === null || item.avaliacaoMedia === 0.0)
                ? 'N/A ⭐'
                : `${item.avaliacaoMedia.toFixed(1)} ⭐`}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleRemovePassenger(item)} style={styles.removeButton}>
          <Ionicons name="trash-outline" size={20} color={COLORS.text.light} />
          <Text style={styles.removeText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingIndicator text="Carregando..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gerenciar Passageiros</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {passengers.length > 0 ? (
          <FlatList
            data={passengers}
            renderItem={renderPassengerItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.gray[300]} />
            <Text style={styles.emptyText}>Nenhum passageiro</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    height: 150,
    width: '100%',
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: COLORS.background.main,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.md,
  },
  listContainer: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.dark,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  removeButton: {
    backgroundColor: COLORS.danger.main,
    padding: 8,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
   userImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[300],
  },
});

export default ManagePassengers;
