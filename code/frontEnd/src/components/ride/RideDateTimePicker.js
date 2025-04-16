import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const RideDateTimePicker = ({ departureDate, arrivalDate, onDateChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentMode, setCurrentMode] = useState('date');
  const [selectedType, setSelectedType] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  
  // Use callbacks for functions that compute values instead of computing them during render
  const getArrivalTimeString = useCallback(() => {
    return arrivalDate ? arrivalDate.toLocaleString() : '';
  }, [arrivalDate]);
  
  const getDepartureTimeString = useCallback(() => {
    return departureDate ? departureDate.toLocaleString() : '';
  }, [departureDate]);

  const showDatepicker = (type) => {
    setSelectedType(type);
    setTempDate(type === 'departure' ? departureDate : arrivalDate);
    setCurrentMode('date');
    setShowPicker(true);
  };

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
        onDateChange(selectedType, currentDate);
      }
    } else {
      onDateChange(selectedType, currentDate);
    }
  };

  const renderDatePicker = () => (
    <DateTimePicker
      value={tempDate}
      mode={currentMode}
      is24Hour={true}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={onChange}
      minimumDate={
        selectedType === 'arrival' 
          ? new Date(departureDate.getTime() + 60000)
          : new Date()
      }
    />
  );

  // Get the formatted strings outside the render
  const departureTimeString = getDepartureTimeString();
  const arrivalTimeString = getArrivalTimeString();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => showDatepicker('departure')}
      >
        <Ionicons name="calendar-outline" size={24} color="#4285F4" />
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateLabel}>Partida</Text>
          <Text style={styles.dateValue}>
            {departureTimeString}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => showDatepicker('arrival')}
      >
        <Ionicons name="calendar-outline" size={24} color="#34A853" />
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateLabel}>Chegada</Text>
          <Text style={styles.dateValue}>
            {arrivalTimeString}
          </Text>
        </View>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          transparent={true}
          visible={showPicker}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.doneButton} 
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
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
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateTextContainer: {
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  doneButton: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  doneButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RideDateTimePicker;
