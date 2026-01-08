import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';

const LeagueFilter = ({ leagues = [], selectedLeague, onSelectLeague, showAll = true }) => {
  const options = showAll 
    ? [{ id: 'all', name: 'All Leagues', icon: 'apps' }, ...leagues]
    : leagues;

  const getLeagueIcon = (leagueName) => {
    const name = leagueName?.toLowerCase() || '';
    if (name.includes('premier')) return 'trophy';
    if (name.includes('first') || name.includes('division')) return 'layers';
    if (name.includes('women') || name.includes('female')) return 'people';
    if (name.includes('youth') || name.includes('junior')) return 'school';
    return 'football';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filter by League</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((league) => {
          const isSelected = selectedLeague === (league.id || league.value || 'all');
          const leagueId = league.id || league.value || 'all';
          const leagueName = league.name || league.label || 'All Leagues';
          const icon = league.icon || getLeagueIcon(leagueName);

          return (
            <TouchableOpacity
              key={leagueId}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onSelectLeague(leagueId)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={icon} 
                size={16} 
                color={isSelected ? theme.colors.white : theme.colors.primary} 
                style={styles.icon}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {leagueName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontSize: 11
  },
  scrollContent: {
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.sm
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    gap: theme.spacing.xs
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.md
  },
  icon: {
    marginRight: -theme.spacing.xs / 2
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  chipTextActive: {
    color: theme.colors.white,
    fontWeight: '700'
  }
});

export default LeagueFilter;

