import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { commonStyles } from '../theme/styles/commonStyles';
import useAuth from '../hooks/useAuth';
import * as crypto from 'crypto-js';
import { useFadeSlideAnimation } from '../hooks/animations';
import { Animated } from 'react-native';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const { animatedStyle } = useFadeSlideAnimation({
    fadeStartValue: 0,
    fadeEndValue: 1,
    slideStartValue: 50,
    slideEndValue: 0,
    fadeDuration: 400,
    slideDuration: 300
  });

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

    const hashedPassword = crypto.MD5(password).toString();
    await login(email, hashedPassword);
  };

  useEffect(() => {
    if (error) {
      let errorMessage = error;

      if (error.includes('Email ou senha incorretos')) {
        errorMessage = 'Email ou senha incorretos. Por favor, tente novamente.';
      } else if (error.includes('Tempo limite')) {
        errorMessage = 'O servidor não respondeu a tempo. Verifique sua conexão e tente novamente.';
      } else if (error.includes('Erro de conexão')) {
        errorMessage = 'Ocorreu um erro ao comunicar com o servidor. Verifique sua conexão.';
      } else {
        errorMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.';
      }

      Alert.alert('Erro de Login', errorMessage);
    }
  }, [error]);

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerView}>
        <Animated.Text style={[commonStyles.title, { opacity: animatedStyle.opacity }]}>
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

      <View style={[commonStyles.footerView, { flex: 0 }]}>
        <Text style={{ display: 'none' }}></Text>
      </View>
    </View>
  );
};

export default React.memo(LoginPage);