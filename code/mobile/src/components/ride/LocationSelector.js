import React from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants';

/**
 * LocationSelector - A reusable component for displaying and editing ride locations
 */
const LocationSelector = ({
  departure,
  arrival,
  onPress,
  style,
  compact = false
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        <View style={styles.locationIcons}>
          <View style={[styles.locationIcon, styles.departureIcon]}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.locationConnector} />
          <View style={[styles.locationIcon, styles.arrivalIcon]}>
            <Ionicons name="navigate" size={14} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.locationTexts}>
          <Text numberOfLines={1} style={styles.locationText}>
            {departure || 'Selecionar partida'}
          </Text>
          <Text numberOfLines={1} style={styles.locationText}>
            {arrival || 'Selecionar destino'}
          </Text>
        </View>
        <View style={styles.editIcon}>
          <Ionicons name="pencil" size={16} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcons: {
    width: 24,
    alignItems: 'center',
    marginRight: 6,
  },
  locationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  departureIcon: {
    backgroundColor: COLORS.primary,
  },
  arrivalIcon: {
    backgroundColor: COLORS.secondary,
  },
  locationConnector: {
    width: 2,
    height: 10,
    backgroundColor: COLORS.border,
    marginVertical: 1,
  },
  locationTexts: {
    flex: 1,
    height: '90%',
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 13,
    color: COLORS.text.primary,
    marginVertical: 1,
    textAlign: 'left',
    paddingVertical: 2,
    flexShrink: 1,
  },
  editIcon: {
    padding: 4,
  },
});

export default React.memo(LocationSelector);