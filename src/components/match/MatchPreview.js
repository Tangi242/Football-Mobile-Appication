import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';

const MatchPreview = ({ match, preview }) => {
  const navigation = useNavigation();
  if (!match) return null;

  const matchDate = dayjs(match.match_date);
  const isUpcoming = matchDate.isAfter(dayjs());

  if (!isUpcoming) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Match Preview</Text>
        <Text style={styles.subtitle}>This match has already been played</Text>
      </View>
    );
  }

  const previewData = preview || {
    keyPlayers: {
      home: ['Player 1', 'Player 2'],
      away: ['Player 3', 'Player 4']
    },
    prediction: 'A close match expected',
    form: {
      home: 'W-W-D-L-W',
      away: 'W-L-W-W-D'
    },
    headToHead: 'Teams have met 5 times. Home: 2 wins, Away: 2 wins, Draws: 1'
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.title}>Match Preview</Text>
      </View>

      <View style={styles.matchHeader}>
        <TouchableOpacity 
          style={styles.teamPreview}
          onPress={() => match.home_team && navigation.navigate('TeamProfile', { teamName: match.home_team })}
          activeOpacity={0.7}
        >
          <Image source={getFlagForTeam(match.home_team)} style={styles.teamFlag} contentFit="cover" />
          <Text style={styles.teamName} numberOfLines={1}>{match.home_team}</Text>
        </TouchableOpacity>
        <Text style={styles.vs}>vs</Text>
        <TouchableOpacity 
          style={styles.teamPreview}
          onPress={() => match.away_team && navigation.navigate('TeamProfile', { teamName: match.away_team })}
          activeOpacity={0.7}
        >
          <Image source={getFlagForTeam(match.away_team)} style={styles.teamFlag} contentFit="cover" />
          <Text style={styles.teamName} numberOfLines={1}>{match.away_team}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.matchInfo}>
        {matchDate.format('dddd, MMMM D, YYYY • HH:mm')} • {match.venue || 'TBA'}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Form</Text>
        <View style={styles.formRow}>
          <View style={styles.formTeam}>
            <Text style={styles.formLabel}>{match.home_team}</Text>
            <Text style={styles.formText}>{previewData.form.home}</Text>
          </View>
          <View style={styles.formTeam}>
            <Text style={styles.formLabel}>{match.away_team}</Text>
            <Text style={styles.formText}>{previewData.form.away}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Players</Text>
        <View style={styles.playersRow}>
          <View style={styles.playersColumn}>
            <Text style={styles.playersLabel}>{match.home_team}</Text>
            {previewData.keyPlayers.home.map((player, index) => (
              <Text key={index} style={styles.playerName}>• {player}</Text>
            ))}
          </View>
          <View style={styles.playersColumn}>
            <Text style={styles.playersLabel}>{match.away_team}</Text>
            {previewData.keyPlayers.away.map((player, index) => (
              <Text key={index} style={styles.playerName}>• {player}</Text>
            ))}
          </View>
        </View>
      </View>

      {previewData.headToHead && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Head to Head</Text>
          <Text style={styles.h2hText}>{previewData.headToHead}</Text>
        </View>
      )}

      {previewData.prediction && (
        <View style={styles.predictionCard}>
          <Ionicons name="bulb-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.predictionText}>{previewData.prediction}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm
  },
  title: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.primary
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm
  },
  teamPreview: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  teamFlag: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: theme.colors.border
  },
  teamName: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textDark,
    textAlign: 'center'
  },
  vs: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginHorizontal: theme.spacing.sm
  },
  matchInfo: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.sm
  },
  section: {
    marginBottom: theme.spacing.sm
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md
  },
  formTeam: {
    flex: 1
  },
  formLabel: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs / 2
  },
  formText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textDark,
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  playersRow: {
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  playersColumn: {
    flex: 1
  },
  playersLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs
  },
  playerName: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2
  },
  h2hText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20
  },
  predictionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundPrimary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm
  },
  predictionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textDark,
    flex: 1,
    fontStyle: 'italic'
  }
});

export default MatchPreview;


