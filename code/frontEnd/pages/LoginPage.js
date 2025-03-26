import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Simulação de autenticação (substitua com sua lógica de autenticação)
    if (email === 'user@example.com' && password === 'password123') {
      // Navegar para a tela principal após login bem-sucedido
      navigation.navigate('Home'); // Exemplo de navegação
    } else {
      Alert.alert('Erro', 'Credenciais inválidas.');
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.firstView}>
            <Text style={styles.title}>Carona?</Text>
      
        </View>

        <View style={styles.containerInputs}>
        <Text style={styles.subtitle}>Login</Text>
        <Text style={styles.signupText}> Novo Usuário?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('Registrar')}>Crie uma conta!</Text>
      </Text>
      <TextInput style={styles.TextInput} placeholder="Email"  value={email}  onChangeText={(text) => setEmail(text)}  keyboardType="email-address"/>
      <TextInput style={styles.TextInput} placeholder="Senha"  value={password}  onChangeText={(text) => setPassword(text)}   secureTextEntry/>
        </View>
        <View style={styles.lastViwer}>
      <TouchableOpacity style={styles.signButton} onPress={handleLogin}>
        <Text style={styles.signButtonText}>Entrar</Text>
      </TouchableOpacity>
     
        </View>

        <View style={styles.lastView}>

        




        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
  },
  TextInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    width: "90%",
  },
  signupText: {
    marginTop: 12,
    height: 40,
    width: "92%",
   
  },
  signButton: {
    backgroundColor:"#005b96",
    color:"red",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    width: 100,
    alignItems: "center",
  },
  signButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",


  },
  signupLink: {
    color: 'blue',
  },
  tittle: {
    fontSize: 30,
  },
  subtitle: {
    fontSize: 20,
    width: "90%",
  },
  containerInputs: {
    flex: 1,
    backgroundColor: "white",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastViwer: {
    flex: 2,
    width:'90%',
    alignItems:"flex-end",
    flexDirection:"row",
    justifyContent:'flex-end',
    paddingBottom:0,
    
    
  },
  lastView: {
    flex: 0,
    width:'90%',
    alignItems:"flex-end",
    flexDirection:"row",
    justifyContent:'flex-end',
    paddingBottom:90,
    
    
  },
  firstView: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoginPage;
