import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { parseApiDate, formatDate, formatTime } from '../../utils/dateUtils';

/**
 * A reusable card component for displaying ride information
 */
const RideCard = ({ 
  item, 
  onPress,
  compact = false
}) => {
  // Use our enhanced date utilities
  const formatCardDate = useCallback((dateString) => {
    return formatDate(dateString);
  }, []);

  const formatCardTime = useCallback((dateString) => {
    return formatTime(dateString);
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.date}>
          {formatCardDate(item.dataHoraPartida)}
        </Text>
        <Text style={styles.time}>
          {formatCardTime(item.dataHoraPartida)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoContainer}>
        <View style={styles.locationInfo}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={16} color="#4285F4" />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pontoPartida}
          </Text>
        </View>
        <View style={styles.locationInfo}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={16} color="#34A853" />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pontoDestino}
          </Text>
        </View>
      </View>

      {!compact && (
        <>
          <View style={styles.divider} />

          <View style={styles.footer}>
            <View style={styles.seats}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={styles.seatsText}>
                {item.vagasDisponiveis} vagas disponíveis
              </Text>
            </View>
            <StatusBadge status={item.status} size="small" />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e1e1',
    marginVertical: 10,
  },
  infoContainer: {
    marginVertical: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIconContainer: {
    width: 24,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  seats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default React.memo(RideCard);