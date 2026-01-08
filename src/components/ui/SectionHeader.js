import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../theme/colors.js';

const SectionHeader = ({ title, actionLabel, onPress }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel ? (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.link}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg, // Increased from md - more breathing room
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.primary // Navy for section titles
  },
  link: {
    ...theme.typography.bodySmall,
    color: theme.colors.interactive || theme.colors.secondary, // Red for interactive links
    fontWeight: '600'
  }
});

export default SectionHeader;

