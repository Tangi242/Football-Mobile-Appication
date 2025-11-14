import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme/colors.js';

const EmptyState = ({ icon = 'football', title = 'Nothing yet', subtitle }) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={32} color="#94a3b8" />
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: 'center'
  }
});

export default EmptyState;

