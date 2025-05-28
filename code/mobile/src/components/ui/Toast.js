import React, { useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const TOAST_WIDTH = screenWidth - (SPACING.lg * 2); // Reduced back to lg
const TOAST_MIN_HEIGHT = 80; // Reduced from 120 to 80
const ANIMATION_DURATION = 400; // Slightly longer animation
const SPRING_CONFIG = {
  tension: 120,
  friction: 9,
  useNativeDriver: true,
};

// Sound utility function
const playToastSound = async (soundType) => {
  try {
    // Set audio mode to allow sounds to play
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    let soundFile;
    
    // Use different sounds for different toast types
    switch (soundType) {
      case 'success':
      case 'rideConfirmed':
        // Success sound - high pitched ding
        soundFile = require('../../assets/sounds/mixkit-long-pop-2358.wav');
        break;
      case 'error':
      case 'rideCancelled':
        // Error sound - alert tone
        soundFile = require('../../assets/sounds/mixkit-long-pop-2358.wav');
        break;
      case 'warning':
        // Warning sound - moderate tone
        soundFile = require('../../assets/sounds/mixkit-long-pop-2358.wav');
        break;
      case 'info':
      case 'notification':
      case 'ride':
      default:
        // Default notification sound - gentle chime
        soundFile = require('../../assets/sounds/mixkit-long-pop-2358.wav');
        break;
    }

    const { sound } = await Audio.Sound.createAsync(soundFile, {
      shouldPlay: true,
      volume: 0.8,
    });

    // Unload sound after playing to free memory
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });

  } catch (error) {
    console.warn('Failed to play toast sound:', error);
  }
};

const getToastConfig = (type) => {
  const configs = {
    success: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#E8F5E8', '#F0F9F0'],
      iconName: 'checkmark-circle',
      iconColor: COLORS.success.main,
      iconBackgroundColor: 'rgba(76, 175, 80, 0.1)',
      textColor: COLORS.text.primary,
      subtitleColor: COLORS.text.secondary,
      borderColor: COLORS.success.main,
      shadowColor: COLORS.success.main,
      soundType: 'success',
    },
    error: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#FFEBEE', '#FFCDD2'],
      iconName: 'alert-circle',
      iconColor: COLORS.danger.main,
      iconBackgroundColor: 'rgba(244, 67, 54, 0.1)',
      textColor: COLORS.text.primary,
      subtitleColor: COLORS.text.secondary,
      borderColor: COLORS.danger.main,
      shadowColor: COLORS.danger.main,
      soundType: 'error',
    },
    warning: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#FFF8E1', '#FFECB3'],
      iconName: 'warning',
      iconColor: COLORS.warning.main,
      iconBackgroundColor: 'rgba(255, 193, 7, 0.1)',
      textColor: COLORS.text.primary,
      subtitleColor: COLORS.text.secondary,
      borderColor: COLORS.warning.main,
      shadowColor: COLORS.warning.main,
      soundType: 'warning',
    },
    info: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#E3F2FD', '#BBDEFB'],
      iconName: 'information-circle',
      iconColor: COLORS.primary.main,
      iconBackgroundColor: 'rgba(33, 150, 243, 0.1)',
      textColor: COLORS.text.primary,
      subtitleColor: COLORS.text.secondary,
      borderColor: COLORS.primary.main,
      shadowColor: COLORS.primary.main,
      soundType: 'info',
    },
    notification: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#F5F5F5', '#EEEEEE'],
      iconName: 'notifications',
      iconColor: COLORS.primary.main,
      iconBackgroundColor: 'rgba(33, 150, 243, 0.1)',
      textColor: COLORS.text.primary,
      subtitleColor: COLORS.text.secondary,
      borderColor: COLORS.border.main,
      shadowColor: COLORS.primary.main,
      soundType: 'notification',
    },
    ride: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#E8F5E8', '#F0F9F0'],
      iconName: 'car',
      iconColor: COLORS.primary.main,
      iconBackgroundColor: 'rgba(33, 150, 243, 0.1)',
      textColor: COLORS.text.primary,
      subtitleColor: COLORS.text.secondary,
      borderColor: COLORS.primary.main,
      shadowColor: COLORS.primary.main,
      soundType: 'ride',
    },
    rideConfirmed: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#E8F5E8', '#F0F9F0'],
      iconName: 'checkmark-circle',
      iconColor: COLORS.success.main,
      iconBackgroundColor: 'rgba(76, 175, 80, 0.1)',
      textColor: COLORS.text.primary,
      subtitleColor: COLORS.text.secondary,
      borderColor: COLORS.success.main,
      shadowColor: COLORS.success.main,
      soundType: 'rideConfirmed',
    },
    rideCancelled: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#FFEBEE', '#FFCDD2'],
      iconName: 'close-circle',
      iconColor: COLORS.danger.main,
      iconBackgroundColor: 'rgba(244, 67, 54, 0.1)',
      textColor: COLORS.text.primary,
      subtitleColor: COLORS.text.secondary,
      borderColor: COLORS.danger.main,
      shadowColor: COLORS.danger.main,
      soundType: 'rideCancelled',
    },
  };

  return configs[type] || configs.info;
};

const Toast = memo(({ toast, onDismiss, ...props }) => {
  // Handle both toast object prop and individual props for backward compatibility
  const toastData = toast || props;
  const { 
    id, 
    type = 'info', 
    message = '', 
    title, 
    subtitle, 
    time, 
    onPress, 
    dismissible = true, 
    animatedValue 
  } = toastData;
  
  // Ensure we have required values
  if (!message && !title) {
    console.warn('Toast: No message or title provided');
    return null;
  }

  // Create notification object from props for compatibility
  const notification = subtitle || time ? {
    title,
    message,
    subtitle,
    time,
  } : null;

  const config = getToastConfig(type);

  useEffect(() => {
    // Animate in and play sound
    if (animatedValue) {
      Animated.spring(animatedValue, {
        toValue: 1,
        ...SPRING_CONFIG,
      }).start();
    }
    
    // Play sound when toast appears
    if (config.soundType) {
      playToastSound(config.soundType);
    }
  }, [animatedValue, config.soundType]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    if (dismissible && onDismiss && id) {
      onDismiss(id);
    }
  };

  const handleDismiss = () => {
    if (dismissible && onDismiss && id) {
      onDismiss(id);
    }
  };

  // Safe animation interpolation
  const getAnimationValues = () => {
    if (!animatedValue) {
      return {
        translateY: 0,
        opacity: 1,
        scale: 1,
      };
    }

    return {
      translateY: animatedValue.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-100, -100, 0],
      }),
      opacity: animatedValue.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 0, 1],
      }),
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
      }),
    };
  };

  const { translateY, opacity, scale } = getAnimationValues();

  const renderContent = () => {
    if (type === 'notification' || type === 'ride' || type.includes('ride')) {
      return (
        <View style={styles.enhancedContent}>
          <View style={styles.mainContentRow}>
            <View style={styles.textSection}>
              <Text style={[styles.enhancedTitle, { color: config.textColor }]} numberOfLines={2}>
                {notification?.title || title || 'Notificação'}
              </Text>
              <Text style={[styles.enhancedMessage, { color: config.subtitleColor }]} numberOfLines={3}>
                {notification?.message || message}
              </Text>
            </View>
            <View style={styles.timeSection}>
              <Text style={[styles.enhancedTime, { color: config.subtitleColor }]}>
                {notification?.time || time || 'agora'}
              </Text>
            </View>
          </View>
          
          {(notification?.subtitle || subtitle) && (
            <View style={styles.subtitleSection}>
              <Ionicons 
                name="location" 
                size={10} 
                color={config.subtitleColor} 
                style={styles.locationIcon}
              />
              <Text style={[styles.enhancedSubtitle, { color: config.subtitleColor }]} numberOfLines={1}>
                {notification?.subtitle || subtitle}
              </Text>
            </View>
          )}
          
          {/* Action indicators */}
          <View style={styles.actionSection}>
            <Text style={[styles.actionText, { color: config.iconColor }]}>
              Toque para detalhes
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={12} 
              color={config.iconColor} 
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.simpleContent}>
        {title && (
          <Text style={[styles.title, { color: config.textColor }]} numberOfLines={2}>
            {title}
          </Text>
        )}
        <Text style={[styles.message, { color: config.subtitleColor }]} numberOfLines={3}>
          {message}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        <View style={styles.contentContainer}>
          <View style={[styles.enhancedIconContainer, { backgroundColor: config.iconBackgroundColor }]}>
            <Ionicons 
              name={config.iconName} 
              size={20} 
              color={config.iconColor} 
            />
          </View>

          {renderContent()}

          {dismissible && (
            <TouchableOpacity
              style={styles.enhancedDismissButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="close" 
                size={16} 
                color={config.subtitleColor} 
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: TOAST_WIDTH,
    minHeight: TOAST_MIN_HEIGHT,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  touchable: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: TOAST_MIN_HEIGHT - 2, // Account for border
  },
  enhancedIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    flexShrink: 0,
  },
  enhancedContent: {
    flex: 1,
    justifyContent: 'center',
  },
  mainContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  textSection: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  timeSection: {
    flexShrink: 0,
    marginRight: SPACING.sm,
    alignSelf: 'flex-start',
  },
  enhancedTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 18,
    marginBottom: 2,
  },
  enhancedMessage: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    lineHeight: 16,
  },
  enhancedTime: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.regular,
    textAlign: 'right',
  },
  subtitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  locationIcon: {
    marginRight: 4,
  },
  enhancedSubtitle: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  actionText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.medium,
    marginRight: 4,
  },
  simpleContent: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 18,
    marginBottom: 2,
  },
  message: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    lineHeight: 16,
  },
  enhancedDismissButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    zIndex: 1,
    padding: 4,
  },
});

Toast.displayName = 'Toast';

export default Toast;