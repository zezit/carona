import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { apiClient } from '../../services/api/apiClient';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants';
import { commonStyles } from '../../theme/styles/commonStyles';

export default function ManageRequests({navigation, route}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
   const { ride } = route.params || {};

  const fetchRequests = async () => {
    try {
      const motoristaId = ride.motorista.id; 
      const response = await apiClient.get(`/pedidos/motorista/${motoristaId}`);
      console.log('Solicitações recebidas:', response.data);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as solicitações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

const handleRequestAction = async (id, action) => {
    try {
        await apiClient.post(`/pedidos/aprovarCarona/${id}/${action}`);
        setRequests(prev => prev.filter(req => req.id !== id));
        Alert.alert(
            'Sucesso',
            `Solicitação ${action === 'APROVAR' ? 'aprovada' : 'recusada'} com sucesso!`
        );
    } catch (error) {
        Alert.alert('Erro', `Não foi possível ${action === 'APROVAR' ? 'aprovar' : 'recusar'} a solicitação.`);
    }
};

  const formatDate = (dataArray) => {
    if (!Array.isArray(dataArray)) return 'Data indisponível';
    const [ano, mes, dia, hora = 0, minuto = 0, segundo = 0] = dataArray;
    return format(new Date(ano, mes - 1, dia, hora, minuto, segundo), 'dd/MM/yyyy HH:mm');
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.5 }}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Caronas Agendadas</Text>
                <View style={{width: 24}} />
              </View>
            </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {requests.filter(req => req.carona && req.solicitacao).map((req) => {
            const { id, solicitacao, carona } = req;
            const partidaFormatada = formatDate(carona.dataHoraPartida);

            return (
              <View key={id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Ionicons name="person" size={18} color={COLORS.secondary} />
                  <Text style={styles.cardText}>{solicitacao.nomeEstudante}</Text>
                  <Text style={styles.cardText}>
                    {' - Avaliação: '}
                    {solicitacao.avaliacaoMedia !== null ? solicitacao.avaliacaoMedia : 'N/A'}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Ionicons name="location" size={18} color={COLORS.secondary} />
                  <Text style={styles.cardText}>Origem: {solicitacao.origem}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Ionicons name="flag" size={18} color={COLORS.secondary} />
                  <Text style={styles.cardText}>Destino: {carona.pontoDestino}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Ionicons name="calendar" size={18} color={COLORS.secondary} />
                  <Text style={styles.cardText}>Partida: {partidaFormatada}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleRequestAction(id, 'APROVAR')}
                  >
                    <Ionicons name="checkmark" size={18} color={COLORS.text.light} />
                    <Text style={styles.actionText}>Aprovar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRequestAction(id, 'REPROVAR')}
                  >
                    <Ionicons name="close" size={18} color={COLORS.text.light} />
                    <Text style={styles.actionText}>Recusar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {!loading && requests.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma solicitação pendente.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.dark,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  actionText: {
    color: COLORS.text.light,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: FONT_SIZE.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.medium,
  },
});

