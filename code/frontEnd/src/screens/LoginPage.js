import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator, Animated, Keyboard } from 'react-native';
import { commonStyles } from '../theme/styles/commonStyles';
import useAuth from '../hooks/useAuth';
import * as crypto from 'crypto-js';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Start animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (email === '' || password === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }

    // Hash the password with MD5 as required by the API spec
    const hashedPassword = crypto.MD5(password).toString();

    await login(email, hashedPassword);

    // No need to manually navigate - the AuthContext will update isAuthenticated
    // and AppNavigator will automatically switch to the Main stack
  };

  useEffect(() => {
    if (error) {
      // Customize error message based on error type
      let errorMessage = error;
      
      if (error.includes('Email ou senha incorretos')) {
        errorMessage = 'Email ou senha incorretos. Por favor, tente novamente.';
      } else if (error.includes('Tempo limite')) {
        errorMessage = 'O servidor não respondeu a tempo. Verifique sua conexão e tente novamente.';
      } else if (error.includes('Erro de conexão')){
        errorMessage = 'Ocorreu um erro ao comunicar com o servidor. Verifique sua conexão.';
      } else {
        errorMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.';
      }
      
      Alert.alert('Erro de Login', errorMessage);
    }
  }, [error]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }]
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerView}>
        <Animated.Text style={[commonStyles.title, { opacity: fadeAnim }]}>
          Carona?
        </Animated.Text>
      </View>

      <Animated.View style={[commonStyles.contentView, animatedStyle]}>
        <Text style={commonStyles.subtitle}>Login</Text>
        
        <View style={commonStyles.linkContainer}>
          <Text style={commonStyles.normalText}>
            Novo Usuário?{' '}
            <Text 
              style={commonStyles.linkText} 
              onPress={() => {
                // Use navigation animation
                navigation.navigate('Registrar');
              }}
            >
              Crie uma conta!
            </Text>
          </Text>
        </View>
        
        <TextInput 
          style={commonStyles.textInput} 
          placeholder="Email" 
          value={email} 
          onChangeText={(text) => setEmail(text)} 
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          accessibilityLabel="Campo de email"
        />
        
        <TextInput 
          style={commonStyles.textInput} 
          placeholder="Senha" 
          value={password} 
          onChangeText={(text) => setPassword(text)} 
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
          accessibilityLabel="Campo de senha"
        />
        
        <TouchableOpacity 
          style={commonStyles.forgotPasswordContainer} 
          onPress={() => Alert.alert("Redefinir senha", "Função de recuperação de senha será implementada em breve.")}
        >
          <Text style={commonStyles.forgotPasswordText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={[commonStyles.footerView, { paddingBottom: 0 }]}>
        <View style={commonStyles.buttonContainer}>
          <TouchableOpacity 
            style={[
              commonStyles.button, 
              isLoading && commonStyles.buttonDisabled
            ]} 
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityLabel="Botão de login"
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[commonStyles.footerView, { flex: 0 }]} />
    </View>
  );
};

export default LoginPage;
