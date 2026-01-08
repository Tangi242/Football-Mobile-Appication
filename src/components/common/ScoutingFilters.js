import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';

const FilterChip = ({ label, value, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, selected && styles.filterChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.filterText, selected && styles.filterTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ScoutingFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    position: null,
    ageMin: null,
    ageMax: null,
    goalsMin: null,
    assistsMin: null,
    league: null
  });

  const positions = ['GK', 'DF', 'MF', 'FW', 'All'];
  const ageRanges = ['18-21', '22-25', '26-30', '30+'];
  const goalRanges = ['5+', '10+', '15+', '20+'];
  const assistRanges = ['3+', '5+', '10+', '15+'];

  const updateFilter = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: filters[key] === value ? null : value
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const cleared = {
      position: null,
      ageMin: null,
      ageMax: null,
      goalsMin: null,
      assistsMin: null,
      league: null
    };
    setFilters(cleared);
    if (onFilterChange) {
      onFilterChange(cleared);
    }
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="funnel-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.title}>Scouting Filters</Text>
        </View>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Position</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {positions.map((pos) => (
            <FilterChip
              key={pos}
              label={pos}
              value={pos === 'All' ? null : pos}
              selected={filters.position === pos || (pos === 'All' && filters.position === null)}
              onPress={() => updateFilter('position', pos === 'All' ? null : pos)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Age Range</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {ageRanges.map((range) => (
            <FilterChip
              key={range}
              label={range}
              value={range}
              selected={filters.ageMin === range}
              onPress={() => updateFilter('ageMin', range)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Minimum Goals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {goalRanges.map((range) => (
            <FilterChip
              key={range}
              label={range}
              value={range}
              selected={filters.goalsMin === range}
              onPress={() => updateFilter('goalsMin', range)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Minimum Assists</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {assistRanges.map((range) => (
            <FilterChip
              key={range}
              label={range}
              value={range}
              selected={filters.assistsMin === range}
              onPress={() => updateFilter('assistsMin', range)}
            />
          ))}
        </ScrollView>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  title: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.primary
  },
  clearButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  clearText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600'
  },
  section: {
    marginBottom: theme.spacing.md
  },
  sectionLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm
  },
  chipsContainer: {
    gap: theme.spacing.sm
  },
  filterChip: {
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundPrimary,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  filterText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600'
  },
  filterTextActive: {
    color: theme.colors.white,
    fontWeight: '700'
  }
});

export default ScoutingFilters;


