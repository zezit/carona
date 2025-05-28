import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DatePicker = ({ value, onDateChange, label }) => {
  const [isVisible, setIsVisible] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;

  const showDatePicker = () => {
    setIsVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideDatePicker = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.dateButton,
          { transform: [{ scale: buttonScale }] }
        ]} 
        onPress={showDatePicker}
        onPressIn={() => {
          Animated.spring(buttonScale, {
            toValue: 0.98,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8
          }).start();
        }}
      >
        <Ionicons 
          name="calendar" 
          size={20} 
          color={COLORS.text.secondary} 
        />
        <Text style={[
          styles.dateText,
          !value && styles.placeholderText
        ]}>
          {value ? format(value, 'PP', { locale: ptBR }) : 'Selecionar data'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={hideDatePicker}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1} 
          onPress={hideDatePicker}
        >
          <Animated.View 
            style={[
              styles.modalWrapper,
              {
                transform: [{
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0]
                  })
                }],
                opacity: modalAnimation
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Data de Nascimento"}</Text>
              <TouchableOpacity 
                onPress={hideDatePicker}
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
                  {/* Render day options */}
                </ScrollView>
              </View>
              
              <View style={styles.datePickerColumnMonth}>
                <Text style={styles.datePickerLabel}>Mês</Text>
                <ScrollView 
                  style={styles.datePickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Render month options */}
                </ScrollView>
              </View>
              
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Ano</Text>
                <ScrollView 
                  style={styles.datePickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Render year options */}
                </ScrollView>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={() => {
                onDateChange(value);
                hideDatePicker();
              }}
              accessibilityLabel="Confirmar data"
              accessibilityRole="button"
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.main,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.main,
  },
  dateText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  placeholderText: {
    color: COLORS.text.tertiary,
  },
  modalContainer: {
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
    borderColor: COLORS.border.main,
  },
  datePickerItem: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.main,
    transition: 'all 0.2s ease',
  },
  datePickerItemSelected: {
    backgroundColor: COLORS.primary.main + '15',
  },
  datePickerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    transition: 'all 0.2s ease',
  },
  datePickerTextSelected: {
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHT.semiBold,
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
    fontWeight: FONT_WEIGHT.semiBold,
  },
});

export default React.memo(DatePicker);