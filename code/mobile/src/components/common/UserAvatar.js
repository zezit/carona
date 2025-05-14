import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

/**
 * A reusable avatar component that can display an image or a placeholder icon
 * 
 * @param {Object} props - Component props
 * @param {string} props.uri - The URI of the image to display
 * @param {number} props.size - The size of the avatar (default: 60)
 * @param {string} props.placeholder - The Ionicons name to use as placeholder (default: 'person')
 * @param {string} props.placeholderColor - The color of the placeholder icon (default: COLORS.primary)
 * @param {Object} props.style - Additional style for the container
 * @param {Object} props.imageStyle - Additional style for the image
 */
const UserAvatar = ({
  uri,
  size = 60,
  placeholder = 'person',
  placeholderColor = COLORS.primary,
  style,
  imageStyle,
}) => {
  const iconSize = size * 0.6;
  
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            imageStyle,
          ]}
        />
      ) : (
        <Ionicons name={placeholder} size={iconSize} color={placeholderColor} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
});

export default React.memo(UserAvatar);