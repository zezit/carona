import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as crypto from 'crypto-js';
import { apiClient } from '../api/apiClient';

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
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userId = await AsyncStorage.getItem('userId');
        
        if (token) {
          console.log("Found token:", token.substring(0, 10) + "...");
          // Set the token in memory
          setAuthToken(token);
          setIsAuthenticated(true);
          
          // Set user info if available
          if (userEmail) {
            setUser({ 
              email: userEmail,
              id: userId || null
            });
          }
          
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
      
      if (!result.success) {
        console.log("Token validation failed");
        // Token is invalid, log the user out
        await logout();
      } else {
        console.log("Token is valid");
        // Update user email if different
        if (result.data?.email && result.data.email !== user?.email) {
          setUser({...user, email: result.data.email, id: result.data.id});
          await AsyncStorage.setItem('userEmail', result.data.email);
          await AsyncStorage.setItem('userId', result.data.id.toString());
        }
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
        password 
      });
      
      if (!result.success) {
        setError(result.error.message);
        return false;
      }
      
      if (result.data?.token) {
        console.log("Login successful, saving token");
        
        // Extract user ID from token (assuming JWT contains user ID)
        let userId = null;
        try {
          // This is a simple extraction, in real world you'd properly decode the JWT
          const tokenPayload = JSON.parse(atob(result.data.token.split('.')[1]));
          userId = tokenPayload.userId || tokenPayload.id || tokenPayload.sub;
        } catch (e) {
          console.warn("Could not extract user ID from token");
        }
        
        // Store token and user info persistently
        await AsyncStorage.setItem('authToken', result.data.token);
        await AsyncStorage.setItem('userEmail', strippedEmail);
        if (userId) {
          await AsyncStorage.setItem('userId', userId.toString());
        }
        
        // Update state
        setAuthToken(result.data.token);
        setIsAuthenticated(true);
        setUser({ 
          email: strippedEmail,
          id: userId
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

  const logout = async () => {
    try {
      console.log("Logging out...");
      // Clear all auth data from storage
      await AsyncStorage.multiRemove(['authToken', 'userEmail', 'userId']);
      
      // Reset state
      setAuthToken(null);
      setIsAuthenticated(false);
      setUser(null);
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
        setError(result.error.message);
        return { success: false, error: result.error.message };
      }
      
      return { success: true, data: result.data };
    } catch (e) {
      const errorMsg = 'Erro no cadastro de estudante';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Value object with all the context data and functions
  const authContextValue = {
    isAuthenticated,
    user,
    authToken,
    login,
    logout,
    registerStudent,
    isLoading,
    error
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
