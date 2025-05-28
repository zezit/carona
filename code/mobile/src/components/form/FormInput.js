import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../constants';

/**
 * A reusable input component with label, validation, and optional icon
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - The label text to display
 * @param {string} props.value - The current value of the input
 * @param {Function} props.onChangeText - Callback when text changes
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message to display
 * @param {boolean} props.secureTextEntry - Whether the text should be secure
 * @param {string} props.icon - The Ionicons name to use
 * @param {string} props.iconColor - The color of the icon
 * @param {Object} props.style - Additional style for the container
 * @param {Object} props.inputStyle - Additional style for the input
 * @param {boolean} props.multiline - Whether the input should be multiline
 * @param {Object} props.rest - Additional props to pass to TextInput
 */
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  icon,
  iconColor = COLORS.primary.main,
  style,
  inputStyle,
  multiline = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View 
        style={[
          styles.inputContainer, 
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          multiline && styles.multilineContainer
        ]}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? iconColor : COLORS.text.secondary} 
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[
            styles.input, 
            inputStyle,
            multiline && styles.multilineInput
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          {...rest}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.toggleButton}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: SPACING.sm,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary.main,
    backgroundColor: '#FFFFFF',
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  multilineContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  multilineInput: {
    height: undefined, 
    paddingTop: SPACING.sm,
    textAlignVertical: 'top',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  toggleButton: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginTop: 4,
  },
});

export default React.memo(FormInput);