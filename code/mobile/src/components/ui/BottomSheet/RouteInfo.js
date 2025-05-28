import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../../theme';
import { COLORS } from '../../../constants';

const RouteInfo = ({
    selectedRoute,
    routes = [],
    onSelectRoute,
    formatDuration,
    formatDistance,
}) => {

    // Default formatters if not provided
    const formatDurationText = formatDuration || ((seconds) => {
        console.debug('formatDurationText called with:', seconds);
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
        console.debug('formatDistanceText called with:', meters);
        if (!meters) return '0 km';
        const km = meters / 1000;
        return `${km.toFixed(1)} km`;
    });

    if (!selectedRoute) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {selectedRoute.descricao || 'Rota Principal'}
                </Text>
                {routes.length > 1 && onSelectRoute && (
                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => {
                            const nextRouteIndex = routes.findIndex(r => r === selectedRoute) === 0 ? 1 : 0;
                            if (routes[nextRouteIndex]) {
                                onSelectRoute(routes[nextRouteIndex]);
                            }
                        }}
                    >
                        <Ionicons name="swap-horizontal" size={16} color={COLORS.primary.main} />
                        <Text style={styles.switchText}>Alternar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.details}>
                <View style={styles.detail}>
                    <Ionicons name="time-outline" size={16} color={colors.gray[600]} />
                    <Text style={styles.detailText}>
                        {formatDurationText(selectedRoute.duracaoSegundos)}
                    </Text>
                </View>

                <View style={styles.detail}>
                    <Ionicons name="location-outline" size={16} color={colors.gray[600]} />
                    <Text style={styles.detailText}>
                        {formatDistanceText(selectedRoute.distanciaMetros)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.gray[50],
        borderRadius: radius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.gray[200],
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.semibold,
        color: colors.gray[800],
        flex: 1,
    },
    switchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[100],
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
    },
    switchText: {
        fontSize: typography.fontSizes.sm,
        marginLeft: 4,
        fontWeight: typography.fontWeights.medium,
        color: COLORS.primary.main,
    },
    details: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: typography.fontSizes.sm,
        color: colors.gray[600],
        marginLeft: 4,
        fontWeight: typography.fontWeights.medium,
    },
});

export default RouteInfo;