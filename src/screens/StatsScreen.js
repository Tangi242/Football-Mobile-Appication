import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useData } from '../context/DataContext.js';
import ScreenWrapper from '../components/ScreenWrapper.js';
import SegmentedControl from '../components/SegmentedControl.js';
import ChipTabs from '../components/ChipTabs.js';
import StandingsPanel from '../components/StandingsPanel.js';
import LeaderList from '../components/LeaderList.js';
import MatchListCard from '../components/MatchListCard.js';
import EmptyState from '../components/EmptyState.js';
import theme from '../theme/colors.js';

const StatsScreen = () => {
  const { leagues, leaders, results, fixtures } = useData();
  const tabs = ['Standings', 'Top Scorers', 'Assists', 'Discipline', 'Fixtures'];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [leagueFilter, setLeagueFilter] = useState('all');

  const standingsMap = useMemo(() => {
    const map = {};
    results?.forEach((match) => {
      const key = String(match.league_id || 'other');
      if (!map[key]) map[key] = {};
      const registerTeam = (teamName) => {
        if (!map[key][teamName]) {
          map[key][teamName] = { name: teamName, played: 0, points: 0 };
        }
      };
      registerTeam(match.home_team);
      registerTeam(match.away_team);
      map[key][match.home_team].played += 1;
      map[key][match.away_team].played += 1;
      if (match.home_score > match.away_score) {
        map[key][match.home_team].points += 3;
      } else if (match.home_score < match.away_score) {
        map[key][match.away_team].points += 3;
      } else {
        map[key][match.home_team].points += 1;
        map[key][match.away_team].points += 1;
      }
    });
    Object.keys(map).forEach((key) => {
      map[key] = Object.values(map[key]).sort((a, b) => b.points - a.points);
    });
    return map;
  }, [results]);

  const standingsOptions = useMemo(() => {
    const base = [{ label: 'All', value: 'all' }];
    const mapped =
      leagues?.map((league) => ({
        label: league.name,
        value: String(league.id)
      })) || [];
    return [...base, ...mapped];
  }, [leagues]);

  const standingsToShow = useMemo(() => {
    if (leagueFilter === 'all') {
      const first = standingsMap[Object.keys(standingsMap)[0]];
      return first || [];
    }
    return standingsMap[leagueFilter] || [];
  }, [leagueFilter, standingsMap]);

  const renderFixtures = () => {
    if (!fixtures?.length) {
      return <EmptyState icon="calendar" title="No fixtures" subtitle="Upcoming fixtures will appear here." />;
    }
    return (
      <FlatList
        data={fixtures.slice(0, 6)}
        keyExtractor={(item) => `stats-fixture-${item.id}`}
        renderItem={({ item }) => <MatchListCard match={item} />}
        contentContainerStyle={styles.list}
      />
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Standings':
        return (
          <View>
            <ChipTabs options={standingsOptions} value={leagueFilter} onChange={setLeagueFilter} />
            <StandingsPanel standings={standingsToShow} />
          </View>
        );
      case 'Top Scorers':
        return (
          <LeaderList title="Top Scorers" subtitle="Goals leaders" data={leaders?.goals || []} />
        );
      case 'Assists':
        return (
          <LeaderList title="Top Assists" subtitle="Creative maestros" data={leaders?.assists || []} />
        );
      case 'Discipline':
        return (
          <View>
            <LeaderList title="Yellow Cards" subtitle="Most cautions" data={leaders?.yellows || []} />
            <LeaderList title="Red Cards" subtitle="Dismissals" data={leaders?.reds || []} />
          </View>
        );
      case 'Fixtures':
        return renderFixtures();
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Statistics Hub</Text>
      <Text style={styles.subheading}>League tables, leaders and form</Text>
      <SegmentedControl options={tabs} value={activeTab} onChange={setActiveTab} />
      <View style={styles.section}>{renderTabContent()}</View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    gap: 16
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textDark
  },
  subheading: {
    color: theme.colors.muted,
    marginBottom: 6
  },
  section: {
    width: '100%'
  },
  list: {
    paddingBottom: 20
  }
});

export default StatsScreen;

