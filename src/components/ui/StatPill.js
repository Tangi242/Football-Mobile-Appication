import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme/colors.js';

const StatPill = ({ label, value }) => (
  <View style={styles.pill}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  pill: {
    flexGrow: 1,
    minWidth: '28%',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md
  },
  value: {
    fontSize: 32, // Increased from 22 - much larger for emphasis
    fontWeight: '900', // Increased from 800 - bolder
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5 // Tighter spacing for large numbers
  },
  label: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
    fontWeight: '600'
  }
});

export default StatPill;

