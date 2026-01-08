import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import EmptyState from '../../components/ui/EmptyState.js';
import useCountdown from '../../hooks/useCountdown.js';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { getUserTickets, updateTicketStatus } from '../../database/ticketDatabase.js';

const TicketItem = ({ ticket, onPress }) => {
  const { theme: appTheme } = useTheme();
  const matchDate = dayjs(ticket.match_date);
  const matchDateTime = dayjs(`${ticket.match_date}T${ticket.match_time}`);
  const now = dayjs();

  // Determine ticket status
  const getTicketStatus = () => {
    // Check if status is explicitly set
    if (ticket.status === 'used') return 'used';
    if (ticket.status === 'expired') return 'expired';

    // Auto-update status based on match date
    if (matchDateTime.isBefore(now)) {
      return 'expired';
    }
    return 'upcoming';
  };

  const ticketStatus = getTicketStatus();
  const isUpcoming = ticketStatus === 'upcoming';
  const countdown = useCountdown(isUpcoming ? matchDateTime.toISOString() : null);

  // Get status badge style
  const getStatusBadgeStyle = () => {
    switch (ticketStatus) {
      case 'upcoming':
        return {
          backgroundColor: (appTheme.colors.interactive || '#DC143C') + '20',
          borderColor: appTheme.colors.interactive || '#DC143C',
        };
      case 'used':
        return {
          backgroundColor: '#10B98120',
          borderColor: '#10B981',
        };
      case 'expired':
        return {
          backgroundColor: appTheme.colors.muted + '30',
          borderColor: appTheme.colors.muted,
        };
      default:
        return {
          backgroundColor: (appTheme.colors.interactive || '#DC143C') + '20',
          borderColor: appTheme.colors.interactive || '#DC143C',
        };
    }
  };

  const getStatusTextColor = () => {
    switch (ticketStatus) {
      case 'upcoming':
        return appTheme.colors.interactive || appTheme.colors.error || '#DC143C';
      case 'used':
        return '#10B981';
      case 'expired':
        return appTheme.colors.muted;
      default:
        return appTheme.colors.interactive || '#DC143C';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.ticketItem, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Ticket for ${ticket.match_name}`}
      accessibilityHint="Double tap to view ticket details"
    >
      <View style={styles.ticketItemHeader}>
        <View style={[styles.ticketIconContainer, { backgroundColor: (appTheme.colors.interactive || appTheme.colors.error || '#DC143C') + '20' }]}>
          <Ionicons name="ticket" size={24} color={appTheme.colors.interactive || appTheme.colors.error || '#DC143C'} />
        </View>
        <View style={styles.ticketItemInfo}>
          <Text style={[styles.ticketMatchName, { color: appTheme.colors.textDark }]} numberOfLines={1}>
            {ticket.match_name}
          </Text>
          <Text style={[styles.ticketNumber, { color: appTheme.colors.textSecondary }]}>
            {ticket.ticket_number}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={appTheme.colors.muted} />
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, getStatusBadgeStyle()]}>
        <Ionicons
          name={
            ticketStatus === 'upcoming' ? 'time-outline' :
              ticketStatus === 'used' ? 'checkmark-circle' :
                'close-circle'
          }
          size={14}
          color={getStatusTextColor()}
        />
        <Text style={[styles.statusText, { color: getStatusTextColor() }]}>
          {ticketStatus.toUpperCase()}
        </Text>
      </View>

      <View style={styles.ticketItemDetails}>
        <View style={styles.ticketDetailRow}>
          <Ionicons name="calendar" size={14} color={appTheme.colors.muted} />
          <Text style={[styles.ticketDetailText, { color: appTheme.colors.textSecondary }]}>
            {matchDate.format('MMM D, YYYY')} at {ticket.match_time}
          </Text>
        </View>
        <View style={styles.ticketDetailRow}>
          <Ionicons name="location" size={14} color={appTheme.colors.muted} />
          <Text style={[styles.ticketDetailText, { color: appTheme.colors.textSecondary }]} numberOfLines={1}>
            {ticket.venue}
          </Text>
        </View>
        <View style={styles.ticketDetailRow}>
          <Ionicons name="person" size={14} color={appTheme.colors.muted} />
          <Text style={[styles.ticketDetailText, { color: appTheme.colors.textSecondary }]}>
            {ticket.seat || 'General Admission'}
          </Text>
        </View>
        {/* Countdown Timer for Upcoming Matches */}
        {isUpcoming && !countdown.isPast && (
          <View style={styles.countdownRow}>
            <Ionicons name="hourglass-outline" size={14} color={appTheme.colors.interactive || '#DC143C'} />
            <Text style={[styles.countdownText, { color: appTheme.colors.interactive || '#DC143C' }]}>
              Match starts in: {countdown.formatted}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.ticketItemFooter}>
        <View style={[styles.ticketTypeBadge, { backgroundColor: (appTheme.colors.interactive || appTheme.colors.error || '#DC143C') + '20' }]}>
          <Text style={[styles.ticketTypeText, { color: appTheme.colors.interactive || appTheme.colors.error || '#DC143C' }]}>
            {ticket.ticket_type.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.ticketPrice, { color: appTheme.colors.interactive || appTheme.colors.error || '#DC143C' }]}>
          N${ticket.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const MyTicketsScreen = ({ navigation }) => {
  const { theme: appTheme } = useTheme();
  const { user } = useAuth();
  // No auth required - fans can view tickets using guest ID stored in AsyncStorage
  const [guestUserId, setGuestUserId] = useState(null);
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = async () => {
    try {
      if (!user) {
        setTickets([]);
        return;
      }

      const userId = user.id || user.email || 'guest';
      const userTickets = await getUserTickets(userId);

      // Update ticket statuses based on match dates
      const updatedTickets = await Promise.all(
        userTickets.map(async (ticket) => {
          const matchDateTime = dayjs(`${ticket.match_date}T${ticket.match_time}`);
          const now = dayjs();

          // Only update if status needs to change
          if (ticket.status === 'upcoming' && matchDateTime.isBefore(now)) {
            // Auto-update expired tickets
            await updateTicketStatus(ticket.id, 'expired');
            return { ...ticket, status: 'expired' };
          }
          return ticket;
        })
      );

      setTickets(updatedTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const handleTicketPress = (ticket) => {
    navigation.navigate('TicketView', { ticketId: ticket.id });
  };

  // Sort tickets by date (upcoming first, then by date descending)
  const sortedTickets = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];
    
    return [...tickets].sort((a, b) => {
      // Prioritize upcoming tickets
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
      
      // Sort by date
      const dateA = dayjs(`${a.match_date || ''}T${a.match_time || ''}`);
      const dateB = dayjs(`${b.match_date || ''}T${b.match_time || ''}`);
      
      if (dateA.isValid() && dateB.isValid()) {
        return dateA - dateB; // Upcoming first (earliest date first)
      }
      if (dateA.isValid()) return -1;
      if (dateB.isValid()) return 1;
      return 0;
    });
  }, [tickets]);

  return (
    <ScreenWrapper scrollable={false}>
      {/* Header removed - using TopNavigationBar */}

      {!user ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="person"
            title="Login to View Your Tickets"
            subtitle="Sign in to access all your purchased tickets, match details, and ticket information. Your tickets are securely stored and ready to view!"
            actionLabel="Go to Login"
            actionIcon="log-in"
            onAction={() => navigation.navigate('Login')}
            illustrationTone="red"
          />
        </View>
      ) : (
        <FlatList
          data={sortedTickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TicketItem ticket={item} onPress={() => handleTicketPress(item)} />
          )}
          contentContainerStyle={sortedTickets.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="ticket"
                messageType="tickets"
                actionLabel="Browse Matches"
                actionIcon="calendar"
                onAction={() => navigation.navigate('Tabs', { screen: 'Matches' })}
                illustrationTone="red"
              />
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 26, // Increased from 20 - larger for better hierarchy
    fontWeight: '900' // Increased from 800 - bolder
  },
  list: {
    padding: theme.spacing.sm,
    paddingBottom: theme.spacing.md
  },
  emptyList: {
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  ticketItem: {
    borderRadius: 12,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    ...theme.shadows.sm
  },
  ticketItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  ticketIconContainer: {
    width: 40, // Reduced from 48
    height: 40, // Reduced from 48
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm
  },
  ticketItemInfo: {
    flex: 1
  },
  ticketMatchName: {
    fontSize: 14, // Reduced from 16
    fontWeight: '700',
    marginBottom: 2
  },
  ticketNumber: {
    fontSize: 12
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 6,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  ticketItemDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  countdownText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    fontSize: 13,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  ticketDetailText: {
    fontSize: 13,
    flex: 1
  },
  ticketItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  ticketTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  ticketTypeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '700'
  }
});

export default MyTicketsScreen;

