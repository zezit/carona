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
  compact = false,
  testID
}) => {
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        <View testID="departure-arrival-icons" style={styles.locationIcons}>
          <View testID="departure-icon" style={[styles.locationIcon, styles.departureIcon]}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.locationConnector} />
          <View testID="arrival-icon" style={[styles.locationIcon, styles.arrivalIcon]}>
            <Ionicons name="navigate" size={14} color="#FFFFFF" />
          </View>
        </View>

        <View testID="location-texts" style={styles.locationTexts}>
          <Text testID="departure-text" numberOfLines={1} style={styles.locationText}>
            {departure || 'Selecionar partida'}
          </Text>
          <Text testID="arrival-text" numberOfLines={1} style={styles.locationText}>
            {arrival || 'Selecionar destino'}
          </Text>
        </View>
        <View testID="edit-icon" style={styles.editIcon}>
          <Ionicons name="pencil" size={16} color={COLORS.primary.main} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.card,
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
    backgroundColor: COLORS.primary.main,
  },
  arrivalIcon: {
    backgroundColor: COLORS.secondary.main,
  },
  locationConnector: {
    width: 2,
    height: 10,
    backgroundColor: COLORS.border.main,
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