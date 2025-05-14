import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { commonStyles } from '../../theme/styles/commonStyles';

const FormCard = ({ title, icon, iconColor, children }) => {
    return (
        <View style={[commonStyles.profileCard, styles.card]}>
            <View style={styles.cardHeader}>
                <Ionicons name={icon} size={40} color={iconColor || COLORS.primary} />
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: SPACING.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    cardTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.text.primary,
        marginLeft: SPACING.md,
    },
});

export default FormCard;