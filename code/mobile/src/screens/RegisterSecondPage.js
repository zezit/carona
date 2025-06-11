import React, { useState, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import md5 from 'md5';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';

// Import reusable components
import { FormInput } from '../components/form';
import { LoadingIndicator } from '../components/ui';
import { useAuthContext } from '../contexts/AuthContext';

export default function RegisterSecondPage({ navigation, route }) {
  const { username, email, password } = route.params;
  const [matricula, setMatricula] = useState('');
  const [curso, setCurso] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [errors, setErrors] = useState({});
  const { registerStudent, isLoading } = useAuthContext();

  // Animation for modal
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

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
    if (!day || !month || !year) return '';
    const monthName = months.find(m => m.value === month)?.label || month;
    return `${day} de ${monthName} de ${year}`;
  };

  const formatDateToAPI = () => {
    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
  };

  // Validate date and return true if valid, false if not
  const validateDate = () => {
    if (!day || !month || !year) {
      return { valid: false, message: 'Por favor, selecione dia, mês e ano.' };
    }

    try {
      // Check if it's a valid date
      const dateObj = new Date(`${year}-${month}-${day}`);
      if (dateObj.toString() === 'Invalid Date') {
        return { valid: false, message: 'Data inválida. Por favor, verifique dia, mês e ano.' };
      }

      // Check if user is at least 16 years old
      const today = new Date();
      const birthDate = new Date(`${year}-${month}-${day}`);
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 16) {
          return { valid: false, message: 'Você deve ter pelo menos 16 anos para se cadastrar.' };
        }
      } else if (age < 16) {
        return { valid: false, message: 'Você deve ter pelo menos 16 anos para se cadastrar.' };
      }

      return { valid: true };
    } catch (e) {
      return { valid: false, message: 'Data inválida. Por favor, verifique dia, mês e ano.' };
    }
  };

  // Form validation
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Validate matricula
    if (!matricula) {
      newErrors.matricula = 'Matrícula é obrigatória';
      isValid = false;
    }

    // Validate date
    const dateValidation = validateDate();
    if (!dateValidation.valid) {
      newErrors.date = dateValidation.message;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleDateSelection = () => {
    const validation = validateDate();
    if (!validation.valid) {
      Alert.alert('Erro', validation.message);
      return;
    }

    // Animate closing modal
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

  // Handle date picker modal open
  const openDateModal = () => {
    setShowDateModal(true);
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleFinalize = async () => {
    if (!validateForm()) return;

    // Format data according to API requirements
    const userData = {
      nome: username,
      email: email,
      tipoUsuario: 'ESTUDANTE', // Fixed as student only
      password: md5(password), // Hash the password with MD5 as required by API
      dataDeNascimento: formatDateToAPI(),
      matricula: matricula,
      curso: curso || null // Optional field
    };

    try {
      const result = await registerStudent(userData);

      if (result?.success) {
        Alert.alert(
          'Sucesso', 
          'Cadastro realizado com sucesso!', 
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (err) {
      // Error is handled by the useAuthContext hook
      console.log('Registration error:', err);
    }
  };

  if (isLoading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <LoadingIndicator text="Finalizando cadastro..." />
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
              <View style={commonStyles.progressDot} />
              <View style={[commonStyles.progressLine, styles.activeLine]} />
              <View style={[commonStyles.progressDot, commonStyles.activeDot]} />
            </View>

            <Text style={styles.formTitle}>Informações Adicionais</Text>
            <Text style={styles.formSubtitle}>Complete os dados do seu perfil estudantil</Text>

            <View style={styles.inputsContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Data de Nascimento</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={openDateModal}
                  testID="register-date-picker"
                >
                  <Text style={day && month && year ? styles.dateText : styles.datePlaceholder}>
                    {day && month && year ? formatDateToDisplay() : 'Selecione sua data de nascimento'}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={24}
                    color={COLORS.primary.main}
                  />
                </TouchableOpacity>
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
                <Text style={styles.hintText}>
                  Você deve ter pelo menos 16 anos para se cadastrar
                </Text>
              </View>

              <FormInput
                label="Matrícula"
                value={matricula}
                onChangeText={setMatricula}
                placeholder="Digite seu número de matrícula"
                keyboardType="numeric"
                icon="card"
                error={errors.matricula}
                testID="register-matricula-input"
              />

              <FormInput
                label="Curso (opcional)"
                value={curso}
                onChangeText={setCurso}
                placeholder="Digite seu curso"
                icon="school"
                testID="register-curso-input"
              />
            </View>

            <TouchableOpacity
              style={styles.finalizeButton}
              onPress={handleFinalize}
              testID="register-finalize-button"
            >
              <Text style={styles.finalizeButtonText}>Finalizar Cadastro</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date selection modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
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
              >
                <Text style={styles.modalCloseText}>Cancelar</Text>
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
              testID="register-date-confirm-button"
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  activeLine: {
    backgroundColor: COLORS.primary.main,
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
  formGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.xs,
    marginTop: 5,
  },
  hintText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: 5,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border.main,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZE.md,
  },
  datePlaceholder: {
    color: COLORS.text.tertiary,
    fontSize: FONT_SIZE.md,
  },
  finalizeButton: {
    height: 50,
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalizeButtonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.lg,
  },
  modalWrapper: {
    backgroundColor: COLORS.background.card,
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
    borderBottomColor: COLORS.border.main,
    paddingBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  modalCloseText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.danger,
    fontWeight: '600',
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
    fontWeight: '500',
    marginBottom: SPACING.sm,
    color: COLORS.text.secondary,
  },
  datePickerScroll: {
    height: 200,
    borderRadius: RADIUS.md,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: COLORS.border.main,
  },
  datePickerItem: {
    padding: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datePickerItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  datePickerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  datePickerTextSelected: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  confirmButtonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  }
});