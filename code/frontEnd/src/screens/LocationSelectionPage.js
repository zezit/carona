import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants';
import { commonStyles } from '../theme/styles/commonStyles';
import { AddressSearchInput } from '../components/common';

const LocationSelectionPage = ({ navigation }) => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureLocation, setDepartureLocation] = useState(null);
  const [arrivalLocation, setArrivalLocation] = useState(null);
  const [activeInput, setActiveInput] = useState('departure'); // Track which input is active

  const handleSelectDepartureAddress = (address) => {
    setDeparture(address.endereco);
    setDepartureLocation({
      latitude: address.latitude,
      longitude: address.longitude
    });
    // Automatically focus on arrival input after selecting departure
    setActiveInput('arrival');
  };

  const handleSelectArrivalAddress = (address) => {
    setArrival(address.endereco);
    setArrivalLocation({
      latitude: address.latitude,
      longitude: address.longitude
    });
    // Close focus after selecting arrival
    setActiveInput('none');
  };

  const handleSwitchLocations = () => {
    if (departure && arrival) {
      setDeparture(arrival);
      setArrival(departure);
      setDepartureLocation(arrivalLocation);
      setArrivalLocation(departureLocation);
    }
  };

  const isNextButtonEnabled = departureLocation && arrivalLocation;

  const handleNextPress = () => {
    if (isNextButtonEnabled) {
      navigation.navigate('RegisterRide', {
        departureLocation,
        departure,
        arrivalLocation,
        arrival
      });
    }
  };

  // Handle focus on departure input
  const handleFocusDeparture = () => {
    setActiveInput('departure');
  };

  // Handle focus on arrival input
  const handleFocusArrival = () => {
    setActiveInput('arrival');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selecionar Locais</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Unified Panel for Inputs */}
        <View style={styles.unifiedPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Sua Viagem</Text>
          </View>

          <View style={styles.inputsWrapper}>
            {/* Departure and arrival icons on the left */}
            <View style={styles.locationIcons}>
              <View style={[styles.iconContainer, activeInput === 'departure' && styles.activeIconContainer]}>
                <View style={[styles.locationIcon, styles.departureIcon]}>
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.connector} />
              <View style={[styles.iconContainer, activeInput === 'arrival' && styles.activeIconContainer]}>
                <View style={[styles.locationIcon, styles.arrivalIcon]}>
                  <Ionicons name="navigate" size={16} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Inputs on the right */}
            <View style={styles.addressInputs}>
              {/* Departure Input */}
              <TouchableOpacity 
                style={[
                  styles.inputWrapper, 
                  activeInput === 'departure' && styles.activeInputWrapper
                ]}
                onPress={handleFocusDeparture}
                activeOpacity={0.7}
              >
                <Text style={styles.inputLabel}>Local de Partida</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="De onde você está saindo?"
                    value={departure}
                    onChangeText={setDeparture}
                    onFocus={handleFocusDeparture}
                    placeholderTextColor={COLORS.text.tertiary}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.inputDivider} />

              {/* Arrival Input */}
              <TouchableOpacity 
                style={[
                  styles.inputWrapper, 
                  activeInput === 'arrival' && styles.activeInputWrapper
                ]}
                onPress={handleFocusArrival}
                activeOpacity={0.7}
              >
                <Text style={styles.inputLabel}>Local de Destino</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Para onde você vai?"
                    value={arrival}
                    onChangeText={setArrival}
                    onFocus={handleFocusArrival}
                    placeholderTextColor={COLORS.text.tertiary}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch button inside the panel */}
          <TouchableOpacity 
            style={[
              styles.switchButton,
              (!departure || !arrival) && styles.switchButtonDisabled
            ]}
            onPress={handleSwitchLocations}
            disabled={!departure || !arrival}
          >
            <Ionicons 
              name="swap-vertical" 
              size={22} 
              color={departure && arrival ? COLORS.primary : COLORS.disabled}
            />
          </TouchableOpacity>
        </View>

        {/* Suggestions Panel */}
        {activeInput !== 'none' && (
          <View style={styles.suggestionsPanel}>
            {activeInput === 'departure' ? (
              <AddressSearchInput
                value={departure}
                onChangeText={setDeparture}
                onSelectAddress={handleSelectDepartureAddress}
                hideInput={true} // Don't show another input, just suggestions
                autoFocus={false}
              />
            ) : (
              <AddressSearchInput
                value={arrival}
                onChangeText={setArrival}
                onSelectAddress={handleSelectArrivalAddress}
                hideInput={true} // Don't show another input, just suggestions
                autoFocus={false}
              />
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isNextButtonEnabled && styles.nextButtonDisabled
          ]}
          onPress={handleNextPress}
          disabled={!isNextButtonEnabled}
        >
          <Text style={styles.nextButtonText}>Próximo</Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={COLORS.text.light} 
            style={styles.nextButtonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    height: 140,
    paddingTop: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.light,
  },
  content: {
    flex: 1,
    marginTop: -50,
    paddingHorizontal: SPACING.lg,
  },
  unifiedPanel: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  panelHeader: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelTitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  inputsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  locationIcons: {
    width: 36,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.round,
  },
  activeIconContainer: {
    backgroundColor: COLORS.primaryLight + '30', // semi-transparent primary color
  },
  locationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  departureIcon: {
    backgroundColor: COLORS.primary,
  },
  arrivalIcon: {
    backgroundColor: COLORS.secondary,
  },
  connector: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  addressInputs: {
    flex: 1,
  },
  inputWrapper: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  activeInputWrapper: {
    backgroundColor: COLORS.primaryLight + '15', // very light primary color
  },
  inputLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 30,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    padding: 0,
  },
  inputDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  suggestionsPanel: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchButton: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.xl + SPACING.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  switchButtonDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: COLORS.text.light,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginRight: SPACING.xs,
  },
  nextButtonIcon: {
    marginLeft: SPACING.xs,
  },
});

export default LocationSelectionPage;