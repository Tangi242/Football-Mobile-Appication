import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';

const Poll = ({ poll, onVote, showResults = true }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState(poll.results || {});

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
  const displayResults = showResults || hasVoted; // Show results if enabled or after voting

  const handleVote = (optionId) => {
    if (hasVoted) return;
    
    setSelectedOption(optionId);
    setHasVoted(true);
    
    const newResults = {
      ...results,
      [optionId]: (results[optionId] || 0) + 1
    };
    setResults(newResults);
    
    if (onVote) {
      onVote(poll.id, optionId);
    }
  };

  const getPercentage = (optionId) => {
    if (totalVotes === 0) return 0;
    return ((results[optionId] || 0) / totalVotes) * 100;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={18} color={theme.colors.primary} />
        <Text style={styles.title}>Fan Poll</Text>
      </View>
      <Text style={styles.question}>{poll.question}</Text>
      
      <View style={styles.options}>
        {poll.options.map((option, index) => {
          const percentage = displayResults ? getPercentage(option.id) : 0;
          const isSelected = selectedOption === option.id;
          const voteCount = results[option.id] || 0;
          const isLeading = displayResults && totalVotes > 0 && voteCount === Math.max(...Object.values(results));
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                hasVoted && styles.optionVoted,
                isLeading && displayResults && styles.optionLeading
              ]}
              onPress={() => handleVote(option.id)}
              disabled={hasVoted}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.text}
                  </Text>
                  {isLeading && displayResults && totalVotes > 0 && (
                    <Ionicons name="trophy" size={14} color="#F59E0B" style={styles.leadingIcon} />
                  )}
                </View>
                {displayResults && (
                  <View style={styles.resultsContainer}>
                    <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
                    {totalVotes > 0 && (
                      <Text style={styles.voteCountSmall}>({voteCount})</Text>
                    )}
                  </View>
                )}
              </View>
              {displayResults && (
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${percentage}%` },
                    isLeading && styles.progressFillLeading
                  ]} />
                </View>
              )}
              {isSelected && (
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {displayResults && totalVotes > 0 && (
        <View style={styles.resultsFooter}>
          <Ionicons name="people" size={14} color={theme.colors.muted} />
          <Text style={styles.voteCount}>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</Text>
          {!hasVoted && (
            <Text style={styles.voteHint}>Tap an option to vote</Text>
          )}
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
    marginBottom: theme.spacing.sm
  },
  title: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  question: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md
  },
  options: {
    gap: theme.spacing.sm
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundPrimary
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10'
  },
  optionVoted: {
    borderColor: theme.colors.border
  },
  optionLeading: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  optionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  leadingIcon: {
    marginLeft: theme.spacing.xs / 2,
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    marginLeft: theme.spacing.sm,
  },
  voteCountSmall: {
    ...theme.typography.tiny,
    color: theme.colors.muted,
    fontSize: 10,
  },
  optionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textDark,
    flex: 1
  },
  optionTextSelected: {
    fontWeight: '700',
    color: theme.colors.primary
  },
  percentage: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.backgroundPrimary,
    borderBottomLeftRadius: theme.borderRadius.sm,
    borderBottomRightRadius: theme.borderRadius.sm,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary
  },
  progressFillLeading: {
    backgroundColor: '#F59E0B',
  },
  resultsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  voteCount: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  voteHint: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    fontSize: 10,
    fontStyle: 'italic',
    marginLeft: theme.spacing.xs,
  }
});

export default Poll;


