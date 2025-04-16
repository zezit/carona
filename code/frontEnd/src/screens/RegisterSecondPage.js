import { Ionicons } from '@expo/vector-icons';
import md5 from 'md5';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../constants';
import { useFadeSlideAnimation } from '../hooks/animations';
import useAuth from '../hooks/useAuth';
import { commonStyles } from '../theme/styles/commonStyles';

export default function RegisterSecondPage({ navigation, route }) {
  const { username, email, password } = route.params;
  const [matricula, setMatricula] = useState("");
  const [curso, setCurso] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const { registerStudent, isLoading, error, clearError } = useAuth();

  // Use our custom animation hook
  const { animatedStyle } = useFadeSlideAnimation({
    fadeStartValue: 0,
    fadeEndValue: 1,
    slideStartValue: 50,
    slideEndValue: 0,
    fadeDuration: 200,
    slideDuration: 100
  });

  // Animation for modal
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

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

  // Validate date and return true if valid, false if not
  const validateDate = () => {
    if (!day || !month || !year) {
      return { valid: false, message: "Por favor, selecione dia, mês e ano." };
    }

    try {
      // Check if it's a valid date
      const dateObj = new Date(`${year}-${month}-${day}`);
      if (dateObj.toString() === "Invalid Date") {
        return { valid: false, message: "Data inválida. Por favor, verifique dia, mês e ano." };
      }

      // Check if user is at least 16 years old
      const today = new Date();
      const birthDate = new Date(`${year}-${month}-${day}`);
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 16) {
          return { valid: false, message: "Você deve ter pelo menos 16 anos para se cadastrar." };
        }
      } else if (age < 16) {
        return { valid: false, message: "Você deve ter pelo menos 16 anos para se cadastrar." };
      }

      return { valid: true };
    } catch (e) {
      return { valid: false, message: "Data inválida. Por favor, verifique dia, mês e ano." };
    }
  };

  const handleDateSelection = () => {
    Keyboard.dismiss();

    const validation = validateDate();
    if (!validation.valid) {
      Alert.alert("Erro", validation.message);
      return;
    }

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
    setSubmissionAttempted(true);

    // Clear any previous errors
    if (clearError) clearError();

    // Validate required fields
    if (matricula === "") {
      Alert.alert("Erro", "Por favor, preencha o campo de matrícula.");
      return;
    }

    // Validate date
    const dateValidation = validateDate();
    if (!dateValidation.valid) {
      Alert.alert("Erro", dateValidation.message);
      return;
    }

    // Format data according to API requirements
    const userData = {
      nome: username,
      email: email,
      tipoUsuario: "ESTUDANTE", // Fixed as student only
      password: md5(password), // Hash the password with MD5 as required by API
      dataDeNascimento: formatDateToAPI(),
      matricula: matricula,
      curso: curso || null // Optional field
    };

    try {
      const result = await registerStudent(userData);

      if (result?.success) {
        // Show success animation before alert
        Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate('Login');
            }
          }
        ]);
      }
    } catch (err) {
      // Error is handled by the useAuth hook and will be available in the error state
      console.log("Registration error:", err);
    }
  };

  // Handle API errors
  useEffect(() => {
    if (error && submissionAttempted) {
      // Display specific errors based on error message
      let errorMessage = error;
      let errorTitle = "Erro no Cadastro";

      if (error.includes('email já está cadastrado')) {
        errorMessage = 'Este email já está cadastrado. Tente outro email ou faça login.';
        // Navigate back to first registration page to change email
        Alert.alert(errorTitle, errorMessage, [
          {
            text: "Voltar e Corrigir",
            onPress: () => navigation.goBack()
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]);
      } else if (error.includes('matrícula já está cadastrada')) {
        errorMessage = 'Esta matrícula já está cadastrada no sistema.';
        Alert.alert(errorTitle, errorMessage);
      } else if (error.includes('conexão') || error.includes('timeout')) {
        errorTitle = "Erro de Conexão";
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
        Alert.alert(errorTitle, errorMessage);
      } else {
        Alert.alert(errorTitle, errorMessage);
      }

      // Reset submission flag after showing error
      setSubmissionAttempted(false);
    }
  }, [error, submissionAttempted]);

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.headerView}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
        </TouchableOpacity>

        <Animated.Text style={[commonStyles.title, { opacity: animatedStyle.opacity }]}>
          Carona?
        </Animated.Text>

        <View style={{ width: 24 }}>
          {/* Empty Text to avoid warning */}
          <Text style={{ display: 'none' }}></Text>
        </View>
      </View>

      <Animated.View style={[commonStyles.contentView, animatedStyle]}>
        <Text style={commonStyles.subtitle}>Criar Conta</Text>

        <View style={commonStyles.progressIndicator}>
          {/* Replace View with Text components */}
          <Text style={[styles.progressElement, commonStyles.progressDot]}></Text>
          <Text style={[styles.progressElement, commonStyles.progressLine]}></Text>
          <Text style={[styles.progressElement, commonStyles.progressDot, commonStyles.activeDot]}></Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Data de Nascimento</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDateModal(true)}
            accessibilityLabel="Seletor de data de nascimento"
            accessibilityRole="button"
          >
            <Text style={day && month && year ? styles.dateText : styles.datePlaceholder}>
              {day && month && year ? formatDateToDisplay() : "Selecione sua data de nascimento"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.inputHintText}>
            Você deve ter pelo menos 16 anos para se cadastrar
          </Text>
        </View>

        <TextInput
          style={commonStyles.textInput}
          placeholder="Matrícula"
          value={matricula}
          onChangeText={setMatricula}
          accessibilityLabel="Campo de matrícula"
          keyboardType="numeric"
        />

        <TextInput
          style={commonStyles.textInput}
          placeholder="Curso (opcional)"
          value={curso}
          onChangeText={setCurso}
          accessibilityLabel="Campo de curso"
        />

        <TouchableOpacity
          style={[
            commonStyles.button,
            styles.registerButton,
            isLoading && commonStyles.buttonDisabled
          ]}
          onPress={handleCadastro}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.text.light} size="small" />
          ) : (
            <Text style={commonStyles.buttonText}>Finalizar</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showDateModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalWrapper,
              {
                opacity: modalOpacityAnim,
                transform: [{ scale: modalScaleAnim }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Data de Nascimento</Text>
              <TouchableOpacity
                onPress={() => setShowDateModal(false)}
                accessibilityLabel="Fechar seleção de data"
                accessibilityRole="button"
              >
                <Text style={styles.closeButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Dia</Text>
                <ScrollView
                  style={styles.datePickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {days.map(d => (
                    <TouchableOpacity
                      key={`day-${d}`}
                      style={[
                        styles.datePickerItem,
                        day === d && styles.datePickerItemSelected
                      ]}
                      onPress={() => setDay(d)}
                    >
                      <Text
                        style={[
                          styles.datePickerText,
                          day === d && styles.datePickerTextSelected
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerColumnMonth}>
                <Text style={styles.datePickerLabel}>Mês</Text>
                <ScrollView
                  style={styles.datePickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {months.map(m => (
                    <TouchableOpacity
                      key={`month-${m.value}`}
                      style={[
                        styles.datePickerItem,
                        month === m.value && styles.datePickerItemSelected
                      ]}
                      onPress={() => setMonth(m.value)}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.datePickerText,
                          { width: '100%' },
                          month === m.value && styles.datePickerTextSelected
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Ano</Text>
                <ScrollView
                  style={styles.datePickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {years.map(y => (
                    <TouchableOpacity
                      key={`year-${y}`}
                      style={[
                        styles.datePickerItem,
                        year === y && styles.datePickerItemSelected
                      ]}
                      onPress={() => setYear(y)}
                    >
                      <Text
                        style={[
                          styles.datePickerText,
                          year === y && styles.datePickerTextSelected
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
              style={styles.confirmButton}
              onPress={handleDateSelection}
              accessibilityLabel="Confirmar data"
              accessibilityRole="button"
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
  progressElement: {
    fontSize: 0,
    color: 'transparent',
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  inputHintText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#f9f9f9',
    marginBottom: SPACING.sm,
  },
  dateText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZE.md,
  },
  datePlaceholder: {
    color: COLORS.text.tertiary,
    fontSize: FONT_SIZE.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.lg,
  },
  modalWrapper: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  closeButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  datePickerColumn: {
    flex: 0.8,
    marginHorizontal: SPACING.xs,
  },
  datePickerColumnMonth: {
    flex: 1.4,
    marginHorizontal: SPACING.xs,
  },
  datePickerLabel: {
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    color: COLORS.text.secondary,
  },
  datePickerScroll: {
    height: 200,
    borderRadius: RADIUS.md,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  datePickerItem: {
    padding: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datePickerItemSelected: {
    backgroundColor: '#e6efff',
  },
  datePickerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  datePickerTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  confirmButtonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },
});