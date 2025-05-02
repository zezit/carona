
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../constants';
import { useAuthContext } from '../contexts/AuthContext';
import { useFadeAnimation } from '../hooks/animations';
import { apiClient, getUpcomingRides } from '../services/api/apiClient';
import { commonStyles } from '../theme/styles/commonStyles';
import { ActionButton, PageHeader } from '../components/common';
// Import reusable components
import { LoadingIndicator, OptionButton } from '../components/ui';

const FindRides = ({ navigation}) => {
  return (
    <SafeAreaView >
          <PageHeader
          style={styles.header}
                title="Buscar caronas"
                onBack={() => navigation.goBack()}
              />
        <View style={styles.container}>
        <View style={styles.titleCard}>
                
                <Text style={styles.titulo}>Confira as caronas mais proximas de você!</Text>
            
    </View>
        </View>
      
    </SafeAreaView>
  )
};
const styles = StyleSheet.create({
   container:{
  alignItems:"center"
   },
   titleCard:{
   width:"90%",
   

   },
   titulo:{
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign:"center"
   }
  });

export default FindRides