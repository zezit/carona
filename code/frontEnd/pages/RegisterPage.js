import { StyleSheet, Text, View, TextInput, Button ,TouchableOpacity} from "react-native";

export default function RegisterPage() {
  return (
    <View style={styles.container}>
      <View style={styles.primeiraView}>
        <Text style={styles.titulo}>Carona?</Text>
      </View>

      <View style={styles.containerInputs}>
        <Text style={styles.subtitulo}>Cadastre-se</Text>
        <TextInput style={styles.textInput} placeholder="Nome" />
        <TextInput style={styles.textInput} placeholder="email" />
        <TextInput style={styles.textInput} placeholder="senha" />
      </View>

      <View style={styles.ultimaView}>
        <View style={styles.buttonView}>
        <TouchableOpacity style={styles.button} onPress={() => alert("Cadastrado!")}>
          <Text style={styles.buttonText}>Cadastrar</Text>
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
    paddingBottom:90
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
    paddingHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

});
