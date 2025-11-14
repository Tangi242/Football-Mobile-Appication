import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import theme from '../theme/colors.js';
import { getPlayerImage } from '../constants/media.js';

const LeaderRow = ({ index, leader }) => (
  <View style={styles.row}>
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
  </View>
);

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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3
  },
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  rank: {
    width: 24,
    fontWeight: '700',
    color: theme.colors.darkGray
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12
  },
  info: {
    flex: 1
  },
  name: {
    fontWeight: '700',
    color: theme.colors.darkGray
  },
  team: {
    fontSize: 12,
    color: theme.colors.muted
  },
  value: {
    width: 32,
    textAlign: 'right',
    fontWeight: '700',
    color: theme.colors.primary,
    fontSize: 16
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.muted
  }
});

export default LeaderList;



export default LeaderList;



export default LeaderList;


import theme from '../theme/colors.js';
import { getPlayerImage } from '../constants/media.js';

const LeaderRow = ({ index, leader }) => (
  <View style={styles.row}>
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
  </View>
);

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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20
  },
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  rank: {
    width: 24,
    fontWeight: '700',
    color: theme.colors.darkGray
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12
  },
  info: {
    flex: 1
  },
  name: {
    fontWeight: '700',
    color: theme.colors.darkGray
  },
  team: {
    fontSize: 12,
    color: theme.colors.muted
  },
  value: {
    width: 32,
    textAlign: 'right',
    fontWeight: '700',
    color: theme.colors.primary,
    fontSize: 16
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.muted
  }
});

export default LeaderList;

