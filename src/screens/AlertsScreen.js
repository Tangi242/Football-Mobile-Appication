import { useState } from 'react';
import { View, Text, Switch, FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext.js';
import useNotifications from '../hooks/useNotifications.js';
import EmptyState from '../components/EmptyState.js';
import ScreenWrapper from '../components/ScreenWrapper.js';
import theme from '../theme/colors.js';
import { nfaImages } from '../constants/media.js';

const AlertsScreen = () => {
  const [isSubscribed, setIsSubscribed] = useState(true);
  const { liveEvents, fixtures } = useData();
  useNotifications({ userId: null });

  const liveEntries = Object.keys(liveEvents).map((matchId) => {
    const fixture = fixtures.find((item) => item.id === Number(matchId));
    const event = liveEvents[matchId] || {};
    let description = event.last_event;
    if (!description && event.home_score !== undefined && event.away_score !== undefined) {
      description = `Score ${event.home_score} - ${event.away_score}`;
    }
    if (!description && event.status) {
      description = event.status;
    }
    return {
      ...event,
      description: description || 'Awaiting next update',
      matchId,
      teams: fixture ? `${fixture.home_team} vs ${fixture.away_team}` : `Match #${matchId}`
    };
  });

  return (
    <ScreenWrapper scrollable={false} backgroundColor={theme.colors.backgroundSecondary}>
      <View style={styles.preference}>
        <Image source={nfaImages.matchBackdrop} style={styles.preferenceImage} contentFit="cover" cachePolicy="disk" />
        <View style={styles.preferenceOverlay} />
        <View>
          <Text style={styles.title}>Match Alerts</Text>
          <Text style={styles.subtitle}>Push notifications for goals, cards and news</Text>
        </View>
        <Switch
          value={isSubscribed}
          onValueChange={setIsSubscribed}
          thumbColor={isSubscribed ? theme.colors.highlight : theme.colors.muted}
          trackColor={{ false: theme.colors.border, true: theme.colors.secondary }}
        />
      </View>

      <FlatList
        data={liveEntries}
        keyExtractor={(item) => `live-${item.matchId}`}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <Ionicons name="radio-outline" size={20} color={theme.colors.highlight} />
            <View style={styles.alertBody}>
              <Text style={styles.alertTitle}>{item.teams}</Text>
              <Text style={styles.alertMeta}>{item.description}</Text>
            </View>
            {item.minute ? <Text style={styles.minute}>{item.minute}'</Text> : null}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="notifications" title="No live alerts" subtitle="Events pushed from the PHP system will stream in real time." />
        }
        contentContainerStyle={liveEntries.length ? styles.list : styles.emptyList}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundPrimary,
    marginBottom: 16,
    overflow: 'hidden'
  },
  preferenceImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45
  },
  preferenceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary
  },
  subtitle: {
    fontSize: 14,
    color: '#e2e8f0'
  },
  alertCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
    alignItems: 'center'
  },
  alertBody: {
    marginLeft: 12,
    flex: 1
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.darkGray
  },
  alertMeta: {
    fontSize: 12,
    color: theme.colors.muted
  },
  minute: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent
  },
  list: {
    paddingBottom: 20
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center'
  }
});

export default AlertsScreen;

