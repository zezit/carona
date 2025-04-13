import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect,useState } from "react";
import { apiClient } from "../api/apiClient";
import { useAuthContext } from "../contexts/AuthContext";
const RidesPage = ({ navigation }) => {
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { user, logout, authToken } = useAuthContext();
  const [userDetails, setUserDetails] = useState(null);
  const [isDriverProfile, setIsDriverProfile] = useState(false);
   const [loading, setLoading] = useState(true);
  

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    fetchUserDetails();
  }, []);

  // Update after navigation back
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserDetails();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUserDetails = async () => {
    try {
      if (!user?.id) {
        console.log("No user ID available to fetch profile");
        setLoading(false);
        return;
      }

      const options = {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      };

      // Fetch student details
      const response = await apiClient.get(`/estudante/${user.id}`, options);

      if (response.success) {
        setUserDetails(response.data);

        try {
          const driverResponse = await apiClient.get(`/estudante/${user.id}/motorista`, options);

          if (driverResponse.success) {
            setIsDriverProfile(true);
          } else {
            setIsDriverProfile(false);
          }
        } catch (err) {
          console.log(
            "User doesn't have a driver profile yet or there was an error:",
            err.message
          );

          // Check if the error is because the user is not a driver (HTTP 400 with specific message)
          if (
            err.response &&
            err.response.status === 400 &&
            (err.response.data?.message?.includes("não é motorista") ||
              err.response.data?.error?.includes("não é motorista"))
          ) {
            console.log("User is not a driver yet");
          } else {
            console.error("Error fetching driver profile:", err);
          }

          setIsDriverProfile(false);
         
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

 
  const  handleRegisterCarpool = () => {
    navigation.navigate('RegisterRide');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Caronas</Text>
      </View>
      {isDriverProfile&& <View style={styles.caronaCard}>
      <View style={styles.textView}>
       <Text style={styles.tituloCard}>Motorista?</Text>
       <Text style={styles.subtitle}>Espaço extra no carro? Ofereça uma carona e garanta já uma rendinha extra!</Text>
       </View>
        
        <View style={styles.buttonView}>
        <TouchableOpacity style={styles.createRideButton}
        onPress={handleRegisterCarpool}>
          
          <Ionicons
            name="car-outline"
            size={24}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.createRideButtonText}>
            Registrar nova carona
          </Text>
          
        </TouchableOpacity>
        </View>
      
      </View>}

      <View style={styles.caronaCard}>
      <View style={styles.textView}>
       <Text style={styles.tituloCard}>Passageiro?</Text>
       <Text style={styles.subtitle}>Precisando de carona? Solicite uma viagem!</Text>
       </View>
        
        <View style={styles.buttonView}>
        <TouchableOpacity style={styles.askRideButton}>
          
          <Ionicons
            name="car-outline"
            size={24}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.createRideButtonText}>
            Solicitar viagem
          </Text>
          
        </TouchableOpacity>
       
      
      </View>
      </View>
        {
          !isDriverProfile &&<View style={styles.viewVazia}></View>
        }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#4285F4",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  createRideButton: {
    backgroundColor: "#4285F4",
    width: "full",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    margin:10,
  },
  askRideButton:{
    backgroundColor: '#34A853',
    width: "full",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    margin:10,
  },
  createRideButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    
  },
  caronaCard:{
    flex:1,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal:20,
    
    
  },
  tituloCard:{
   margin:10,
    width:"full",
    fontSize:24,
  },
  subtitle:{
    margin:10,
    fontSize:15,
  },
  textView:{
    flex:1,
  },
  buttonView:{
  flex:1,
  justifyContent:"flex-end"
  },
  viewVazia:{
    flex:1,
  }
});

export default RidesPage;