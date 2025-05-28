import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as crypto from 'crypto-js';
import { apiClient } from '../services/api/apiClient';

// Create auth context
const AuthContext = createContext(null);

// Provider component that wraps the app
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log("Checking for auth token...");
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          console.log("Found token:", token.substring(0, 10) + "...");
          // Set the token in memory
          setAuthToken(token);
          setIsAuthenticated(true);
          // Verify token validity with server
          validateToken(token);
        } else {
          console.log("No auth token found");
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Error loading auth token:", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  // Validate the token with the server
  const validateToken = async (token) => {
    try {
      // Configure headers with the token
      const options = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // Use a simple endpoint to verify token validity
      const result = await apiClient.get('/auth/validate', options);

      console.debug("Token validation result:", JSON.stringify(result?.data, null, 1));

      if (!result.success) {
        console.log("Token validation failed");
        // Token is invalid, log the user out
        await logoutUser();
      } else {
        console.log("Token is valid");

        await AsyncStorage.setItem('userEmail', result.data.email);
        await AsyncStorage.setItem('userId', result.data.userId.toString());
        await AsyncStorage.setItem('userName', result.data.name);
        await AsyncStorage.setItem('photoUrl', result.data.imgUrl);

        const updatedUser = {
          email: result.data.email,
          id: result.data.userId,
          name: result.data.name,
          photoUrl: result.data.imgUrl
        }

        console.info("Updating user info in context");
        console.debug("Updated user:", updatedUser);

        setUser(updatedUser);
      }
    } catch (e) {
      // Non-critical error, don't log out but log the error
      console.warn("Token validation error:", e);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Always strip email to prevent login issues
      const strippedEmail = email.trim().toLowerCase();

      const result = await apiClient.post('/auth/login', {
        email: strippedEmail,
        password: crypto.MD5(password).toString()
      });

      if (!result.success) {
        setError(result.error?.message);
        return false;
      }

      if (result.data?.token) {
        console.log("Login successful, saving token");
        // Extract user ID and name from token if available
        let userId = null;
        let userName = null;
        let photoUrl = null;
        try {
          // This is a simple extraction, in real world you'd properly decode the JWT
          const tokenPayload = JSON.parse(atob(result.data.token.split('.')[1]));
          userId = tokenPayload.userId || tokenPayload.id || tokenPayload.sub;
          userName = tokenPayload.name || null;
          photoUrl = tokenPayload.photoUrl || null;
        } catch (e) {
          console.warn("Could not extract user ID from token");
        }

        // Store token and user info persistently
        await AsyncStorage.setItem('authToken', result.data.token);
        await AsyncStorage.setItem('userEmail', strippedEmail);
        await AsyncStorage.setItem('userName', userName);
        await AsyncStorage.setItem('photoUrl', photoUrl || '');
        if (userId) {
          await AsyncStorage.setItem('userId', userId.toString());
        }

        console.debug("User ID:", userId);
        console.debug("User Name:", userName);
        console.debug("User Email:", strippedEmail);
        console.debug("User Photo URL:", photoUrl);
        console.debug("Token:", result.data.token.substring(0, 10) + "...");
        
        // Update state
        setAuthToken(result.data.token);
        setIsAuthenticated(true);
        setUser({
          email: strippedEmail,
          id: userId,
          name: userName,
          photoUrl: photoUrl
        });
        return true;
      } else {
        setError('Token de autenticação não recebido');
        return false;
      }
    } catch (e) {
      setError('Erro ao processar login');
      console.error("Error in login process:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      console.log("Logging out...");
      // Clear all auth data from storage
      await AsyncStorage.multiRemove(['authToken', 'userEmail', 'userId', 'userName', 'photoUrl']);

      // Reset state
      setAuthToken(null);
      setIsAuthenticated(false);
      setUser(null);

      // Add delay to ensure state updates before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("Logout complete");
      return true;
    } catch (e) {
      console.error("Error removing auth data:", e);
      return false;
    }
  };

  const registerStudent = async (studentData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Clean email
      if (studentData.email) {
        studentData.email = studentData.email.trim().toLowerCase();
      }

      // Make sure password is hashed if not already done
      if (studentData.password && studentData.password.length !== 32) {
        studentData.password = crypto.MD5(studentData.password).toString();
      }

      const result = await apiClient.post('/usuario/estudante', studentData);

      if (!result.success) {
        setError(result.error?.message);
        return { success: false, error: result.error?.message };
      }

      return { success: true, data: result.data };
    } catch (e) {
      console.error("Error in student registration:", e);
      const errorMsg = 'Erro no cadastro de estudante';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const loadUser = async () => {
    if (user) return user;

    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      await logoutUser();
      return null;
    }

    validateToken(token);

    return user;
  }

  // Value object with all the context data and functions
  const authContextValue = {
    isAuthenticated,
    user,
    setUser,
    authToken,
    login,
    logoutUser,
    registerStudent,
    isLoading,
    error,
    loadUser
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
