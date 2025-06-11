import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { 
    FormSection, 
    RouteInfo, 
    SeatSelector, 
    ObservationsInput, 
    SubmitButton 
} from '../ui/BottomSheet';
import RideDateTimePicker from './RideDateTimePicker';
import { COLORS } from '../../constants';

const RideFormBottomSheet = forwardRef(({
    departureDate,
    onDateChange,
    seats,
    onSeatsChange,
    observations,
    onObservationsChange,
    onSubmit,
    loading,
    duration,
    hasValidRoute,
    onSheetChange,
    routes = [],
    selectedRoute,
    onSelectRoute,
    formatDuration,
    formatDistance,
    initialCarAvailableSeats,
    isEditMode = false
}, ref) => {
    const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);
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
    const formatDurationText = formatDuration || ((seconds) => {
        if (!seconds) return '0 min';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        } else {
            return `${minutes} min`;
        }
    });

    const formatDistanceText = formatDistance || ((meters) => {
        if (!meters) return '0 km';
        const km = meters / 1000;
        return `${km.toFixed(1)} km`;
    });
    
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
                        {/* Route Info Section */}
                        {hasValidRoute && selectedRoute && (
                            <FormSection title="Rota" icon="map-outline">
                                <RouteInfo
                                    selectedRoute={selectedRoute}
                                    routes={routes}
                                    onSelectRoute={onSelectRoute}
                                    formatDuration={formatDuration}
                                    formatDistance={formatDistance}
                                />
                            </FormSection>
                        )}

                        {/* Time Section */}
                        <FormSection title="Horário" icon="time-outline">
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
                                testID="date-picker"
                            />
                        </FormSection>

                        {/* Seats Section */}
                        <FormSection title="Vagas" icon="people-outline">
                            <SeatSelector
                                seats={parseInt(seats, 10)}
                                onSeatsChange={(newSeats) => onSeatsChange(newSeats.toString())}
                                maxSeats={initialCarAvailableSeats || 8}
                                minSeats={1}
                                testID="seats-input"
                            />
                        </FormSection>

                        {/* Observations Section */}
                        <FormSection title="Observações" icon="chatbubble-outline">
                            <ObservationsInput
                                value={observations}
                                onChangeText={onObservationsChange}
                                placeholder="Informações adicionais para os passageiros"
                                testID="observations-input"
                            />
                        </FormSection>
                    </KeyboardAvoidingView>
                </BottomSheetScrollView>

                <SubmitButton
                    onPress={onSubmit}
                    loading={loading}
                    disabled={!hasValidRoute}
                    title="Registrar Carona"
                    icon="car-outline"
                    isEditMode={isEditMode}
                    testID="submit-ride-button"
                />
            </View>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.card,
    },
    sheetHandle: {
        backgroundColor: COLORS.background.light,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
    },
    handleIndicator: {
        backgroundColor: colors.gray[300],
        width: 40,
        height: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 100,
    },
    content: {
        padding: spacing.lg,
    },
    timeTabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.gray[100],
        borderRadius: radius.lg,
        padding: 4,
        marginBottom: spacing.md,
    },
    timeTab: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
    },
    timeTabActive: {
        backgroundColor: COLORS.background.light,
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    timeTabText: {
        fontSize: typography.fontSizes.sm,
        fontWeight: typography.fontWeights.medium,
        color: colors.gray[600],
    },
    timeTabTextActive: {
        fontWeight: typography.fontWeights.semibold,
        color: COLORS.primary.main,
    },
});

export default RideFormBottomSheet;
