import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme/colors.js';
import { placeholderImages } from '../../assets/placeholders.js';

const LeagueTable = ({ standings = [], leagueName = 'League' }) => {
  const navigation = useNavigation();
  if (!standings.length) return null;

  const handleTeamPress = (teamName) => {
    navigation.navigate('TeamProfile', { teamName });
  };

  const getTeamLogoSource = (team) => {
    if (team.team_logo || team.logo_path) {
      const logoPath = team.team_logo || team.logo_path;
      if (logoPath.startsWith('http')) {
        return { uri: logoPath };
      }
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      return { uri: `${baseUrl}${logoPath}` };
    }
    return placeholderImages.logos.namibia;
  };

  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={[styles.tableHeader, { backgroundColor: '#1F2937' }]}>
        <View style={styles.positionColumn}>
          <Text style={styles.headerText}>#</Text>
        </View>
        <View style={styles.teamColumn}>
          <Text style={styles.headerText}>Team</Text>
        </View>
        <View style={styles.playedColumn}>
          <Text style={styles.headerText}>P</Text>
        </View>
        <View style={styles.diffColumn}>
          <Text style={styles.headerText}>Diff</Text>
        </View>
        <View style={styles.pointsColumn}>
          <Text style={styles.headerText}>PTS</Text>
        </View>
      </View>

      {/* Table Rows */}
      <View>
        {standings.map((team, index) => {
          const position = index + 1;
          const isTopFour = position <= 4;
          const isPositionFive = position === 5;
          
          // Determine badge color based on position
          let badgeColor = '#6B7280'; // Gray for positions 6+
          if (isTopFour) {
            badgeColor = '#10B981'; // Green for top 4
          } else if (isPositionFive) {
            badgeColor = '#3B82F6'; // Blue for position 5
          }

          return (
            <TouchableOpacity 
              key={`${team.name || team.team_name}-${index}`} 
              style={[styles.tableRow, { borderBottomColor: theme.colors.border }]}
              onPress={() => handleTeamPress(team.name || team.team_name)}
              activeOpacity={0.7}
            >
              <View style={styles.positionColumn}>
                <View style={[styles.positionBadge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.positionText}>
                    {position}
                  </Text>
                </View>
              </View>
              <View style={styles.teamColumn}>
                <View style={styles.teamInfo}>
                  <Image
                    source={getTeamLogoSource(team)}
                    style={styles.teamLogo}
                    contentFit="contain"
                    placeholder={placeholderImages.logos.namibia}
                    transition={200}
                  />
                  <Text style={[styles.teamName, { color: theme.colors.textDark }]} numberOfLines={1}>
                    {team.name || team.team_name}
                  </Text>
                </View>
              </View>
              <View style={styles.playedColumn}>
                <Text style={[styles.statsText, { color: theme.colors.textDark }]}>
                  {team.played || 0}
                </Text>
              </View>
              <View style={styles.diffColumn}>
                <Text style={[
                  styles.diffText,
                  { color: (team.goalDifference || team.goal_difference || 0) >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {(team.goalDifference || team.goal_difference || 0) >= 0 ? '+' : ''}{team.goalDifference || team.goal_difference || 0}
                </Text>
              </View>
              <View style={styles.pointsColumn}>
                <Text style={[styles.pointsText, { color: theme.colors.textDark, fontWeight: '700' }]}>
                  {team.points || 0}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  headerText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    minHeight: 60,
    backgroundColor: theme.colors.surface,
  },
  positionColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    fontSize: 13,
    color: '#FFFFFF',
  },
  teamColumn: {
    flex: 1,
    paddingLeft: theme.spacing.sm,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  teamName: {
    ...theme.typography.body,
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  playedColumn: {
    width: 40,
    alignItems: 'center',
  },
  diffColumn: {
    width: 60,
    alignItems: 'center',
  },
  statsText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '500',
  },
  diffText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
  pointsColumn: {
    width: 50,
    alignItems: 'center',
  },
  pointsText: {
    ...theme.typography.body,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default LeagueTable;

