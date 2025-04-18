import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles } from '../../theme/styles/commonStyles';
import { COLORS, SPACING, RADIUS } from '../../constants';

const AutocompleteInput = ({
  value,
  onChangeText,
  onSelectItem,
  data,
  loading,
  error,
  placeholder,
  icon,
  iconColor,
  label,
  itemLabelKey,
  autoFocus,
  hintText,
  renderRightButton,
  containerStyle,
  listContainerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={commonStyles.formLabel}>{label}</Text>}
      
      <View style={[commonStyles.formInput, styles.inputContainer]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={iconColor || COLORS.primary} 
            style={styles.icon}
          />
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor={COLORS.text.tertiary}
          autoFocus={autoFocus}
          accessibilityLabel={label || placeholder}
          accessibilityHint="Digite para buscar endereços"
        />
        
        {renderRightButton?.()}
      </View>

      {hintText && (
        <Text style={[
          commonStyles.formError,
          error ? { color: COLORS.danger } : { color: COLORS.text.secondary }
        ]}>
          {hintText}
        </Text>
      )}

      {data.length > 0 && (
        <ScrollView 
          style={[styles.suggestionsList, listContainerStyle]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => onSelectItem(item)}
              accessibilityRole="button"
              accessibilityLabel={item[itemLabelKey]}
            >
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={COLORS.text.secondary}
                style={styles.suggestionIcon}
              />
              <Text style={styles.suggestionText}>
                {item[itemLabelKey]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = {
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 16,
    height: '100%',
  },
  suggestionsList: {
    maxHeight: 200,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionIcon: {
    marginRight: SPACING.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
  },
};

export default AutocompleteInput;