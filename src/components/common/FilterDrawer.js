import { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';
import { useFilterDrawer } from '../../context/FilterDrawerContext.js';
import LeagueDropdown from './LeagueDropdown.js';
import SeasonDropdown from './SeasonDropdown.js';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(width * 0.85, 360);

const FilterDrawer = ({ 
  leagues = [], 
  selectedLeagueId, 
  onSelectLeague,
  seasons = [],
  selectedSeason,
  onSelectSeason
}) => {
  const { isOpen, closeDrawer } = useFilterDrawer();
  const insets = useSafeAreaInsets();
  const translate = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  useEffect(() => {
    Animated.spring(translate, {
      toValue: isOpen ? 0 : -PANEL_WIDTH,
      useNativeDriver: true,
      bounciness: 6
    }).start();
  }, [isOpen, translate]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => isOpen && gesture.dx < -5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translate.setValue(Math.max(gesture.dx, -PANEL_WIDTH));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -PANEL_WIDTH / 3) {
          closeDrawer();
        } else {
          Animated.spring(translate, {
            toValue: 0,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  // Get selected league name
  const selectedLeagueName = useMemo(() => {
    if (!leagues || !selectedLeagueId) return 'Select League';
    return leagues.find(l => String(l.id) === String(selectedLeagueId))?.name || 'Select League';
  }, [leagues, selectedLeagueId]);

  // Don't render anything if drawer is closed
  if (!isOpen) {
    return null;
  }

  return (
    <View pointerEvents="auto" style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}>
      <Pressable style={styles.backdrop} onPress={closeDrawer} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.drawer,
          {
            paddingTop: insets.top + 20,
            transform: [{ translateX: translate }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Filters</Text>
          <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* League Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select League</Text>
            <View style={styles.dropdownContainer}>
              <LeagueDropdown
                leagues={leagues}
                selectedLeagueId={selectedLeagueId}
                onSelectLeague={onSelectLeague}
                selectedLeagueName={selectedLeagueName}
              />
            </View>
          </View>

          {/* Season Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Season</Text>
            <View style={styles.dropdownContainer}>
              <SeasonDropdown
                seasons={seasons}
                selectedSeason={selectedSeason}
                onSelectSeason={onSelectSeason}
              />
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    ...theme.shadows.xl,
    zIndex: 1001
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  heading: {
    ...theme.typography.h3,
    color: theme.colors.textDark,
    fontWeight: '800'
  },
  closeButton: {
    padding: theme.spacing.xs,
    minWidth: theme.touchTarget?.minHeight || 44,
    minHeight: theme.touchTarget?.minHeight || 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1
  },
  contentContainer: {
    paddingBottom: theme.spacing.xxl
  },
  section: {
    marginBottom: theme.spacing.xl
  },
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    fontSize: 14
  },
  dropdownContainer: {
    width: '100%'
  }
});

export default FilterDrawer;

