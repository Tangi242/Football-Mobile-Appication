import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme/colors.js';
import { getPlayerImage } from '../../constants/media.js';

const LeaderRow = ({ index, leader }) => {
  const navigation = useNavigation();
  
  const handlePress = () => {
    if (leader.id) {
      navigation.navigate('PlayerDetail', { playerId: leader.id });
    } else if (leader.player) {
      navigation.navigate('PlayerDetail', { playerName: leader.player });
    }
  };

  return (
    <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Image
        source={getPlayerImage(index)}
        style={styles.avatar}
        contentFit="cover"
        cachePolicy="disk"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {leader.player}
        </Text>
        <Text style={styles.team}>{leader.team}</Text>
      </View>
      <Text style={styles.value}>{leader.value}</Text>
    </TouchableOpacity>
  );
};

const LeaderList = ({ title, subtitle, data = [] }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {data.length
      ? data.map((leader, idx) => <LeaderRow key={`${leader.player}-${idx}`} index={idx} leader={leader} />)
      : (
        <Text style={styles.empty}>No data available yet</Text>
        )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md
  },
  header: {
    marginBottom: theme.spacing.md
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs
  },
  subtitle: {
    color: theme.colors.muted,
    ...theme.typography.caption
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  rank: {
    width: 28,
    fontWeight: '700',
    ...theme.typography.bodySmall,
    color: theme.colors.darkGray,
    textAlign: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border
  },
  info: {
    flex: 1
  },
  name: {
    fontWeight: '700',
    ...theme.typography.bodySmall,
    color: theme.colors.darkGray,
    marginBottom: theme.spacing.xs / 2
  },
  team: {
    ...theme.typography.caption,
    color: theme.colors.muted
  },
  value: {
    width: 40,
    textAlign: 'right',
    fontWeight: '700',
    color: theme.colors.primary,
    ...theme.typography.body
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.muted,
    ...theme.typography.bodySmall,
    paddingVertical: theme.spacing.lg
  }
});

export default LeaderList;

