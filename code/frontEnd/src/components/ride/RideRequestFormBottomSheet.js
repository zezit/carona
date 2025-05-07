import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants';
import RideDateTimePicker from './RideDateTimePicker';

const FormSection = ({ title, icon, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
            <Ionicons name={icon} size={20} color={COLORS.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const RideRequestFormBottomSheet = forwardRef(({
     departureDate,
      onDateChange,
     observations,
     onObservationsChange,
      onSubmit,
      loading,
      duration,
      hasValidRoute,
     onSheetChange,
    //  routes = [],
    // selectedRoute,
    // onSelectRoute,
    // formatDuration,
    // formatDistance,
    // initialCarAvailableSeats,
    isEditMode = false
}, ref) => {
    const snapPoints = useMemo(() => ['25%', '50%', '60%'], []);
    const scrollViewRef = useRef(null);
    const [activeTimeMode, setActiveTimeMode] = useState('departure');
    
    const handleSheetChanges = (index) => {
        if (onSheetChange) {
            onSheetChange(index);
        }
    };
    
    const handleTimeModeSwitch = (mode) => {
        setActiveTimeMode(mode);
    };
    
    // Updated getArrivalTime function with better type checking
    const getArrivalTime = () => {
        if (!departureDate || !duration) {
            return new Date();
        }
        
        try {
            // Handle both dayjs objects and Date objects
            let dateValue;
            
            if (departureDate && typeof departureDate === 'object') {
                // Handle dayjs object
                if (departureDate.$d || departureDate.toDate) {
                    // If it's a dayjs object
                    dateValue = departureDate.$d || departureDate.toDate();
                } else {
                    // If it's a regular date object
                    dateValue = departureDate;
                }
                
                return new Date(dateValue.getTime() + (duration * 1000));
            }
            
            // Fallback to current date
            return new Date();
        } catch (error) {
            console.error('Error calculating arrival time:', error);
            return new Date();
        }
    };

    // Default formatters if not provided
    // const formatDurationText = formatDuration || ((seconds) => {
    //     if (!seconds) return '0 min';
    //     const hours = Math.floor(seconds / 3600);
    //     const minutes = Math.floor((seconds % 3600) / 60);
        
    //     if (hours > 0) {
    //         return `${hours}h ${minutes}min`;
    //     } else {
    //         return `${minutes} min`;
    //     }
    // });

    // const formatDistanceText = formatDistance || ((meters) => {
    //     if (!meters) return '0 km';
    //     const km = meters / 1000;
    //     return `${km.toFixed(1)} km`;
    // });
    
    return (
        <BottomSheet
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            handleStyle={styles.sheetHandle}
            handleIndicatorStyle={styles.handleIndicator}
            android_keyboardInputMode="adjustResize"
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            onChange={handleSheetChanges}
        >
            <View style={styles.container}>
                <BottomSheetScrollView 
                    ref={scrollViewRef}
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                    contentContainerStyle={styles.scrollViewContent}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.content}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
                    >
                        {/* Route Info Section - New */}
                        {hasValidRoute && selectedRoute && (
                            <FormSection title="Rota" icon="map">
                                <View style={styles.routeInfoContainer}>
                                    <View style={styles.routeInfoHeader}>
                                        <Text style={styles.routeInfoTitle}>
                                            {selectedRoute.descricao || 'Rota Principal'}
                                        </Text>
                                        {routes.length > 1 && (
                                            <TouchableOpacity 
                                                style={styles.routeInfoSwitch}
                                                onPress={() => {
                                                    const nextRouteIndex = routes.findIndex(r => r === selectedRoute) === 0 ? 1 : 0;
                                                    if (routes[nextRouteIndex] && onSelectRoute) {
                                                        onSelectRoute(routes[nextRouteIndex]);
                                                    }
                                                }}
                                            >
                                                <Ionicons 
                                                    name="swap-horizontal" 
                                                    size={20} 
                                                    color={COLORS.primary}
                                                />
                                                <Text style={styles.routeInfoSwitchText}>
                                                    Alternar rota
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={styles.routeInfoDetails}>
                                        <View style={styles.routeInfoDetail}>
                                            <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
                                            <Text style={styles.routeInfoText}>
                                                {formatDurationText(selectedRoute.duracaoSegundos)}
                                            </Text>
                                        </View>
                                        <View style={styles.routeInfoDetail}>
                                            <Ionicons name="navigate-outline" size={16} color={COLORS.text.secondary} />
                                            <Text style={styles.routeInfoText}>
                                                {formatDistanceText(selectedRoute.distanciaMetros)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </FormSection>
                        )}

                        {/* Time Section with toggle */}
                        <FormSection title="Horário" icon="time">
                            <View style={styles.timeTabsContainer}>
                                <TouchableOpacity 
                                    style={[styles.timeTab, activeTimeMode === 'departure' && styles.timeTabActive]} 
                                    onPress={() => handleTimeModeSwitch('departure')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.timeTabText, activeTimeMode === 'departure' && styles.timeTabTextActive]}>
                                        Hora de Partida
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.timeTab, activeTimeMode === 'arrival' && styles.timeTabActive]} 
                                    onPress={() => handleTimeModeSwitch('arrival')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.timeTabText, activeTimeMode === 'arrival' && styles.timeTabTextActive]}>
                                        Hora de Chegada
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            
                            <RideDateTimePicker
                                departureDate={departureDate}
                                arrivalDate={getArrivalTime()}
                                onDateChange={onDateChange}
                                activeMode={activeTimeMode}
                                duration={duration}
                            />
                        </FormSection>

                        {/* Seats Section */}
                        {/* <FormSection title="Vagas" icon="people">
                            <View style={styles.seatsContainer}>
                                <TouchableOpacity
                                    style={[styles.seatButton, parseInt(seats) <= 1 && styles.seatButtonDisabled]}
                                    onPress={() => onSeatsChange(Math.max(1, parseInt(seats, 10) - 1).toString())}
                                    disabled={parseInt(seats) <= 1}
                                >
                                    <Ionicons 
                                        name="remove" 
                                        size={20} 
                                        color={parseInt(seats) <= 1 ? COLORS.disabled : COLORS.primary} 
                                    />
                                </TouchableOpacity>
                                <Text style={styles.seatsValue}>{seats}</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.seatButton, 
                                        parseInt(seats) >= (initialCarAvailableSeats || 4) && styles.seatButtonDisabled
                                    ]}
                                    onPress={() => onSeatsChange(Math.min(
                                        initialCarAvailableSeats || 4, 
                                        parseInt(seats, 10) + 1).toString()
                                    )}
                                    disabled={parseInt(seats) >= (initialCarAvailableSeats || 4)}
                                >
                                    <Ionicons 
                                        name="add" 
                                        size={20} 
                                        color={parseInt(seats) >= (initialCarAvailableSeats || 4) ? COLORS.disabled : COLORS.primary} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </FormSection> */}

                        {/* Observations Section */}
                        <FormSection title="Observações" icon="information-circle">
                            <View style={styles.observationsInputContainer}>
                                <TextInput
                                    style={styles.observationsInput}
                                    placeholder="Informações adicionais para os passageiros"
                                    value={observations}
                                    onChangeText={onObservationsChange}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                                {observations.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.observationsClearButton}
                                        onPress={() => onObservationsChange('')}
                                    >
                                        <Ionicons name="close-circle" size={18} color={COLORS.text.secondary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </FormSection>
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
                                    {isEditMode ? "Salvar Alterações" : "Registrar Carona"}
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
    container: {
        flex: 1,
        backgroundColor: COLORS.card,
    },
    sheetHandle: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        paddingVertical: 10,
    },
    handleIndicator: {
        backgroundColor: COLORS.border,
        width: 40,
    },
    scrollView: {
        flex: 1,
        marginBottom: 80, // Increased space for the bottom button
    },
    scrollViewContent: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        paddingBottom: 30,
    },
    content: {
        flex: 1,
    },
    // Remove card styling from sections
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    sectionIcon: {
        marginRight: SPACING.xs,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semiBold,
        color: COLORS.text.primary,
    },
    // Make input fields wider
    input: {
        width: '100%',
        height: 48,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZE.md,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    // Updated time tabs style
    timeTabsContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.background,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    timeTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
    },
    timeTabActive: {
        backgroundColor: COLORS.card,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    timeTabText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
    },
    timeTabTextActive: {
        fontWeight: FONT_WEIGHT.semiBold,
        color: COLORS.primary,
    },
    // Updated seats control style
    seatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    seatButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    seatButtonDisabled: {
        borderColor: COLORS.disabled,
        backgroundColor: COLORS.background,
    },
    seatsValue: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.text.primary,
    },
    // Updated observations input
    observationsInputContainer: {
        position: 'relative',
        width: '100%',
    },
    observationsInput: {
        width: '100%',
        height: 100,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZE.md,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
        textAlignVertical: 'top',
    },
    observationsClearButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 4,
    },
    // Updated button container
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.card,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.disabled,
    },
    submitButtonText: {
        color: COLORS.text.light,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semiBold,
        marginLeft: SPACING.sm,
    },
    // Route info styles
    routeInfoContainer: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    routeInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    routeInfoTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semiBold,
        color: COLORS.text.primary,
    },
    routeInfoSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    routeInfoSwitchText: {
        fontSize: FONT_SIZE.sm,
        marginLeft: 4,
        fontWeight: FONT_WEIGHT.medium,
        color: COLORS.primary,
    },
    routeInfoDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    routeInfoDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.md,
        marginBottom: SPACING.xs,
    },
    routeInfoText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 48,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
    },
    clearButton: {
        padding: 4,
        marginLeft: SPACING.xs,
    },
});

export default RideRequestFormBottomSheet;
