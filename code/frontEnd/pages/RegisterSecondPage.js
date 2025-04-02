import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal, Animated, Keyboard } from "react-native";
import React, { useState, useEffect, useRef } from 'react';
import { commonStyles } from '../styles/commonStyles';
import useAuth from '../hooks/useAuth';

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
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1919 }, (_, i) => (currentYear - i).toString());

  const formatDateToDisplay = () => {
    if (!day || !month || !year) return "";
    return `${day}/${month}/${year}`;
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
    
    if (result.success) {
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

  // Create a custom date picker modal
  const renderDatePickerModal = () => {
    return (
      <Modal
        visible={showDateModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={commonStyles.modalContainer}>
          <Animated.View 
            style={[
              commonStyles.modalWrapper, 
              {
                opacity: modalOpacityAnim,
                transform: [{ scale: modalScaleAnim }]
              }
            ]}
          >
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>Selecione sua Data de Nascimento</Text>
              <TouchableOpacity 
                onPress={() => setShowDateModal(false)}
                accessibilityLabel="Fechar seleção de data"
                accessibilityRole="button"
              >
                <Text style={commonStyles.closeButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={commonStyles.datePickerContainer}>
              <View style={commonStyles.datePickerColumn}>
                <Text style={commonStyles.datePickerLabel}>Dia</Text>
                <ScrollView style={commonStyles.datePickerScroll}>
                  {days.map(d => (
                    <TouchableOpacity 
                      key={`day-${d}`}
                      style={[
                        commonStyles.datePickerItem,
                        day === d && commonStyles.datePickerItemSelected
                      ]}
                      onPress={() => setDay(d)}
                    >
                      <Text 
                        style={[
                          commonStyles.datePickerText,
                          day === d && commonStyles.datePickerTextSelected
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={commonStyles.datePickerColumn}>
                <Text style={commonStyles.datePickerLabel}>Mês</Text>
                <ScrollView style={commonStyles.datePickerScroll}>
                  {months.map(m => (
                    <TouchableOpacity 
                      key={`month-${m}`}
                      style={[
                        commonStyles.datePickerItem,
                        month === m && commonStyles.datePickerItemSelected
                      ]}
                      onPress={() => setMonth(m)}
                    >
                      <Text 
                        style={[
                          commonStyles.datePickerText,
                          month === m && commonStyles.datePickerTextSelected
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={commonStyles.datePickerColumn}>
                <Text style={commonStyles.datePickerLabel}>Ano</Text>
                <ScrollView style={commonStyles.datePickerScroll}>
                  {years.map(y => (
                    <TouchableOpacity 
                      key={`year-${y}`}
                      style={[
                        commonStyles.datePickerItem,
                        year === y && commonStyles.datePickerItemSelected
                      ]}
                      onPress={() => setYear(y)}
                    >
                      <Text 
                        style={[
                          commonStyles.datePickerText,
                          year === y && commonStyles.datePickerTextSelected
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
              style={commonStyles.button} 
              onPress={handleDateSelection}
              accessibilityLabel="Confirmar data"
              accessibilityRole="button"
            >
              <Text style={commonStyles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
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
          <Text style={commonStyles.subtitle}>Mais Informações</Text>
          
          <View style={commonStyles.progressIndicator}>
            <View style={commonStyles.progressDot} />
            <View style={commonStyles.progressLine} />
            <View style={[commonStyles.progressDot, commonStyles.activeDot]} />
          </View>
          
          <View style={commonStyles.formGroup}>
            <Text style={commonStyles.inputLabel}>Data de Nascimento</Text>
            <TouchableOpacity 
              style={[commonStyles.textInput, { paddingVertical: 12, justifyContent: 'center' }]} 
              onPress={() => setShowDateModal(true)}
              accessibilityLabel="Seletor de data de nascimento"
              accessibilityRole="button"
            >
              <Text style={birthDate ? commonStyles.selectedText : commonStyles.placeholderText}>
                {birthDate ? birthDate : "Selecione sua data de nascimento"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={commonStyles.formGroup}>
            <Text style={commonStyles.inputLabel}>Matrícula</Text>
            <TextInput
              style={commonStyles.textInput}
              placeholder="Seu número de matrícula"
              value={registration}
              onChangeText={(text) => setRegistration(text)}
              accessibilityLabel="Campo de matrícula"
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
                <Text style={commonStyles.buttonText}>Finalizar</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
      
      {renderDatePickerModal()}
    </ScrollView>
  );
}