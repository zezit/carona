import React, { forwardRef, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import RideDateTimePicker from './RideDateTimePicker';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../../constants';
import { commonStyles } from '../../theme/styles/commonStyles';

// Create reusable FormSection component based on the profile card style
const FormSection = ({ title, icon, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
            <Ionicons name={icon} size={20} color={COLORS.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const RideFormBottomSheet = forwardRef(({
    departure,
    arrival,
    departureDate,
    onDateChange,
    setShowDatePicker,
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
    initialCarAvailableSeats
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
    
    const getArrivalTime = () => {
        if (!departureDate || !duration) return new Date();
        return new Date(departureDate.getTime() + (duration * 1000));
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
                        <FormSection title="Vagas" icon="people">
                            <View style={styles.seatsContainer}>
                                <TouchableOpacity
                                    style={styles.seatButton}
                                    onPress={() => onSeatsChange(Math.max(1, parseInt(seats, 10) - 1).toString())}
                                >
                                    <Ionicons name="remove" size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                                <Text style={styles.seatsValue}>{seats}</Text>
                                <TouchableOpacity
                                    style={styles.seatButton}
                                    onPress={() => onSeatsChange(Math.min(initialCarAvailableSeats || 4, parseInt(seats, 10) + 1).toString())}
                                >
                                    <Ionicons name="add" size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        </FormSection>

                        {/* Observations Section */}
                        <FormSection title="Observações" icon="information-circle">
                            <TextInput
                                style={styles.observationsInput}
                                placeholder="Informações adicionais para os passageiros"
                                value={observations}
                                onChangeText={onObservationsChange}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
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
                                <Text style={styles.submitButtonText}>Registrar Carona</Text>
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
    seatsValue: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.text.primary,
    },
    // Updated observations input
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
});

export default RideFormBottomSheet;
