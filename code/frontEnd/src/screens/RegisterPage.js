import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Animated, Keyboard } from "react-native";
import React, { useState, useRef, useEffect } from 'react';
import { commonStyles } from '../theme/styles/commonStyles';

export default function RegisterPage({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Start animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleCadastro = () => {
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
    
    navigation.navigate('RegisterSecond', { username, email, password });
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }]
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={commonStyles.container}>
        <View style={commonStyles.headerView}>
          <Animated.Text style={[commonStyles.title, { opacity: fadeAnim }]}>
            Carona?
          </Animated.Text>
        </View>

        <Animated.View style={[commonStyles.contentView, animatedStyle]}>
          <Text style={commonStyles.subtitle}>Cadastre-se</Text>
          
          <View style={commonStyles.formGroup}>
            <Text style={commonStyles.inputLabel}>Nome</Text>
            <TextInput 
              style={commonStyles.textInput} 
              value={username} 
              onChangeText={(text) => setUsername(text)} 
              placeholder="Seu nome completo" 
              accessibilityLabel="Campo de nome"
              autoComplete="name"
              textContentType="name"
            />
          </View>
          
          <View style={commonStyles.formGroup}>
            <Text style={commonStyles.inputLabel}>Email</Text>
            <TextInput 
              style={commonStyles.textInput} 
              placeholder="Seu email" 
              value={email} 
              onChangeText={(text) => setEmail(text)} 
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Campo de email"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>
          
          <View style={commonStyles.formGroup}>
            <Text style={commonStyles.inputLabel}>Senha</Text>
            <TextInput 
              style={commonStyles.textInput} 
              value={password} 
              placeholder="Mínimo de 6 caracteres" 
              onChangeText={(text) => setPassword(text)} 
              secureTextEntry
              accessibilityLabel="Campo de senha"
              textContentType="newPassword"
            />
            <Text style={commonStyles.inputHintText}>
              Sua senha deve ter pelo menos 6 caracteres
            </Text>
          </View>

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
        </Animated.View>

        <Animated.View style={[commonStyles.footerView, { opacity: fadeAnim }]}>
          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity 
              style={commonStyles.button} 
              onPress={handleCadastro}
              accessibilityLabel="Botão de próximo passo"
              accessibilityRole="button"
            >
              <Text style={commonStyles.buttonText}>Avançar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
