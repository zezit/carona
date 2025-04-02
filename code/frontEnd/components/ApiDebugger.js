import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { API_URL } from '@env';
import axios from 'axios';
import COLORS from '../constants/colors';

const ApiDebugger = () => {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState(API_URL || 'Not set');
  const [deviceIp, setDeviceIp] = useState('Unknown');

  // Get device IP when component mounts
  useEffect(() => {
    const getNetworkInfo = async () => {
      try {
        const networkInfo = await fetch('https://api.ipify.org?format=json');
        const { ip } = await networkInfo.json();
        setDeviceIp(ip);
      } catch (error) {
        console.error('Failed to get IP:', error);
      }
    };
    
    getNetworkInfo();
  }, []);

  const testApiConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    try {
      const response = await axios.get(`${apiUrl}/ping`, { timeout: 5000 });
      setStatus(`Success: ${response.status}`);
    } catch (error) {
      console.error('API test error:', error);
      if (error.code === 'ECONNABORTED') {
        setStatus('Error: Connection timeout');
      } else if (error.code === 'ERR_NETWORK') {
        setStatus('Error: Network error - API unreachable');
      } else {
        setStatus(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Debugger</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>API URL:</Text>
        <Text style={styles.value}>{apiUrl}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Device IP:</Text>
        <Text style={styles.value}>{deviceIp}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[
          styles.value, 
          status.includes('Success') ? styles.success : 
          status.includes('Error') ? styles.error : null
        ]}>{status}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testApiConnection}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.BACKGROUND} />
        ) : (
          <Text style={styles.buttonText}>Test API Connection</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: COLORS.TEXT,
    minWidth: 80,
  },
  value: {
    flex: 1,
    color: COLORS.TEXT_LIGHT,
  },
  success: {
    color: COLORS.SUCCESS,
  },
  error: {
    color: COLORS.ERROR,
  },
  button: {
    backgroundColor: COLORS.SECONDARY,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: COLORS.BACKGROUND,
    fontWeight: 'bold',
  },
});

export default ApiDebugger;
