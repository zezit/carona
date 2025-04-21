import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../../constants';
import { parseApiDate } from '../../utils/dateUtils';

const RideDateTimePicker = ({ departureDate, arrivalDate, onDateChange, activeMode, duration = 0 }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentMode, setCurrentMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date());
  
  // Format date for display
  const formatDate = useCallback((dateValue) => {
    if (!dateValue) return '';
    
    try {
      let date;
      
      // Handle dayjs objects
      if (dateValue && typeof dateValue === 'object' && dateValue.$d) {
        date = dateValue.$d; // Extract Date object from dayjs object
      } 
      // Handle Date objects
      else if (dateValue instanceof Date) {
        date = dateValue;
      } 
      // Handle strings/arrays/other formats through parseApiDate
      else {
        date = parseApiDate(dateValue);
      }
      
      if (!date) return 'Data inválida';
      
      const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      };
      
      return date.toLocaleString('pt-BR', options)
        .replace(',', ' às');
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Data não definida';
    }
  }, []);

  // Show date picker
  const showDatepicker = () => {
    try {
      // Get the correct initial date based on active mode
      let initialDate = new Date(); // Default to current date
      
      if (activeMode === 'departure') {
        if (departureDate) {
          // Handle dayjs objects
          if (typeof departureDate === 'object' && departureDate.$d) {
            initialDate = departureDate.$d;
          }
          // Handle Date objects
          else if (departureDate instanceof Date) {
            initialDate = departureDate;
          }
          // Try to parse other formats
          else {
            const parsed = parseApiDate(departureDate);
            if (parsed) initialDate = parsed;
          }
        }
      } else {
        if (arrivalDate) {
          // Handle dayjs objects
          if (typeof arrivalDate === 'object' && arrivalDate.$d) {
            initialDate = arrivalDate.$d;
          }
          // Handle Date objects
          else if (arrivalDate instanceof Date) {
            initialDate = arrivalDate;
          }
          // Try to parse other formats
          else {
            const parsed = parseApiDate(arrivalDate);
            if (parsed) initialDate = parsed;
          }
        }
      }
      
      setTempDate(initialDate);
      setCurrentMode('date');
      setShowPicker(true);
    } catch (error) {
      console.error("Error showing date picker:", error);
      // Fall back to current date if there's an error
      setTempDate(new Date());
      setCurrentMode('date');
      setShowPicker(true);
    }
  };

  // Handle date/time change
  const onChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);

    if (Platform.OS === 'android') {
      if (currentMode === 'date') {
        setCurrentMode('time');
      } else {
        setShowPicker(false);
        onDateChange(activeMode, currentDate);
      }
    } else {
      onDateChange(activeMode, currentDate);
    }
  };

  // Render date picker
  const renderDatePicker = () => (
    <DateTimePicker
      value={tempDate}
      mode={currentMode}
      is24Hour={true}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={onChange}
      minimumDate={new Date()}
    />
  );
  
  // Get a proper Date object regardless of input format
  const getProperDateObject = (dateInput) => {
    if (!dateInput) return new Date();
    
    try {
      // Handle dayjs objects
      if (typeof dateInput === 'object' && dateInput.$d) {
        return dateInput.$d;
      } 
      // Handle Date objects
      else if (dateInput instanceof Date) {
        return dateInput;
      } 
      // Try to parse other formats
      else {
        const parsed = parseApiDate(dateInput);
        return parsed || new Date();
      }
    } catch (error) {
      console.error("Error converting date:", error);
      return new Date();
    }
  };

  // Calculate the equivalent departure time if arrival is set
  const getEstimatedDepartureTime = () => {
    if (!arrivalDate || duration <= 0) return new Date();
    
    // First ensure we have a proper Date object
    const date = getProperDateObject(arrivalDate);
    return new Date(date.getTime() - duration * 1000);
  };

  // Process dates to ensure they are Date objects or formatted properly
  const processedDepartureDate = getProperDateObject(departureDate);
  const processedArrivalDate = getProperDateObject(arrivalDate);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={showDatepicker}
      >
        <Ionicons 
          name="calendar-outline" 
          size={24} 
          color={activeMode === 'departure' ? COLORS.primary : COLORS.success} 
        />
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateLabel}>
            {activeMode === 'departure' ? 'Horário de partida' : 'Horário de chegada'}
          </Text>
          <Text style={styles.dateValue}>
            {formatDate(activeMode === 'departure' ? processedDepartureDate : processedArrivalDate)}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>

      {/* Show estimated arrival or departure time based on active mode */}
      {duration > 0 && (
        <View style={styles.estimatedTimeContainer}>
          <Text style={styles.estimatedTimeLabel}>
            {activeMode === 'departure' 
              ? 'Chegada estimada:' 
              : 'Partida estimada:'}
          </Text>
          <Text style={styles.estimatedTimeValue}>
            {formatDate(activeMode === 'departure' ? processedArrivalDate : getEstimatedDepartureTime())}
          </Text>
        </View>
      )}

      {Platform.OS === 'ios' ? (
        <Modal
          transparent={true}
          visible={showPicker}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeMode === 'departure' ? 'Selecionar hora de partida' : 'Selecionar hora de chegada'}
                </Text>
                <TouchableOpacity 
                  style={styles.doneButton} 
                  onPress={() => {
                    setShowPicker(false);
                    onDateChange(activeMode, tempDate);
                  }}
                >
                  <Text style={styles.doneButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              {renderDatePicker()}
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && renderDatePicker()
      )}
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
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  dateLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  estimatedTimeContainer: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  estimatedTimeLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  estimatedTimeValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    paddingBottom: 20,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.text.primary,
  },
  doneButton: {
    padding: SPACING.sm,
  },
  doneButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },
});

export default RideDateTimePicker;
