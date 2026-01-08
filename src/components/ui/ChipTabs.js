import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import theme from '../../theme/colors.js';

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
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={option.label}
        >
          <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
        </TouchableOpacity>
      );
    })}
    <View style={{ width: theme.spacing.md }} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    gap: theme.spacing.sm
  },
  chip: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    minHeight: theme.touchTarget?.minHeight || 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm
  },
  chipActive: {
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for active chips
    borderColor: theme.colors.interactive || theme.colors.error || '#DC143C',
    ...theme.shadows.md
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  labelActive: {
    color: theme.colors.white,
    fontWeight: '700'
  }
});

export default ChipTabs;

