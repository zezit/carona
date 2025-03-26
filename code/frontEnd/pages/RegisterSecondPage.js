import { StyleSheet, Text, View, TextInput, Button ,TouchableOpacity,Alert,Modal} from "react-native";
import React, { useState } from 'react';
import { Picker } from "@react-native-picker/picker";
export default function RegisterSecondPage({ route }) {
    const { username, email, password } = route.params;
    const [birthDate, setBirthDate] = useState("");
    const [registration, setRegistration] = useState("");
    const [userType, setUserType] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
  
    const handleCadastro = () => {
        if (birthDate === "" || registration === "" || userType === "") {
          Alert.alert("Erro", "Por favor, preencha todos os campos.");
          return;
        }
    
        Alert.alert("Cadastro Concluído!", `Usuário: ${username}, Tipo: ${userType}`);
      };

      return (
        <View style={styles.container}>
          <View style={styles.primeiraView}>
            <Text style={styles.titulo}>Carona?</Text>
          </View>
    
          <View style={styles.containerInputs}>
            <Text style={styles.subtitulo}>Mais Informações</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Data de Nascimento (DD/MM/AAAA)"
              value={birthDate}
              onChangeText={(text) => setBirthDate(text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.textInput}
              placeholder="Matrícula"
              value={registration}
              onChangeText={(text) => setRegistration(text)}
            />
     <TouchableOpacity style={styles.textuserType} onPress={() => setModalVisible(true)}>
        <Text style={userType ? styles.selectedText : styles.placeholderText}>
          {userType ? userType : "Tipo de usuário"}
        </Text>
      </TouchableOpacity>
            
           
         <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
         <View style={styles.modalWrapper}> 
            <View style={styles.closeButtonwrapper}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
            </View>
            <Picker
              selectedValue={userType}
              onValueChange={(itemValue) => setUserType(itemValue)}
            >
              <Picker.Item label="Passageiro" value="Passageiro" />
              <Picker.Item label="Passageiro e Motorista" value="Ambos" />
            </Picker>

            {/* Botão para Fechar */}
            
            </View>
        </View>
      </Modal>
          </View>
    
          <View style={styles.ultimaView}>
            <View style={styles.buttonView}>
              <TouchableOpacity style={styles.button} onPress={handleCadastro}>
                <Text style={styles.buttonText}>Finalizar</Text>
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
          marginBottom: 10,
        },
        textuserType:{
            height: 40,
            borderBottomWidth: 1,
            borderBottomColor: "gray",
            width: "90%",
            paddingTop:10
        },
        containerInputs: {
          flex: 1,
          backgroundColor: "white",
          width: "100%",
          alignItems: "center",
        },
        picker: {
          height: 50,
          width: "90%",
          marginBottom: 20,
        },
        ultimaView: {
          flex: 2,
          width: "90%",
          alignItems: "flex-end",
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingBottom: 90,
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
          marginBottom: 20,
        },
        buttonView: {
          width: "30%",
          borderWidth: 3,
          borderRadius: 10,
          borderColor: "#005b96",
        },
        button: {
          backgroundColor: "#005b96",
          paddingVertical: 10,
          paddingHorizontal: 10,
          alignItems: "center",
        },
        buttonText: {
          color: "white",
          fontSize: 16,
          fontWeight: "bold",
        },
        placeholderText: {
            color: "#D9D6D7",
          },
          selectedText: {
            color: "#000",
          },
          modalContainer:{
            flex:1,
            justifyContent:'flex-end',
            alignItems:'center'

          },
          modalWrapper:{
            width: '100%',
            height:'45%',
            backgroundColor:"#F7F7F9",
            
            
          },
          closeButtonText:{
            color:"#005b96",
            fontSize: 18,
          },
          closeButtonwrapper:{
            width: '95%',
            alignItems:"flex-end"
          }

        
        
      });