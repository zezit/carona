import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../constants';

const ActionButton = ({
    title,
    onPress,
    isLoading = false,
    disabled = false,
    icon,
    type = 'primary', // primary, secondary, danger
    style
}) => {
    const getButtonStyle = () => {
        switch (type) {
            case 'secondary':
                return styles.secondaryButton;
            case 'danger':
                return styles.dangerButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        return styles.buttonText;
    };

    const getButtonColor = () => {
        switch (type) {
            case 'secondary':
                return COLORS.secondary;
            case 'danger':
                return COLORS.danger;
            default:
                return COLORS.primary;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                (disabled || isLoading) && styles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color={COLORS.text.light} size="small" />
            ) : (
                <View style={styles.buttonContent}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={COLORS.text.light}
                            style={styles.buttonIcon}
                        />
                    )}
                    <Text style={getTextStyle()}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: SPACING.sm,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.secondary,
    },
    dangerButton: {
        backgroundColor: COLORS.danger,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: COLORS.text.light,
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: SPACING.sm,
    }
});

export default ActionButton;