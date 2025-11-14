import { View, Text, StyleSheet } from 'react-native';
import theme from '../theme/colors.js';

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
    padding: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.primary
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4
  },
  label: {
    fontSize: 12,
    color: theme.colors.highlight,
    letterSpacing: 0.5
  }
});

export default StatPill;

