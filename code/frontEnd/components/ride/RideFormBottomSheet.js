import React, { forwardRef, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import RideDateTimePicker from './RideDateTimePicker';
import AddressSearchInput from '../common/AddressSearchInput';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RideFormBottomSheet = forwardRef(({
    departure,
    arrival,
    onDepartureChange,
    onArrivalChange,
    departureDate,
    onDateChange,
    showDatePicker,
    setShowDatePicker,
    seats,
    onSeatsChange,
    observations,
    onObservationsChange,
    onSubmit,
    loading,
    duration,
    hasValidRoute,
    onSelectDepartureAddress,
    onSelectArrivalAddress,
    initialCarAvailableSeats = 4
}, ref) => {
    // Snapping points with more granular control
    const snapPoints = useMemo(() => ['25%', '60%', '90%'], []);
    const scrollViewRef = useRef(null);
    
    // Handle keyboard appearance
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                // When keyboard appears, expand the bottom sheet
                if (ref && ref.current) {
                    ref.current.snapToIndex(2); // Snap to largest size
                }
                
                // Scroll to make active input visible
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollToEnd({ animated: true });
                    }
                }, 100);
            }
        );
        
        return () => {
            keyboardWillShowListener.remove();
        };
    }, []);

    const handleDateSelect = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            onDateChange('departure', selectedDate);
        }
    };

    return (
        <BottomSheet
            ref={ref}
            index={1}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            handleStyle={styles.sheetHandle}
            handleIndicatorStyle={styles.handleIndicator}
            android_keyboardInputMode="adjustResize"
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
        >
            <View style={styles.container}>
                <BottomSheetScrollView 
                    ref={scrollViewRef}
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                    contentContainerStyle={styles.scrollViewContent}
                    scrollEventThrottle={16}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.content}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
                    >
                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Ionicons name="navigate" size={20} color="#4285F4" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>Pontos de Partida e Chegada</Text>
                            </View>

                            <View style={styles.addressInputContainer}>
                                <AddressSearchInput
                                    placeholder="Local de partida"
                                    value={departure}
                                    onChangeText={onDepartureChange}
                                    onSelectAddress={onSelectDepartureAddress || ((address) => onDepartureChange(address.endereco))}
                                    iconName="location"
                                    iconColor="#4285F4"
                                    style={styles.addressInput}
                                />
                            </View>

                            <View style={styles.addressInputContainer}>
                                <AddressSearchInput
                                    placeholder="Local de chegada"
                                    value={arrival}
                                    onChangeText={onArrivalChange}
                                    onSelectAddress={onSelectArrivalAddress || ((address) => onArrivalChange(address.endereco))}
                                    iconName="location"
                                    iconColor="#34A853"
                                    style={styles.addressInput}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Ionicons name="time" size={20} color="#4285F4" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>Horário</Text>
                            </View>
                            <RideDateTimePicker
                                departureDate={departureDate}
                                arrivalDate={new Date(departureDate.getTime() + (duration || 0) * 1000)}
                                onDateChange={onDateChange}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Ionicons name="people" size={20} color="#4285F4" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>Vagas</Text>
                            </View>
                            <View style={styles.seatsContainer}>
                                <TouchableOpacity
                                    style={styles.seatButton}
                                    onPress={() => onSeatsChange(Math.max(1, parseInt(seats, 10) - 1).toString())}
                                >
                                    <Ionicons name="remove" size={20} color="#4285F4" />
                                </TouchableOpacity>
                                <Text style={styles.seatsValue}>{seats}</Text>
                                <TouchableOpacity
                                    style={styles.seatButton}
                                    onPress={() => onSeatsChange(Math.min(initialCarAvailableSeats, parseInt(seats, 10) + 1).toString())}
                                >
                                    <Ionicons name="add" size={20} color="#4285F4" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Ionicons name="information-circle" size={20} color="#4285F4" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>Observações</Text>
                            </View>
                            <TextInput
                                style={styles.observationsInput}
                                placeholder="Informações adicionais para os passageiros"
                                value={observations}
                                onChangeText={onObservationsChange}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                        
                        {/* Route information section when a route is selected */}
                        {hasValidRoute && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeaderRow}>
                                    <Ionicons name="map" size={20} color="#4285F4" style={styles.sectionIcon} />
                                    <Text style={styles.sectionTitle}>Rota Selecionada</Text>
                                </View>
                                
                                <View style={styles.routeInfoContainer}>
                                    <View style={styles.routeInfoItem}>
                                        <Ionicons name="time-outline" size={16} color="#555" />
                                        <Text style={styles.routeInfoText}>
                                            Duração estimada: {Math.floor(duration / 60)} min
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.routeInfoItem}>
                                        <Ionicons name="calendar-outline" size={16} color="#555" />
                                        <Text style={styles.routeInfoText}>
                                            Chegada prevista: {new Date(departureDate.getTime() + (duration * 1000)).toLocaleTimeString()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                        
                        {/* Add extra space at the bottom to ensure content is scrollable */}
                        <View style={styles.bottomSpacer} />
                    </KeyboardAvoidingView>
                </BottomSheetScrollView>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!hasValidRoute || loading) && styles.submitButtonDisabled
                        ]}
                        onPress={onSubmit}
                        disabled={!hasValidRoute || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="car" size={24} color="#fff" />
                                <Text style={styles.submitButtonText}>
                                    {hasValidRoute ? 'Registrar Carona' : 'Selecione os pontos de partida e chegada'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    sheetHandle: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingVertical: 10,
    },
    handleIndicator: {
        backgroundColor: '#bbb',
        width: 40,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 5,
        shadowOpacity: 0.1,
        elevation: 3,
    },
    scrollView: {
        flex: 1,
        marginBottom: 70, // Space for the bottom button
    },
    scrollViewContent: {
        paddingBottom: 30, // Extra padding at the bottom
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIcon: {
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    addressInputContainer: {
        marginBottom: 20,
        zIndex: Platform.OS === 'ios' ? 10 : undefined,
        elevation: Platform.OS === 'android' ? 10 : undefined,
    },
    addressInput: {
        marginBottom: 8,
    },
    seatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        padding: 5,
    },
    seatButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    seatsValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        width: 30,
        textAlign: 'center',
    },
    observationsInput: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    bottomSpacer: {
        height: 100, // Extra space at the bottom
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 3,
        shadowOpacity: 0.1,
        elevation: 3,
    },
    submitButton: {
        backgroundColor: '#4285F4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    submitButtonDisabled: {
        backgroundColor: '#A4C2F4',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    routeInfoContainer: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    routeInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    routeInfoText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 8,
    },
});

export default RideFormBottomSheet;
