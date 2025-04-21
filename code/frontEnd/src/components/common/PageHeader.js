import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants';

const PageHeader = ({ title, onBack }) => {
    return (
        <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={styles.headerContainer}
        >
            <View style={styles.headerView}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.light} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{title}</Text>

                <View style={{ width: 24 }}>
                    {/* Empty Text to avoid warning */}
                    <Text style={{ display: 'none' }}></Text>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        height: 150,
        paddingTop: SPACING.lg
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.text.light,
    },
});

export default PageHeader;