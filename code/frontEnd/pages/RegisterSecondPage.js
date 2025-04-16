import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal, Animated, Keyboard } from "react-native";
import React, { useState, useEffect, useRef } from 'react';
import { commonStyles } from '../styles/commonStyles';
import useAuth from '../hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

export default function RegisterSecondPage({ navigation, route }) {
  const { username, email, password } = route.params;
  const [birthDate, setBirthDate] = useState("");
  const [registration, setRegistration] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const { registerStudent, isLoading, error } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Animation for modal
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

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
  
  // Animate modal when visible changes
  useEffect(() => {
    if (showDateModal) {
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animation values when modal is closed
      modalScaleAnim.setValue(0.9);
      modalOpacityAnim.setValue(0);
    }
  }, [showDateModal]);

  // Generate arrays for day, month, and year options
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => (currentYear - i).toString());

  const formatDateToDisplay = () => {
    if (!day || !month || !year) return "";
    const monthName = months.find(m => m.value === month)?.label || month;
    return `${day} de ${monthName} de ${year}`;
  };

  const formatDateToAPI = () => {
    if (!day || !month || !year) return "";
    return `${year}-${month}-${day}`;
  };

  const handleDateSelection = () => {
    Keyboard.dismiss();
    
    if (!day || !month || !year) {
      Alert.alert("Erro", "Por favor, selecione dia, mês e ano.");
      return;
    }
    
    // Validate date
    try {
      // Check if it's a valid date
      const dateObj = new Date(`${year}-${month}-${day}`);
      if (dateObj.toString() === "Invalid Date") {
        Alert.alert("Erro", "Data inválida. Por favor, verifique dia, mês e ano.");
        return;
      }
      
      // Check if user is at least 16 years old
      const today = new Date();
      const birthDate = new Date(`${year}-${month}-${day}`);
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 16) {
          Alert.alert("Erro", "Você deve ter pelo menos 16 anos para se cadastrar.");
          return;
        }
      } else if (age < 16) {
        Alert.alert("Erro", "Você deve ter pelo menos 16 anos para se cadastrar.");
        return;
      }
    } catch (e) {
      Alert.alert("Erro", "Data inválida. Por favor, verifique dia, mês e ano.");
      return;
    }
    
    setBirthDate(formatDateToDisplay());
    
    // Close modal with animation
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowDateModal(false);
    });
  };

  const handleCadastro = async () => {
    Keyboard.dismiss();
    
    if (birthDate === "" || registration === "") {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    // Format data according to API requirements
    const userData = {
      nome: username,
      email: email,
      tipoUsuario: "ESTUDANTE", // Fixed as student only
      password: password, // Will be hashed in registerStudent
      dataDeNascimento: formatDateToAPI(),
      matricula: registration
    };

    const result = await registerStudent(userData);
    
    if (result?.success) {
      // Show success animation before alert
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
          { 
            text: "OK", 
            onPress: () => {
              navigation.navigate('Login');
            } 
          }
        ]);
      });
    }
  };

  useEffect(() => {
    if (error) {
      // Display specific errors based on error message
      let errorMessage = error;
      
      if (error.includes('email já está cadastrado')) {
        errorMessage = 'Este email já está cadastrado. Tente outro email ou faça login.';
      } else if (error.includes('matrícula já está cadastrada')) {
        errorMessage = 'Esta matrícula já está cadastrada no sistema.';
      }
      
      Alert.alert("Erro no Cadastro", errorMessage);
    }
  }, [error]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }]
  };

  // Create a custom date picker modal with improved styling
  const renderDatePickerModal = () => {
    const modalStyles = {
      modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      },
      modalWrapper: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
      },
      closeButtonText: {
        fontSize: 16,
        color: '#ff6b6b',
        fontWeight: '600'
      },
      datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
      },
      datePickerColumn: {
        flex: 0.8,
        marginHorizontal: 5
      },
      datePickerColumnMonth: {
        flex: 1.4,
        marginHorizontal: 5
      },
      datePickerLabel: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333'
      },
      datePickerScroll: {
        height: 200,
        borderRadius: 12,
        backgroundColor: '#f8f8f8'
      },
      datePickerItem: {
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
      },
      datePickerItemSelected: {
        backgroundColor: '#e6f7ff',
        borderRadius: 12
      },
      datePickerText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center'
      },
      datePickerTextSelected: {
        color: '#0066cc',
        fontWeight: 'bold'
      },
      button: {
        backgroundColor: '#0066cc',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
      }
    };

    return (
      <Modal
        visible={showDateModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={modalStyles.modalContainer}>
          <Animated.View 
            style={[
              modalStyles.modalWrapper, 
              {
                opacity: modalOpacityAnim,
                transform: [{ scale: modalScaleAnim }]
              }
            ]}
          >
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Data de Nascimento</Text>
              <TouchableOpacity 
                onPress={() => setShowDateModal(false)}
                accessibilityLabel="Fechar seleção de data"
                accessibilityRole="button"
              >
                <Text style={modalStyles.closeButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={modalStyles.datePickerContainer}>
              <View style={modalStyles.datePickerColumn}>
                <Text style={modalStyles.datePickerLabel}>Dia</Text>
                <ScrollView 
                  style={modalStyles.datePickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {days.map(d => (
                    <TouchableOpacity 
                      key={`day-${d}`}
                      style={[
                        modalStyles.datePickerItem,
                        day === d && modalStyles.datePickerItemSelected
                      ]}
                      onPress={() => setDay(d)}
                    >
                      <Text 
                        style={[
                          modalStyles.datePickerText,
                          day === d && modalStyles.datePickerTextSelected
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={modalStyles.datePickerColumnMonth}>
                <Text style={modalStyles.datePickerLabel}>Mês</Text>
                <ScrollView 
                  style={modalStyles.datePickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {months.map(m => (
                    <TouchableOpacity 
                      key={`month-${m.value}`}
                      style={[
                        modalStyles.datePickerItem,
                        month === m.value && modalStyles.datePickerItemSelected
                      ]}
                      onPress={() => setMonth(m.value)}
                    >
                      <Text 
                        numberOfLines={1}
                        style={[
                          modalStyles.datePickerText,
                          { width: '100%' },
                          month === m.value && modalStyles.datePickerTextSelected
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={modalStyles.datePickerColumn}>
                <Text style={modalStyles.datePickerLabel}>Ano</Text>
                <ScrollView 
                  style={modalStyles.datePickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {years.map(y => (
                    <TouchableOpacity 
                      key={`year-${y}`}
                      style={[
                        modalStyles.datePickerItem,
                        year === y && modalStyles.datePickerItemSelected
                      ]}
                      onPress={() => setYear(y)}
                    >
                      <Text 
                        style={[
                          modalStyles.datePickerText,
                          year === y && modalStyles.datePickerTextSelected
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <TouchableOpacity 
              style={modalStyles.button} 
              onPress={handleDateSelection}
              accessibilityLabel="Confirmar data"
              accessibilityRole="button"
            >
              <Text style={modalStyles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const enhancedInputStyle = {
    textInput: {
      ...commonStyles.textInput,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: '#f9f9f9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1
    },
    dateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 12,
      backgroundColor: '#f9f9f9'
    },
    dateInputText: {
      flex: 1,
      fontSize: 16,
      color: '#333'
    },
    calendarIcon: {
      marginLeft: 10
    },
    placeholderText: {
      color: '#999',
      fontSize: 16
    },
    selectedText: {
      color: '#333',
      fontSize: 16
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={commonStyles.container}>
        <View style={commonStyles.headerView}>
          <Animated.Text style={[commonStyles.title, { opacity: fadeAnim }]}>
            Carona?
          </Animated.Text>
        </View>

        <Animated.View style={[commonStyles.contentView, animatedStyle]}>
          <Text style={commonStyles.subtitle}>Mais Informações</Text>
          
          <View style={commonStyles.progressIndicator}>
            <View style={commonStyles.progressDot} />
            <View style={commonStyles.progressLine} />
            <View style={[commonStyles.progressDot, commonStyles.activeDot]} />
          </View>
          
          <View style={commonStyles.formGroup}>
            <Text style={commonStyles.inputLabel}>Data de Nascimento</Text>
            <TouchableOpacity 
              style={enhancedInputStyle.dateInputContainer} 
              onPress={() => setShowDateModal(true)}
              accessibilityLabel="Seletor de data de nascimento"
              accessibilityRole="button"
            >
              <Text style={birthDate ? enhancedInputStyle.selectedText : enhancedInputStyle.placeholderText}>
                {birthDate ? birthDate : "Selecione sua data de nascimento"}
              </Text>
              <MaterialIcons 
                name="date-range" 
                size={24} 
                color="#666" 
                style={enhancedInputStyle.calendarIcon} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={commonStyles.formGroup}>
            <Text style={commonStyles.inputLabel}>Matrícula</Text>
            <TextInput
              style={enhancedInputStyle.textInput}
              placeholder="Seu número de matrícula"
              value={registration}
              onChangeText={(text) => setRegistration(text)}
              accessibilityLabel="Campo de matrícula"
              keyboardType="numeric"
            />
            <Text style={commonStyles.inputHintText}>
              Apenas estudantes podem se cadastrar pelo aplicativo
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={[commonStyles.footerView, { opacity: fadeAnim }]}>
          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity 
              style={[
                commonStyles.button, 
                { 
                  backgroundColor: '#0066cc', 
                  borderRadius: 12,
                  paddingVertical: 15
                },
                isLoading && commonStyles.buttonDisabled
              ]} 
              onPress={handleCadastro}
              disabled={isLoading}
              accessibilityLabel="Botão de finalizar cadastro"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[commonStyles.buttonText, { fontSize: 16, fontWeight: 'bold' }]}>Finalizar</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
      
      {renderDatePickerModal()}
    </ScrollView>
  );
}