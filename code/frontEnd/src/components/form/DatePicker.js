import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants';

const DatePicker = ({ 
  visible, 
  onClose, 
  onConfirm, 
  day, 
  month, 
  year,
  setDay,
  setMonth,
  setYear,
  title = "Data de Nascimento"
}) => {
  // Animation values
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  // Options
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

  // Animate modal when visible changes
  useEffect(() => {
    if (visible) {
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
      modalScaleAnim.setValue(0.9);
      modalOpacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
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
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
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
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity 
              onPress={handleClose}
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
                      style={[
                        styles.datePickerText,
                        month === m.value && styles.datePickerTextSelected,
                        styles.monthText
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
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
                        year === y && styles.datePickerTextSelected,
                        styles.yearText
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
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
            onPress={onConfirm}
            accessibilityLabel="Confirmar data"
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  monthText: {
    width: '100%',
    textAlign: 'center',
    marginHorizontal: SPACING.xs,
  },
  yearText: {
    minWidth: 60,
    textAlign: 'center',
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