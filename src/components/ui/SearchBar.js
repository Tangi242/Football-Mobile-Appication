import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import theme from '../../theme/colors.js';

const SearchBar = ({ placeholder = 'Search...', onSearch, onClear, value: controlledValue, onChangeText }) => {
  const [localValue, setLocalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : localValue;
  const setValue = isControlled ? onChangeText : setLocalValue;

  const handleChange = (text) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };

  const handleClear = () => {
    setValue('');
    if (onClear) onClear();
  };

  const handleSubmit = () => {
    if (onSearch) onSearch(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color={theme.colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          value={value}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={20} color={theme.colors.muted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm
  },
  searchIcon: {
    marginRight: theme.spacing.sm
  },
  input: {
    flex: 1,
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.sm + 2
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs
  }
});

export default SearchBar;

