import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Simple star rating component
 * @param {number} rating - Rating value (0-5)
 * @param {number} size - Size of stars (default: 16)
 * @param {boolean} showValue - Show numerical value (default: true)
 */
const StarRating = ({ rating = 0, size = 16, showValue = true }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Ionicons key={i} name="star" size={size} color="#FFD700" />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <Ionicons key="half" name="star-half" size={size} color="#FFD700" />
    );
  }

  // Add empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#FFD700" />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {stars}
      </View>
      {showValue && (
        <Text style={[styles.ratingText, { fontSize: size * 0.8 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#F57C00',
  },
});

export default StarRating;