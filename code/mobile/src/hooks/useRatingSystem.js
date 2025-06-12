import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { checkPendingRatings } from '../services/api/apiClient';

const useRatingSystem = () => {
  const { user, authToken } = useAuthContext();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isCheckingPendingRatings, setIsCheckingPendingRatings] = useState(false);

  const checkForPendingRatings = useCallback(async () => {
    if (!authToken || !user) return;

    setIsCheckingPendingRatings(true);
    try {
      const response = await checkPendingRatings(authToken);
      if (response.success && response.data === true) {
        // There are pending ratings, show the modal
        setShowRatingModal(true);
      }
    } catch (error) {
      console.error('Error checking pending ratings:', error);
    } finally {
      setIsCheckingPendingRatings(false);
    }
  }, [authToken, user]);

  const closeRatingModal = useCallback(() => {
    setShowRatingModal(false);
  }, []);

  // Check for pending ratings when the hook is first used
  useEffect(() => {
    checkForPendingRatings();
  }, [checkForPendingRatings]);

  // Check for pending ratings when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        checkForPendingRatings();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription?.remove();
  }, [checkForPendingRatings]);

  // Periodic check for pending ratings (every 5 minutes when app is active)
  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        checkForPendingRatings();
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [checkForPendingRatings]);

  return {
    showRatingModal,
    closeRatingModal,
    checkForPendingRatings,
    isCheckingPendingRatings,
  };
};

export default useRatingSystem;
