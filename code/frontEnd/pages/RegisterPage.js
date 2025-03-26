import { StyleSheet, Text, View, TextInput, Button ,TouchableOpacity,Alert} from "react-native";
import React, { useState } from 'react';
export default function RegisterPage({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  
const  handleCadastro=()=>{

   if (email === '' || password === ''|| username==="") {
        Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        return;
      }
      else{
        navigation.navigate('Mais informações', { username, email, password });
        
      }
  }

  return (
    <View style={styles.container}>
      <View style={styles.primeiraView}>
        <Text style={styles.titulo}>Carona?</Text>
      </View>

      <View style={styles.containerInputs}>
        <Text style={styles.subtitulo}  >Cadastre-se</Text>
        <TextInput style={styles.textInput} value={username}  onChangeText={(text) => setUsername(text)} placeholder="Nome" />
        <TextInput style={styles.textInput} placeholder="Email"  value={email}  onChangeText={(text) => setEmail(text)}  keyboardType="email-address"/>
        <TextInput style={styles.textInput} value={password} placeholder="Senha"  onChangeText={(text) => setPassword(text)}   secureTextEntry/>
      </View>

      <View style={styles.ultimaView}>
        <View style={styles.buttonView}>
        <TouchableOpacity style={styles.button} onPress={ handleCadastro}>
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
        </View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    width: "90%",
  },
  containerInputs: {
    flex: 1,
    backgroundColor: "white",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ultimaView: {
    flex: 2,
    width:'90%',
    alignItems:"flex-end",
    flexDirection:"row",
    justifyContent:'flex-end',
    paddingBottom:90,
    
    
  },
  primeiraView: {
    flex: 1,

    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 30,
  },
  subtitulo: {
    fontSize: 20,
    width: "90%",
  },
  buttonView: {
  width:'30%',
  borderWidth:3,
  borderRadius:10,
  borderColor:'#005b96',
  
  },
  button:{
    backgroundColor:"#005b96",
    color:"red",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

});
