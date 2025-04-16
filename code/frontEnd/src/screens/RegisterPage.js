import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard, StyleSheet, ActivityIndicator } from 'react-native';
import { commonStyles } from '../theme/styles/commonStyles';
import { useAuthContext } from '../contexts/AuthContext';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFadeSlideAnimation } from '../hooks/animations';
import { COLORS, SPACING, RADIUS } from '../constants';

export default function RegisterPage({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { animatedStyle } = useFadeSlideAnimation({
    fadeStartValue: 0,
    fadeEndValue: 1,
    slideStartValue: 50,
    slideEndValue: 0,
    fadeDuration: 200,
    slideDuration: 100
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCadastro = async () => {
    Keyboard.dismiss();

    if (email === '' || password === '' || username === "") {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);

      navigation.navigate('RegisterSecond', {
        username,
        email,
        password
      });

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao prosseguir. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerView}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Botão voltar"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
        </TouchableOpacity>

        <Animated.Text style={[commonStyles.title, { opacity: animatedStyle.opacity }]}>
          Carona?
        </Animated.Text>

        {/* Empty view for layout balance */}
        <View style={{ width: 24 }} />
      </View>

      <Animated.View style={[commonStyles.contentView, animatedStyle]}>
        <Text style={commonStyles.subtitle}>Criar Conta</Text>

        {/* Progress indicator with proper Text components */}
        <View style={commonStyles.progressIndicator}>
          {/* Replace View with empty Text components for the dots and lines */}
          <Text style={[styles.progressDot, commonStyles.progressDot, commonStyles.activeDot]}></Text>
          <Text style={[styles.progressLine, commonStyles.progressLine]}></Text>
          <Text style={[styles.progressDot, commonStyles.progressDot]}></Text>
        </View>

        <TextInput
          style={commonStyles.textInput}
          placeholder="Nome completo"
          value={username}
          onChangeText={(text) => setUsername(text)}
          autoCapitalize="words"
          textContentType="name"
        />

        <TextInput
          style={commonStyles.textInput}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          autoComplete="email"
        />

        <TextInput
          style={commonStyles.textInput}
          placeholder="Senha"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
        />

        <View style={commonStyles.linkContainer}>
          <Text style={commonStyles.normalText}>
            Já tem uma conta?{' '}
            <Text
              style={commonStyles.linkText}
              onPress={() => navigation.goBack()}
            >
              Faça login!
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[
            commonStyles.button,
            styles.registerButton,
            isSubmitting && commonStyles.buttonDisabled
          ]}
          onPress={handleCadastro}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.text.light} size="small" />
          ) : (
            <Text style={commonStyles.buttonText}>Continuar</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    left: SPACING.lg,
    zIndex: 10,
    padding: SPACING.xs,
  },
  registerButton: {
    marginTop: SPACING.xl,
    alignSelf: 'center',
  },
  progressDot: {
    // Empty text component styled as a dot
    fontSize: 0,
    color: 'transparent',
  },
  progressLine: {
    // Empty text component styled as a line
    fontSize: 0,
    color: 'transparent',
  }
});