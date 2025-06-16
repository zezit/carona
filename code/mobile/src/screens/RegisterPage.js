import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';

// Import reusable components
import { FormInput } from '../components/form';
import { LoadingIndicator } from '../components/ui';

const RegisterPage = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!nome || nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle next step in registration
  const handleNext = () => {
    if (!validateForm()) return;
    
    // Navigate to second registration page with form data
    navigation.navigate('RegisterSecond', {
      username: nome,
      email: email,
      password: password
    });
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <LoadingIndicator text="Processando..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary.main, COLORS.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Animatable.View 
            animation="fadeIn" 
            duration={300} 
            style={styles.logoContainer}
          >
            <Ionicons name="car" size={40} color="white" />
          </Animatable.View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View 
            animation="fadeIn" 
            duration={300} 
            style={styles.formContainer}
          >
            <View style={commonStyles.progressIndicator}>
              <View style={[commonStyles.progressDot, commonStyles.activeDot]} />
              <View style={commonStyles.progressLine} />
              <View style={commonStyles.progressDot} />
            </View>

            <Text style={styles.formTitle}>Criar Conta</Text>
            <Text style={styles.formSubtitle}>Preencha seus dados para começar</Text>

            <View style={styles.inputsContainer}>
              <FormInput
                label="Nome completo"
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome completo"
                autoCapitalize="words"
                icon="person"
                error={errors.nome}
                testID="register-name-input"
              />

              <FormInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu.email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail"
                error={errors.email}
                testID="register-email-input"
              />

              <FormInput
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Crie uma senha forte"
                secureTextEntry
                icon="lock-closed"
                error={errors.password}
                testID="register-password-input"
              />

              <FormInput
                label="Confirmar senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme sua senha"
                secureTextEntry
                icon="shield-checkmark"
                error={errors.confirmPassword}
                testID="register-confirm-password-input"
              />
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleNext}
              testID="register-button"
            >
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 160,
    paddingTop: SPACING.lg,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  formScrollView: {
    flex: 1,
    marginTop: -40,
  },
  formScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  formContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  formSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  inputsContainer: {
    marginBottom: SPACING.md,
  },
  continueButton: {
    height: 50,
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary.main,
    fontWeight: 'bold',
  }
});

export default RegisterPage;