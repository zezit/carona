import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { getReceivedRatings, getGivenRatings } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';

// Import reusable components
import { PageHeader } from '../components/common';
import { LoadingIndicator, ErrorState } from '../components/ui';
import StarRating from '../components/common/StarRating';

const RatingHistoryPage = ({ navigation }) => {
  const { user, authToken } = useAuthContext();
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'given'
  const [receivedRatings, setReceivedRatings] = useState([]);
  const [givenRatings, setGivenRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreReceived, setHasMoreReceived] = useState(true);
  const [hasMoreGiven, setHasMoreGiven] = useState(true);
  const [pageReceived, setPageReceived] = useState(0);
  const [pageGiven, setPageGiven] = useState(0);

  // Fetch received ratings
  const fetchReceivedRatings = useCallback(async (page = 0, append = false) => {
    if (!user?.id || !authToken) return;

    try {
      const response = await getReceivedRatings(user.id, authToken, page, 20);
      
      if (response.success) {
        const newRatings = response.data.content || [];
        if (append) {
          setReceivedRatings(prev => [...prev, ...newRatings]);
        } else {
          setReceivedRatings(newRatings);
        }
        setHasMoreReceived(!response.data.last);
        setPageReceived(page);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Error fetching received ratings:', err);
      if (!append) {
        setError('Erro ao carregar avaliações recebidas');
      }
    }
  }, [user?.id, authToken]);

  // Fetch given ratings
  const fetchGivenRatings = useCallback(async (page = 0, append = false) => {
    if (!user?.id || !authToken) return;

    try {
      const response = await getGivenRatings(user.id, authToken, page, 20);
      
      if (response.success) {
        const newRatings = response.data.content || [];
        if (append) {
          setGivenRatings(prev => [...prev, ...newRatings]);
        } else {
          setGivenRatings(newRatings);
        }
        setHasMoreGiven(!response.data.last);
        setPageGiven(page);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Error fetching given ratings:', err);
      if (!append) {
        setError('Erro ao carregar avaliações realizadas');
      }
    }
  }, [user?.id, authToken]);

  // Initial data fetch
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchReceivedRatings(0),
        fetchGivenRatings(0)
      ]);
    } catch (err) {
      console.error('Error fetching rating data:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [fetchReceivedRatings, fetchGivenRatings]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Load more data
  const loadMoreReceived = useCallback(() => {
    if (hasMoreReceived && !loading) {
      fetchReceivedRatings(pageReceived + 1, true);
    }
  }, [hasMoreReceived, loading, pageReceived, fetchReceivedRatings]);

  const loadMoreGiven = useCallback(() => {
    if (hasMoreGiven && !loading) {
      fetchGivenRatings(pageGiven + 1, true);
    }
  }, [hasMoreGiven, loading, pageGiven, fetchGivenRatings]);

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Format date
  const formatDate = (dateArray) => {
    try {
      if (!dateArray || !Array.isArray(dateArray)) return 'Data não disponível';
      const [ano, mes, dia, hora, minuto] = dateArray;
      return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano} às ${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
    } catch (error) {
      return 'Data não disponível';
    }
  };

  // Render rating item
  const renderRatingItem = ({ item, index }) => {
    const isReceived = activeTab === 'received';
    const otherUser = isReceived ? item.avaliador : item.avaliado;
    
    return (
      <View style={styles.ratingCard} key={`${activeTab}-${item.id}-${index}`}>
        <View style={styles.ratingHeader}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle-outline" size={40} color={COLORS.text.secondary} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{otherUser?.nome || 'Usuário não identificado'}</Text>
              <Text style={styles.ratingDate}>{formatDate(item.dataHora)}</Text>
            </View>
          </View>
          <StarRating rating={item.nota} size={18} showValue={true} />
        </View>
        
        {item.comentario && (
          <View style={styles.commentContainer}>
            <Text style={styles.commentText}>"{item.comentario}"</Text>
          </View>
        )}
        
        <View style={styles.ratingFooter}>
          <Text style={styles.ratingType}>
            {isReceived ? 'Avaliação recebida' : 'Avaliação enviada'}
          </Text>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const isReceived = activeTab === 'received';
    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={isReceived ? "star-outline" : "create-outline"} 
          size={64} 
          color={COLORS.text.secondary} 
        />
        <Text style={styles.emptyTitle}>
          {isReceived ? 'Nenhuma avaliação recebida' : 'Nenhuma avaliação enviada'}
        </Text>
        <Text style={styles.emptyDescription}>
          {isReceived 
            ? 'Você ainda não recebeu avaliações de outros usuários.' 
            : 'Você ainda não avaliou outros usuários.'
          }
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <PageHeader
          title="Histórico de Avaliações"
          onBack={() => navigation.goBack()}
        />
        <View style={[commonStyles.container, commonStyles.centered]}>
          <LoadingIndicator text="Carregando histórico..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <PageHeader
          title="Histórico de Avaliações"
          onBack={() => navigation.goBack()}
        />
        <ErrorState 
          errorMessage={error} 
          onRetry={fetchData} 
        />
      </SafeAreaView>
    );
  }

  const currentData = activeTab === 'received' ? receivedRatings : givenRatings;
  const hasMore = activeTab === 'received' ? hasMoreReceived : hasMoreGiven;
  const loadMore = activeTab === 'received' ? loadMoreReceived : loadMoreGiven;

  return (
    <SafeAreaView style={commonStyles.container}>
      <PageHeader
        title="Histórico de Avaliações"
        onBack={() => navigation.goBack()}
      />

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'received' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('received')}
        >
          <Ionicons 
            name="star" 
            size={20} 
            color={activeTab === 'received' ? COLORS.text.light : COLORS.text.secondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'received' && styles.activeTabText
          ]}>
            Recebidas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'given' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('given')}
        >
          <Ionicons 
            name="create" 
            size={20} 
            color={activeTab === 'given' ? COLORS.text.light : COLORS.text.secondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'given' && styles.activeTabText
          ]}>
            Enviadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating List */}
      <FlatList
        data={currentData}
        renderItem={renderRatingItem}
        keyExtractor={(item, index) => `${activeTab}-${item.id}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary.main]}
            tintColor={COLORS.primary.main}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={() => {
          if (hasMore && currentData.length > 0) {
            return (
              <View style={styles.loadingMore}>
                <LoadingIndicator size="small" text="Carregando mais..." />
              </View>
            );
          }
          return null;
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background.main,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary.main,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  activeTabText: {
    color: COLORS.text.light,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  ratingCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  ratingDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  commentContainer: {
    backgroundColor: COLORS.background.main,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  commentText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.primary,
    fontStyle: 'italic',
  },
  ratingFooter: {
    alignItems: 'flex-end',
  },
  ratingType: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    fontWeight: FONT_WEIGHT.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingMore: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
});

export default RatingHistoryPage;
