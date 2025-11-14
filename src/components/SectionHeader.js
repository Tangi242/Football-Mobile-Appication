import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../theme/colors.js';

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
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary
  },
  link: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600'
  }
});

export default SectionHeader;

