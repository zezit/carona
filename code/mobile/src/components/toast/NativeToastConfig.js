import { View, Text, Platform, StyleSheet, Image } from 'react-native';
import { colors, typography, radius, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

export const nativeToastConfig = {
  success: ({ text1, text2, props }) => (
    <View style={[
      styles.container, 
      Platform.OS === 'ios' ? styles.iosContainer : styles.androidContainer
    ]}>
      <View style={styles.iconContainer}>
        {Platform.OS === 'ios' ? (
          <View style={[styles.iconBackground, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
        ) : (
          <Ionicons name="checkmark-circle" size={24} color={colors.white} />
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={[
          styles.title,
          Platform.OS === 'ios' ? styles.iosTitle : styles.androidTitle
        ]}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={[
            styles.message,
            Platform.OS === 'ios' ? styles.iosMessage : styles.androidMessage
          ]}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),

  error: ({ text1, text2, props }) => (
    <View style={[
      styles.container, 
      Platform.OS === 'ios' ? styles.iosContainer : styles.androidContainer
    ]}>
      <View style={styles.iconContainer}>
        {Platform.OS === 'ios' ? (
          <View style={[styles.iconBackground, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
          </View>
        ) : (
          <Ionicons name="alert-circle" size={24} color={colors.white} />
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={[
          styles.title,
          Platform.OS === 'ios' ? styles.iosTitle : styles.androidTitle
        ]}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={[
            styles.message,
            Platform.OS === 'ios' ? styles.iosMessage : styles.androidMessage
          ]}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),

  info: ({ text1, text2, props }) => (
    <View style={[
      styles.container, 
      Platform.OS === 'ios' ? styles.iosContainer : styles.androidContainer
    ]}>
      <View style={styles.iconContainer}>
        {Platform.OS === 'ios' ? (
          <View style={[styles.iconBackground, { backgroundColor: COLORS.primary.main + '20' }]}>
            <Ionicons 
              name={props?.isRideRequest ? "car" : "information-circle"} 
              size={24} 
              color={COLORS.primary.main} 
            />
          </View>
        ) : (
          <Ionicons 
            name={props?.isRideRequest ? "car" : "information-circle"} 
            size={24} 
            color={colors.white} 
          />
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={[
          styles.title,
          Platform.OS === 'ios' ? styles.iosTitle : styles.androidTitle
        ]}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={[
            styles.message,
            Platform.OS === 'ios' ? styles.iosMessage : styles.androidMessage
          ]}>
            {text2}
          </Text>
        ) : null}
        
        {/* Ride request details - displayed with native-like styling */}
        {props?.isRideRequest && props.details && (
          <View style={Platform.OS === 'ios' ? styles.iosDetailsContainer : styles.androidDetailsContainer}>
            <Text style={styles.detailText}>
              {props.details.origem} → {props.details.destino}
            </Text>
            <Text style={[styles.detailText, styles.timeText]}>
              Horário: {props.details.horario || 'Não informado'}
            </Text>
          </View>
        )}
      </View>
      
      {/* iOS style app icon */}
      {Platform.OS === 'ios' && (
        <View style={styles.appIconContainer}>
          <View style={styles.appIcon}>
            <Ionicons name="car" size={16} color={colors.white} />
          </View>
        </View>
      )}
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  iosContainer: {
    backgroundColor: 'rgba(250, 250, 250, 0.95)',
    borderRadius: radius.lg,
    padding: 16,
    ...shadows.lg,
  },
  androidContainer: {
    backgroundColor: 'rgba(45, 45, 45, 0.98)',
    borderRadius: radius.sm,
    padding: 16,
    ...shadows.md,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontWeight: typography.fontWeights.bold,
    marginBottom: 2,
  },
  iosTitle: {
    color: colors.gray[900],
    fontSize: typography.fontSizes.md,
  },
  androidTitle: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
  },
  message: {
    marginBottom: 4,
  },
  iosMessage: {
    color: colors.gray[700],
    fontSize: typography.fontSizes.sm,
  },
  androidMessage: {
    color: colors.gray[300],
    fontSize: typography.fontSizes.xs,
  },
  iosDetailsContainer: {
    backgroundColor: colors.gray[100],
    padding: 8,
    borderRadius: radius.sm,
    marginTop: 8,
  },
  androidDetailsContainer: {
    marginTop: 8,
    padding: 4,
    borderLeftWidth: 2,
    borderLeftColor: colors.gray[500],
    paddingLeft: 8,
  },
  detailText: {
    fontSize: typography.fontSizes.xs,
    color: Platform.OS === 'ios' ? colors.gray[700] : colors.gray[300],
    lineHeight: 20,
  },
  timeText: {
    marginTop: 2,
  },
  appIconContainer: {
    marginLeft: 12, 
    justifyContent: 'center',
  },
  appIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
