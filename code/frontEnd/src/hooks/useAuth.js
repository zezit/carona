import { useAuthContext } from '../contexts/AuthContext';

// This is now just a proxy for useAuthContext to maintain compatibility
const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
