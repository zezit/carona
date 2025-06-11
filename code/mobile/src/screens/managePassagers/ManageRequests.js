import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants';
import { apiClient } from '../../services/api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../../contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function ManageRequests({ navigation, route }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { ride } = route.params || {};
  const {authToken} = useAuthContext();

  const fetchRequests = async (pageNumber = 0, shouldRefresh = false) => {
    try {
      const motoristaId = ride.motorista.id;
      const caronaId = ride.id;
      
      if (!motoristaId || !caronaId) {
        Alert.alert('Erro', 'Dados da carona ou motorista incompletos.');
        setLoading(false);
        return;
      }

      const response = await apiClient.get(
        `/pedidos/motorista/${motoristaId}/carona/${caronaId}?page=${pageNumber}&size=${ITEMS_PER_PAGE}`
      );

      const newRequests = response.data.content || [];
      setHasMore(!response.data.last);
      
      if (shouldRefresh) {
        setRequests(newRequests);
        setPage(0);
      } else {
        setRequests(prev => [...prev, ...newRequests]);
      }

    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as solicitações');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests(0, true);
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRequests(nextPage);
    }
  }, [loadingMore, hasMore, page]);

  const handleRequestAction = async (id, action) => {
    try {
      const options = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
      // Use o novo endpoint com query parameter
      const response = await apiClient.put(`/pedidos/${id}/status/${action}`, null, options);
      
      // Atualizar a lista removendo o pedido processado
      setRequests(prev => prev.filter(req => req.id !== id));
      
      // Mostrar mensagem de sucesso com detalhes
      const actionText = action === 'APROVADO' ? 'aprovada' : 'recusada';
      Alert.alert(
        'Sucesso',
        `Solicitação ${actionText} com sucesso!`,
        [{ text: 'OK' }]
      );
      
      // Log do sucesso para depuração
      console.log(`Solicitação ${id} ${actionText} com sucesso:`, response.data);
      
    } catch (error) {
      // Log detalhado do erro
      console.error(`Erro ao processar solicitação ${id}:`, error);
      
      // Mostrar mensagem de erro específica quando possível
      const errorMessage = error.response?.data?.message || 
        `Não foi possível ${action === 'APROVADO' ? 'aprovar' : 'recusar'} a solicitação.`;
      
      Alert.alert('Erro', errorMessage, [{ text: 'OK' }]);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Data inválida';
    
    try {
      if (Array.isArray(date)) {
        const [ano, mes, dia, hora = 0, minuto = 0, segundo = 0] = date;
        return format(new Date(ano, mes - 1, dia, hora, minuto, segundo), 'dd/MM/yyyy HH:mm');
      } else if (typeof date === 'string') {
        return format(new Date(date), 'dd/MM/yyyy HH:mm');
      }
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const renderRequestCard = useCallback(({ id, solicitacao, carona }) => {
    const partidaFormatada = formatDate(carona.dataHoraPartida);
    const chegadaFormatada = formatDate(solicitacao.horarioChegada);

    return (
      <TouchableOpacity 
        key={id} 
        style={styles.card}
        onPress={() => navigation.navigate('RequestDetailsScreen', { 
          request: { id, solicitacao, carona }, 
          ride 
        })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardRow}>
            <Ionicons name="person-circle-outline" size={24} color={COLORS.text.dark} />
            <Text style={styles.cardTitle} numberOfLines={1}>
              {solicitacao.nomeEstudante || ""}
            </Text>
          </View>
          {solicitacao.avaliacaoMedia && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={COLORS.warning.main} />
              <Text style={styles.ratingText}>
                {solicitacao.avaliacaoMedia.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={20} color={COLORS.text.dark} />
          <Text style={styles.cardText} numberOfLines={2}>
            <Text style={styles.cardLabel}>Origem: </Text>
            {solicitacao.origem || ""}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons name="flag-outline" size={20} color={COLORS.text.dark} />
          <Text style={styles.cardText} numberOfLines={2}>
            <Text style={styles.cardLabel}>Destino: </Text>
            {solicitacao.destino || ""}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.cardRow}>
            <Ionicons name="time-outline" size={20} color={COLORS.text.dark} />
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Chegada: </Text>
              {chegadaFormatada || ""}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.text.dark} />
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Partida: </Text>
              {partidaFormatada || ""}
            </Text>
          </View>
        </View>

        {/* Quick action buttons */}
        {/* <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleRequestAction(id, 'APROVADO');
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.text.light} />
            <Text style={styles.actionText}>Aprovar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleRequestAction(id, 'REJEITADO');
            }}
          >
            <Ionicons name="close-circle-outline" size={20} color={COLORS.text.light} />
            <Text style={styles.actionText}>Recusar</Text>
          </TouchableOpacity>
        </View> */}

        {/* Tap to view details indicator */}
        <View style={styles.tapIndicator}>
          <Text style={styles.tapIndicatorText}>Toque para ver detalhes da rota</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.text.medium} />
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.main }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary.main} />
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitações Pendentes</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary.main]}
              tintColor={COLORS.primary.main}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 50;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
              contentSize.height - paddingToBottom;
            
            if (isCloseToBottom) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {requests && requests.length > 0 ? requests.map((request, index) => 
            request ? renderRequestCard(request) : null
          ) : null}

          {loadingMore && hasMore && (
            <ActivityIndicator 
              style={styles.loadingMore} 
              size="small" 
              color={COLORS.primary.main} 
            />
          )}

          {!loading && (!requests || requests.length === 0) && (
            <View style={styles.emptyContainer}>
              <Ionicons name="information-circle-outline" size={48} color={COLORS.text.medium} />
              <Text style={styles.emptyText}>Nenhuma solicitação pendente</Text>
            </View>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.background.main,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.dark,
    marginLeft: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning.light,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  ratingText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.warning.dark,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  cardText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.dark,
    flex: 1,
    flexWrap: 'wrap',
  },
  cardLabel: {
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.medium,
  },
  timeContainer: {
    gap: SPACING.xs,
    backgroundColor: COLORS.background.light,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    minWidth: 100,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: COLORS.success.main,
  },
  rejectButton: {
    backgroundColor: COLORS.danger.main,
  },
  actionText: {
    color: COLORS.text.light,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: FONT_SIZE.sm,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.light,
  },
  tapIndicatorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.medium,
    fontStyle: 'italic',
    marginRight: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.md,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    color: COLORS.text.medium,
  },
  loadingMore: {
    paddingVertical: SPACING.lg,
  }
});

