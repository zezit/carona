import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationFilter from '../../components/notifications/NotificationFilter';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { apiClient } from '../../services/api/apiClient';

const NotificationItem = ({ notification, onPress }) => {
  const scaleValue = new Animated.Value(1);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'RIDE_MATCH_REQUEST':
        return {
          name: 'car-sport',
          color: COLORS.primary.main,
          backgroundColor: COLORS.primary.main + '15'
        };
      case 'RIDE_REQUEST_ACCEPTED':
        return {
          name: 'checkmark-circle',
          color: COLORS.success.main,
          backgroundColor: COLORS.success.main + '15'
        };
      case 'RIDE_REQUEST_REJECTED':
        return {
          name: 'close-circle',
          color: COLORS.danger,
          backgroundColor: COLORS.danger + '15'
        };
      case 'RIDE_CANCELLED':
        return {
          name: 'ban',
          color: COLORS.warning.main,
          backgroundColor: COLORS.warning.main + '15'
        };
      case 'RIDE_STARTED':
        return {
          name: 'play-circle',
          color: COLORS.success.main,
          backgroundColor: COLORS.success.main + '15'
        };
      case 'RIDE_REMINDER':
        return {
          name: 'time',
          color: COLORS.secondary.main,
          backgroundColor: COLORS.secondary.main + '15'
        };
      case 'SYSTEM':
        return {
          name: 'notifications',
          color: COLORS.primary.main,
          backgroundColor: COLORS.primary.main + '15'
        };
      default:
        return {
          name: 'mail',
          color: COLORS.text.secondary,
          backgroundColor: COLORS.text.secondary + '15'
        };
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'RIDE_MATCH_REQUEST':
        return 'Nova Solicitação de Carona';
      case 'RIDE_REQUEST_ACCEPTED':
        return 'Solicitação Aceita';
      case 'RIDE_REQUEST_REJECTED':
        return 'Solicitação Rejeitada';
      case 'RIDE_CANCELLED':
        return 'Carona Cancelada';
      case 'RIDE_STARTED':
        return 'Carona Iniciada';
      case 'RIDE_REMINDER':
        return 'Lembrete de Carona';
      case 'SYSTEM':
        return 'Notificação do Sistema';
      default:
        return 'Notificação';
    }
  };

  const formatTimestamp = (notification) => {
    // Use backend-provided relativeTime if available, otherwise fall back to createdAt
    return notification.relativeTime || notification.createdAt || 'Agora';
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const renderNotificationContent = () => {
    let payloadData = notification.payload;
    if (typeof notification.payload === 'string') {
      try {
        payloadData = JSON.parse(notification.payload);
      } catch (e) {
        payloadData = {};
      }
    }
    
    const passengerName = notification.recipient?.nome || 
                           payloadData?.estudante?.nome || 
                           payloadData?.passageiro?.nome || 
                           'Usuário';
    
    switch(notification.type) {
      case 'RIDE_MATCH_REQUEST':
        return (
          <View style={styles.contentBody}>
            <Text style={styles.description}>
              {passengerName} solicitou uma carona
            </Text>
            {(payloadData.origem || payloadData.destino) && (
              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="radio-button-on" 
                    size={12} 
                    color={COLORS.primary.main} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.origem || 'Origem não especificada'}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="location" 
                    size={12} 
                    color={COLORS.danger} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.destino || 'Destino não especificado'}
                  </Text>
                </View>
              </View>
            )}
            {payloadData.horario && (
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color={COLORS.text.secondary} />
                <Text style={styles.timeText}>{payloadData.horario}</Text>
              </View>
            )}
          </View>
        );
        
      case 'RIDE_REQUEST_ACCEPTED':
        return (
          <View style={styles.contentBody}>
            <Text style={styles.description}>
              Sua solicitação de carona foi aceita!
            </Text>
            {(payloadData.origem || payloadData.destino) && (
              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="radio-button-on" 
                    size={12} 
                    color={COLORS.primary.main} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.origem || 'Origem'}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="location" 
                    size={12} 
                    color={COLORS.danger} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.destino || 'Destino'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
        
      case 'RIDE_REQUEST_REJECTED':
        return (
          <View style={styles.contentBody}>
            <Text style={styles.description}>
              Sua solicitação de carona foi rejeitada
            </Text>
            {(payloadData.origem || payloadData.destino) && (
              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="radio-button-on" 
                    size={12} 
                    color={COLORS.primary.main} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.origem || 'Origem'}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="location" 
                    size={12} 
                    color={COLORS.danger} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.destino || 'Destino'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
        
      case 'RIDE_CANCELLED':
        return (
          <View style={styles.contentBody}>
            <Text style={styles.description}>
              Uma carona foi cancelada
            </Text>
            {(payloadData.origem || payloadData.destino) && (
              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="radio-button-on" 
                    size={12} 
                    color={COLORS.primary.main} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.origem || 'Origem'}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="location" 
                    size={12} 
                    color={COLORS.danger} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.destino || 'Destino'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
        
      case 'RIDE_REMINDER':
        return (
          <View style={styles.contentBody}>
            <Text style={styles.description}>
              Lembrete: Sua carona está próxima
            </Text>
            {payloadData.horario && (
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color={COLORS.text.secondary} />
                <Text style={styles.timeText}>{payloadData.horario}</Text>
              </View>
            )}
          </View>
        );
        
      case 'RIDE_STARTED':
        return (
          <View style={styles.contentBody}>
            <Text style={styles.description}>
              Sua carona foi iniciada pelo motorista
            </Text>
            {(payloadData.origem || payloadData.destino) && (
              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="radio-button-on" 
                    size={12} 
                    color={COLORS.primary.main} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.origem || 'Origem'}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeItem}>
                  <Ionicons 
                    name="location" 
                    size={12} 
                    color={COLORS.danger} 
                    style={styles.routeIcon}
                  />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {payloadData.destino || 'Destino'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
        
      case 'SYSTEM':
        return (
          <View style={styles.contentBody}>
            <Text style={styles.description}>
              {payloadData.message || notification.message || 'Mensagem do sistema'}
            </Text>
          </View>
        );
        
      default:
        const message = payloadData?.message || payloadData?.texto || 'Notificação';
        return (
          <View style={styles.contentBody}>
            <Text style={styles.description}>{message}</Text>
          </View>
        );
    }
  };

  const iconData = getNotificationIcon(notification.type);
  const isUnread = notification.status !== 'RECONHECIDO';

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={[
          styles.notificationCard,
          isUnread && styles.unreadCard
        ]}
        onPress={() => onPress(notification)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconData.backgroundColor }]}>
          <Ionicons 
            name={iconData.name} 
            size={24} 
            color={iconData.color} 
          />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {getNotificationTitle(notification.type)}
            </Text>
            <View style={styles.timestampContainer}>
              {isUnread && <View style={styles.unreadDot} />}
              <Text style={styles.timestamp}>
                {formatTimestamp(notification)}
              </Text>
            </View>
          </View>
          
          {renderNotificationContent()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const NotificationsScreen = () => {
  const { notifications, markAsRead, fetchUnreadCount, setAllNotifications, appendNotifications } = useNotification();
  const { user, authToken } = useAuthContext();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    statuses: ['ENVIADO']
  });
  const PAGE_SIZE = 20;

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchNotifications(true);
  }, [filters]);

  const fetchNotifications = async (refresh = false) => {
    if (loading || (!hasMore && !refresh) || !user?.id) return;

    try {
      setLoading(true);
      const currentPage = refresh ? 0 : page;
      
      // Build params object with filters
      const params = {
        userId: user.id,
        page: currentPage,
        size: PAGE_SIZE,
      };
      
      // Add type filters if any are selected
      if (filters.types && filters.types.length > 0) {
        params.types = filters.types;
      }
      
      // Add status filters if any are selected
      if (filters.statuses && filters.statuses.length > 0) {
        params.statuses = filters.statuses;
      }
      
      const response = await apiClient.get(`/notificacoes`, {
        params: params,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        paramsSerializer: params => {
          // This is needed for arrays of enum parameters to be properly serialized
          return Object.entries(params)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
              }
              return `${key}=${encodeURIComponent(value)}`;
            })
            .join('&');
        }
      });

      if (response.data) {
        const notificationsData = response.data.content || response.data;
        setHasMore((notificationsData.length === PAGE_SIZE) && (page < response.data.totalPages - 1));
        
        if (refresh) {
          setPage(1);
          setAllNotifications(notificationsData);
        } else {
          setPage(currentPage + 1);
          appendNotifications(notificationsData);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get filtered notifications - now filtering is handled by the backend
  const getFilteredNotifications = () => {
    // Just return the current notifications since they're already filtered on the backend
    return notifications;
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Reset pagination when applying new filters
    setPage(0);
    setHasMore(true);
    // Fetch will be triggered by the useEffect that watches filters
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
    fetchUnreadCount();
  };

  const handleNotificationPress = async (notification) => {
    if (notification.status !== 'RECONHECIDO') {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Parse payload data once for all notification types
    let payloadData = notification.payload;
    if (typeof notification.payload === 'string') {
      try {
        payloadData = JSON.parse(notification.payload);
      } catch (e) {
        console.log('Failed to parse notification payload:', e);
        payloadData = {};
      }
    } else if (!payloadData) {
      payloadData = {};
    }

    // Handle different notification types
    switch (notification.type) {
      case 'RIDE_MATCH_REQUEST':
        // Navigate to ride request details or handle accordingly
        if (payloadData && payloadData.caronaId) {
          console.log('Navigate to ride details:', payloadData.caronaId);
          navigation.navigate('ScheduledRides', { 
            initialTab: 'details',
            rideId: payloadData.caronaId 
          });
        } else if (payloadData && payloadData.solicitacaoId) {
          console.log('Navigate to ride request:', payloadData.solicitacaoId);
          navigation.navigate('FindRides', { 
            requestId: payloadData.solicitacaoId,
            showRequestDetails: true
          });
        } else {
          Alert.alert(
            "Informação Incompleta",
            "Não foi possível encontrar os detalhes desta carona. Tente acessá-la pela tela de caronas.",
            [{ text: "OK" }]
          );
          console.log('Missing ride or request ID in notification payload');
        }
        break;
      case 'RIDE_REQUEST_ACCEPTED':
      case 'RIDE_REQUEST_REJECTED':
      case 'RIDE_CANCELLED':
      case 'RIDE_STARTED':
      case 'RIDE_REMINDER':
        // Navigate to the Rides tab to show user's rides
        navigation.navigate('TabNavigator', {
          screen: 'Rides'
        });
        break;
        
      default:
        // For system or other notifications, just mark as read
        console.log('Notification of type handled:', notification.type);
    }
  };

  const onEndReached = () => {
    if (!loading && hasMore) {
      fetchNotifications();
    }
  };

  // Function to group notifications by date - simplified since backend now provides formatted dates
  const getSectionTitle = (dateString) => {
    if (!dateString) return 'Data desconhecida';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Data inválida';
    }
  };
  
  // Prepare data for section list - simplified since backend provides proper date formatting
  const prepareNotificationsData = () => {
    const filteredNotifications = getFilteredNotifications();
    console.log('DEBUG: Preparing data for', filteredNotifications.length, 'notifications');
    
    const groupedNotifications = {};
    
    filteredNotifications.forEach(notification => {
      const dateString = notification.createdAt;
      if (!dateString) {
        console.log('DEBUG: Notification without createdAt:', notification.id);
        return;
      }
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date for notification:', notification.id, dateString);
          return;
        }
        
        const dateStr = date.toDateString();
        
        if (!groupedNotifications[dateStr]) {
          groupedNotifications[dateStr] = {
            title: getSectionTitle(dateString),
            data: []
          };
        }
        
        groupedNotifications[dateStr].data.push(notification);
      } catch (error) {
        console.error('Error processing notification date:', error, notification.id);
      }
    });
    
    // Convert to array and sort by date (newest first)
    const result = Object.values(groupedNotifications)
      .sort((a, b) => {
        const dateA = new Date(a.data[0].createdAt);
        const dateB = new Date(b.data[0].createdAt);
        return dateB - dateA;
      });
    
    console.log('DEBUG: Prepared sections:', result.length);
    console.log('DEBUG: Section data:', result.map(s => ({ title: s.title, count: s.data.length })));
    return result;
  };
  
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionCount}>
        {section.data.length} {section.data.length === 1 ? 'notificação' : 'notificações'}
      </Text>
    </View>
  );

  const renderEmptyState = () => {
    const hasActiveFilters = filters.types.length > 0 || filters.statuses.length > 0;
    
    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons 
            name={hasActiveFilters ? "filter-outline" : "notifications-outline"} 
            size={64} 
            color={COLORS.text.tertiary} 
          />
        </View>
        <Text style={styles.emptyTitle}>
          {hasActiveFilters ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasActiveFilters 
            ? 'Tente ajustar os filtros para ver mais notificações'
            : 'Você receberá notificações sobre suas caronas aqui'
          }
        </Text>
        
        {hasActiveFilters ? (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => setFilters({ types: [], statuses: ['PENDENTE', 'ENVIADO', 'FALHOU'] })}
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary.main} />
            <Text style={styles.refreshButtonText}>Restaurar Filtros</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary.main} />
            <Text style={styles.refreshButtonText}>Atualizar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const sectionedNotifications = prepareNotificationsData();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Ionicons 
              name="notifications" 
              size={28} 
              color={COLORS.text.light} 
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>Notificações</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilter(true)}
            >
              <Ionicons 
                name="filter" 
                size={24} 
                color={COLORS.text.light} 
              />
              {/* Indicate if custom filters are active */}
              {(filters.types.length > 0 || 
                (filters.statuses.length > 0 && 
                 !(filters.statuses.length === 3 && 
                   filters.statuses.includes('PENDENTE') && 
                   filters.statuses.includes('ENVIADO')))) && (
                <View style={styles.filterActiveDot} />
              )}
            </TouchableOpacity>
            {getFilteredNotifications().filter(n => n.status !== 'RECONHECIDO').length > 0 && (
              <View style={styles.unreadCountContainer}>
                <Text style={styles.unreadCountText}>
                  {getFilteredNotifications().filter(n => n.status !== 'RECONHECIDO').length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {/* Filter Status Indicator */}
        {(filters.types.length > 0 || 
          (filters.statuses.length > 0 && 
           !(filters.statuses.length === 3 && 
             filters.statuses.includes('PENDENTE') && 
             filters.statuses.includes('ENVIADO') && 
             filters.statuses.includes('FALHOU')))) && (
          <View style={styles.filterStatusContainer}>
            <View style={styles.filterStatusLeft}>
              <Ionicons name="filter" size={16} color={COLORS.primary.main} />
              <Text style={styles.filterStatusText}>
                Filtros personalizados ativos: {getFilteredNotifications().length} notificações
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setFilters({ types: [], statuses: ['PENDENTE', 'ENVIADO', 'FALHOU'] })}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Restaurar</Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionList
          sections={sectionedNotifications}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={handleNotificationPress}
            />
          )}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id?.toString() || String(item.timestamp || Math.random())}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[COLORS.primary.main]}
              tintColor={COLORS.primary.main}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={[
            styles.listContainer,
            sectionedNotifications.length === 0 && { flex: 1 }
          ]}
          ListEmptyComponent={renderEmptyState()}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={Platform.OS === 'ios'}
        />
      </View>

      <NotificationFilter
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  header: {
    height: 120,
    paddingTop: Platform.OS === 'ios' ? SPACING.md : SPACING.lg,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.light,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterButton: {
    position: 'relative',
    padding: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning.main,
  },
  unreadCountContainer: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.round,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  unreadCountText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  contentContainer: {
    flex: 1,
    marginTop: -30,
    backgroundColor: COLORS.background.main,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  filterStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary.main + '10',
    borderWidth: 1,
    borderColor: COLORS.primary.main + '30',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  filterStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterStatusText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: SPACING.xs,
  },
  clearFiltersButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  clearFiltersText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHT.semibold,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionHeader: {
    backgroundColor: COLORS.background.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeaderText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    fontWeight: FONT_WEIGHT.medium,
  },
  notificationCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border.main,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
    backgroundColor: COLORS.background.card,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary.main,
    marginRight: SPACING.xs,
  },
  timestamp: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    fontWeight: FONT_WEIGHT.medium,
  },
  contentBody: {
    marginTop: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  routeContainer: {
    backgroundColor: COLORS.background.main,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  routeIcon: {
    marginRight: SPACING.xs,
    width: 16,
    textAlign: 'center',
  },
  routeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 8,
    backgroundColor: COLORS.border.main,
    marginLeft: 6,
    marginVertical: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.main,
  },
  timeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  refreshButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary.main,
    marginLeft: SPACING.xs,
  },
});

export default NotificationsScreen;
