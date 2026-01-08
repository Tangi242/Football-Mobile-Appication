import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme/colors.js';
import { getFlagForTeam } from '../../utils/flags.js';
import dayjs from '../../lib/dayjs.js';

const MatchPrediction = ({ match, onSubmit, userPrediction }) => {
  const navigation = useNavigation();
  const [homeScore, setHomeScore] = useState(userPrediction?.home_score?.toString() || '');
  const [awayScore, setAwayScore] = useState(userPrediction?.away_score?.toString() || '');
  const [submitted, setSubmitted] = useState(!!userPrediction);

  const handleSubmit = () => {
    if (!homeScore || !awayScore) return;
    
    const prediction = {
      matchId: match.id,
      home_score: parseInt(homeScore),
      away_score: parseInt(awayScore)
    };
    
    setSubmitted(true);
    if (onSubmit) {
      onSubmit(prediction);
    }
  };

  const matchDate = dayjs(match.match_date);
  const isUpcoming = matchDate.isAfter(dayjs());

  if (!isUpcoming) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Match Finished</Text>
        <Text style={styles.subtitle}>Predictions are only available for upcoming matches</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.title}>Predict the Score</Text>
      </View>

      <View style={styles.matchInfo}>
        <TouchableOpacity 
          style={styles.teamSection}
          onPress={() => match.home_team && navigation.navigate('TeamProfile', { teamName: match.home_team })}
          activeOpacity={0.7}
        >
          <Image source={getFlagForTeam(match.home_team)} style={styles.teamFlag} contentFit="cover" />
          <Text style={styles.teamName} numberOfLines={1}>{match.home_team}</Text>
        </TouchableOpacity>

        <Text style={styles.vs}>vs</Text>

        <TouchableOpacity 
          style={styles.teamSection}
          onPress={() => match.away_team && navigation.navigate('TeamProfile', { teamName: match.away_team })}
          activeOpacity={0.7}
        >
          <Image source={getFlagForTeam(match.away_team)} style={styles.teamFlag} contentFit="cover" />
          <Text style={styles.teamName} numberOfLines={1}>{match.away_team}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.matchDate}>{matchDate.format('ddd, MMM D • HH:mm')}</Text>

      {!submitted ? (
        <View style={styles.predictionForm}>
          <View style={styles.scoreInputs}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Home</Text>
              <TextInput
                style={styles.scoreInput}
                value={homeScore}
                onChangeText={setHomeScore}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="0"
              />
            </View>
            <Text style={styles.dash}>-</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Away</Text>
              <TextInput
                style={styles.scoreInput}
                value={awayScore}
                onChangeText={setAwayScore}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="0"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={!homeScore || !awayScore}
            activeOpacity={0.7}
          >
            <Text style={styles.submitText}>Submit Prediction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.submittedView}>
          <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          <Text style={styles.submittedText}>Your Prediction</Text>
          <Text style={styles.predictionScore}>
            {userPrediction?.home_score || homeScore} - {userPrediction?.away_score || awayScore}
          </Text>
          <Text style={styles.submittedSubtext}>Good luck!</Text>
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
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md
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
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  teamFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  matchDate: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.md
  },
  predictionForm: {
    gap: theme.spacing.md
  },
  scoreInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md
  },
  inputContainer: {
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    fontWeight: '600'
  },
  scoreInput: {
    width: 60,
    height: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    ...theme.typography.h3,
    color: theme.colors.textDark,
    fontWeight: '700'
  },
  dash: {
    ...theme.typography.h4,
    color: theme.colors.muted,
    marginTop: theme.spacing.lg
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm
  },
  submitText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700'
  },
  submittedView: {
    alignItems: 'center',
    padding: theme.spacing.md
  },
  submittedText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm
  },
  predictionScore: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: '800',
    marginVertical: theme.spacing.sm
  },
  submittedSubtext: {
    ...theme.typography.caption,
    color: theme.colors.muted
  }
});

export default MatchPrediction;


