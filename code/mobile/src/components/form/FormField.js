import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { commonStyles } from '../../theme/styles/commonStyles';

const FormField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error,
  ...inputProps 
}) => {
  return (
    <View style={commonStyles.formField}>
      <Text style={commonStyles.formLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[
          commonStyles.formInput,
          error && commonStyles.formInputError
        ]}
        placeholderTextColor="#999"
        {...inputProps}
      />
      {error && (
        <Text style={commonStyles.formError}>{error}</Text>
      )}
    </View>
  );
};

export default FormField;