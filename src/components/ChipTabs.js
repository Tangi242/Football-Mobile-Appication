import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import theme from '../theme/colors.js';

const ChipTabs = ({ options = [], value, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {options.map((option) => {
      const isActive = option.value === value;
      return (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.chip, isActive && styles.chipActive]}
        >
          <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
        </TouchableOpacity>
      );
    })}
    <View style={{ width: 12 }} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 8
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  label: {
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  labelActive: {
    color: theme.colors.white
  }
});

export default ChipTabs;

