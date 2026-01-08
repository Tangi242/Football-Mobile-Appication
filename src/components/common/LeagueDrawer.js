import { useEffect, useRef } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';
import { useLeagueDrawer } from '../../context/LeagueDrawerContext.js';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(width * 0.85, 360);

const getLeagueAbbreviation = (name) => {
  if (!name) return '';
  if (name.length <= 6) return name.toUpperCase();
  const words = name.split(' ');
  if (words.length === 1) {
    return name.substring(0, 4).toUpperCase();
  }
  return words.map(word => word[0]).join('').toUpperCase();
};

const LeagueDrawer = ({ leagues = [], selectedLeagueId, onSelectLeague }) => {
  const { isOpen, closeDrawer } = useLeagueDrawer();
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

  const allLeaguesOption = { id: 'all', name: 'All Matches', abbreviation: 'ALL' };

  const handleSelect = (leagueId) => {
    onSelectLeague(leagueId);
    closeDrawer();
  };

  if (!isOpen) return null;

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
          <Text style={styles.heading}>Select League</Text>
          <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={[allLeaguesOption, ...leagues]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const isSelected = selectedLeagueId === String(item.id);
            
            return (
              <TouchableOpacity
                style={[styles.leagueItem, isSelected && styles.leagueItemActive]}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={item.name || 'All Matches'}
              >
                <View style={styles.leagueContent}>
                  <View style={[styles.leagueIcon, isSelected && styles.leagueIconActive]}>
                    <Ionicons 
                      name="trophy" 
                      size={20} 
                      color={isSelected ? theme.colors.white : theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.leagueTextContainer}>
                    <Text style={[styles.leagueName, isSelected && styles.leagueNameActive]}>
                      {item.name || 'All Matches'}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    borderBottomColor: (theme.colors.interactive || theme.colors.error || '#DC143C') + '30' // Red divider
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
  listContent: {
    paddingBottom: theme.spacing.xxl
  },
  leagueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: theme.touchTarget?.minHeight || 44
  },
  leagueItemActive: {
    backgroundColor: (theme.colors.interactive || theme.colors.error || '#DC143C') + '15', // Red tint for active
    borderColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red border for active
    borderWidth: 2
  },
  leagueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  leagueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  leagueIconActive: {
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for active icon
    borderColor: theme.colors.primary
  },
  leagueTextContainer: {
    flex: 1
  },
  leagueName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary
  },
  leagueNameActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  }
});

export default LeagueDrawer;