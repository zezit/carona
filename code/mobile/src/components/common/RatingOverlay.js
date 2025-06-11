import React from 'react';
import { RatingBottomSheet } from '../ui/Rating';
import useRatingSystem from '../../hooks/useRatingSystem';

const RatingOverlay = () => {
  const { showRatingModal, closeRatingModal } = useRatingSystem();

  return (
    <RatingBottomSheet 
      visible={showRatingModal} 
      onClose={closeRatingModal} 
    />
  );
};

export default RatingOverlay;
