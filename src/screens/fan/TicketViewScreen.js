import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Calendar from 'expo-calendar';
import { useTheme } from '../../context/ThemeContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import useCountdown from '../../hooks/useCountdown.js';
import { useToast } from '../../hooks/useToast.js';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { getTicketById, markTicketAddedToCalendar, updateTicketStatus } from '../../database/ticketDatabase.js';

const TicketViewScreen = ({ route, navigation }) => {
  const { ticketId } = route.params || {};
  const { theme: appTheme } = useTheme();
  const { showSuccess, showError } = useToast();
  const insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [calendarPermission, setCalendarPermission] = useState(null);
  
  // Calculate match date/time for countdown - must be done before early returns
  const matchDateTime = ticket ? dayjs(`${ticket.match_date}T${ticket.match_time}`) : null;
  const now = dayjs();
  const isUpcoming = ticket && ticket.status === 'upcoming' && matchDateTime && matchDateTime.isAfter(now);
  
  // Always call hooks at the top level - pass null when ticket is not loaded or not upcoming
  const countdown = useCountdown(isUpcoming ? matchDateTime.toISOString() : null);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const ticketData = await getTicketById(ticketId);
        if (ticketData) {
          setTicket(ticketData);
          
          // Check calendar permission
          if (Platform.OS !== 'web') {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            setCalendarPermission(status === 'granted');
          }
          
          // Auto-update ticket status if needed
          const matchDateTime = dayjs(`${ticketData.match_date}T${ticketData.match_time}`);
          const now = dayjs();
          if (ticketData.status === 'upcoming' && matchDateTime.isBefore(now)) {
            await updateTicketStatus(ticketId, 'expired');
            setTicket({ ...ticketData, status: 'expired' });
          }
        }
      } catch (error) {
        console.error('Error loading ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  const handleShare = async () => {
    if (!ticket) return;

    try {
      await Share.share({
        message: `I have a ticket for ${ticket.match_name} on ${ticket.match_date} at ${ticket.venue}. Ticket Number: ${ticket.ticket_number}`,
        title: 'My Match Ticket'
      });
    } catch (error) {
      console.error('Error sharing ticket:', error);
    }
  };

  const handleAddToCalendar = async () => {
    if (!ticket || Platform.OS === 'web') {
      showError('Calendar integration is not available on this platform.');
      return;
    }

    setAddingToCalendar(true);

    try {
      // Request calendar permissions if not granted
      if (calendarPermission === null || calendarPermission === false) {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
          showError('Calendar permission is required to add events.');
          setAddingToCalendar(false);
          return;
        }
        setCalendarPermission(true);
      }

      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];

      if (!defaultCalendar) {
        showError('No calendar available. Please set up a calendar on your device.');
        setAddingToCalendar(false);
        return;
      }

      // Create event date/time
      const matchDateTime = dayjs(`${ticket.match_date}T${ticket.match_time}`);
      const startDate = matchDateTime.toDate();
      const endDate = matchDateTime.add(2, 'hours').toDate(); // Assume 2 hour match

      // Create calendar event
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `${ticket.match_name} - Match Ticket`,
        startDate: startDate,
        endDate: endDate,
        timeZone: 'Africa/Windhoek', // Namibia timezone
        location: ticket.venue || 'TBA',
        notes: `Match Ticket\nTicket Number: ${ticket.ticket_number}\nSeat: ${ticket.seat || 'General Admission'}\nType: ${ticket.ticket_type.toUpperCase()}`,
        alarms: [
          {
            relativeOffset: -60, // 1 hour before
            method: Calendar.AlarmMethod.ALERT,
          },
          {
            relativeOffset: -15, // 15 minutes before
            method: Calendar.AlarmMethod.ALERT,
          },
        ],
      });

      // Mark ticket as added to calendar
      await markTicketAddedToCalendar(ticketId);
      setTicket({ ...ticket, added_to_calendar: 1 });

      showSuccess('Match added to your calendar!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      showError('Failed to add match to calendar. Please try again.');
    } finally {
      setAddingToCalendar(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading ticket...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!ticket) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.muted} />
          <Text style={styles.errorText}>Ticket not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const purchaseDate = dayjs(ticket.purchase_date);
  const matchDate = dayjs(ticket.match_date);
  
  // Determine ticket status
  const getTicketStatus = () => {
    if (ticket.status === 'used') return 'used';
    if (ticket.status === 'expired') return 'expired';
    if (matchDateTime && matchDateTime.isBefore(now)) return 'expired';
    return 'upcoming';
  };

  const ticketStatus = getTicketStatus();

  // Get status badge style
  const getStatusBadgeStyle = () => {
    switch (ticketStatus) {
      case 'upcoming':
        return {
          backgroundColor: 'rgba(220, 20, 60, 0.2)',
          borderColor: '#DC143C',
        };
      case 'used':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10B981',
        };
      case 'expired':
        return {
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          borderColor: '#94A3B8',
        };
      default:
        return {
          backgroundColor: 'rgba(220, 20, 60, 0.2)',
          borderColor: '#DC143C',
        };
    }
  };

  const getStatusTextColor = () => {
    switch (ticketStatus) {
      case 'upcoming':
        return '#DC143C';
      case 'used':
        return '#10B981';
      case 'expired':
        return '#94A3B8';
      default:
        return '#DC143C';
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('MyTickets')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={appTheme.colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appTheme.colors.textDark }]}>My Ticket</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-social" size={24} color={appTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ticket Card */}
        <View style={[styles.ticketCard, { backgroundColor: appTheme.colors.primary }]}>
          <View style={styles.ticketHeader}>
            <Ionicons name="ticket" size={32} color={theme.colors.white} />
            <Text style={styles.ticketLabel}>MATCH TICKET</Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.ticketStatusBadge, getStatusBadgeStyle()]}>
            <Ionicons 
              name={
                ticketStatus === 'upcoming' ? 'time' : 
                ticketStatus === 'used' ? 'checkmark-circle' : 
                'close-circle'
              } 
              size={16} 
              color={getStatusTextColor()} 
            />
            <Text style={[styles.ticketStatusText, { color: getStatusTextColor() }]}>
              {ticketStatus.toUpperCase()}
            </Text>
          </View>

          <View style={styles.ticketContent}>
            <Text style={styles.matchName}>{ticket.match_name}</Text>
            
            <View style={styles.ticketInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={18} color={theme.colors.white} />
                <Text style={styles.infoText}>{matchDate.format('dddd, MMMM D, YYYY')}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="time" size={18} color={theme.colors.white} />
                <Text style={styles.infoText}>{ticket.match_time}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="location" size={18} color={theme.colors.white} />
                <Text style={styles.infoText}>{ticket.venue}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="person" size={18} color={theme.colors.white} />
                <Text style={styles.infoText}>{ticket.seat || 'General Admission'}</Text>
              </View>
            </View>

            <View style={styles.ticketNumberContainer}>
              <Text style={styles.ticketNumberLabel}>Ticket Number</Text>
              <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
            </View>

            {/* Countdown Timer for Upcoming Matches */}
            {isUpcoming && !countdown.isPast && (
              <View style={styles.countdownContainer}>
                <Ionicons name="hourglass" size={20} color={theme.colors.white} />
                <View style={styles.countdownContent}>
                  <Text style={styles.countdownLabel}>Match starts in</Text>
                  <Text style={styles.countdownTime}>{countdown.formatted}</Text>
                  <Text style={styles.countdownSubtext}>
                    {countdown.days > 0
                      ? `${countdown.days} day${countdown.days !== 1 ? 's' : ''}, ${countdown.hours} hour${countdown.hours !== 1 ? 's' : ''}`
                      : countdown.totalHours > 0
                      ? `${countdown.totalHours} hour${countdown.totalHours !== 1 ? 's' : ''}, ${countdown.minutes} minute${countdown.minutes !== 1 ? 's' : ''}`
                      : `${countdown.minutes} minute${countdown.minutes !== 1 ? 's' : ''}, ${countdown.seconds} second${countdown.seconds !== 1 ? 's' : ''}`
                    }
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.ticketFooter}>
            <Text style={styles.ticketType}>{ticket.ticket_type.toUpperCase()}</Text>
            <Text style={styles.ticketPrice}>N${ticket.price}</Text>
          </View>
        </View>

        {/* Purchase Info */}
        <View style={[styles.infoCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: appTheme.colors.textDark }]}>Purchase Information</Text>
          <View style={styles.purchaseInfo}>
            <View style={styles.purchaseRow}>
              <Text style={[styles.purchaseLabel, { color: appTheme.colors.textSecondary }]}>Purchase Date</Text>
              <Text style={[styles.purchaseValue, { color: appTheme.colors.textDark }]}>
                {purchaseDate.format('MMMM D, YYYY')}
              </Text>
            </View>
            <View style={styles.purchaseRow}>
              <Text style={[styles.purchaseLabel, { color: appTheme.colors.textSecondary }]}>Ticket Type</Text>
              <Text style={[styles.purchaseValue, { color: appTheme.colors.textDark }]}>
                {ticket.ticket_type.charAt(0).toUpperCase() + ticket.ticket_type.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {isUpcoming && Platform.OS !== 'web' && (
          <LoadingButton
            title={ticket.added_to_calendar ? "Added to Calendar" : "Add to Calendar"}
            onPress={handleAddToCalendar}
            loading={addingToCalendar}
            disabled={addingToCalendar || ticket.added_to_calendar}
            icon={ticket.added_to_calendar ? "checkmark-circle" : "calendar"}
            iconPosition="left"
            fullWidth
            variant={ticket.added_to_calendar ? "outline" : "primary"}
            style={styles.calendarButton}
          />
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}
          onPress={() => navigation.navigate('MyTickets')}
          activeOpacity={0.7}
        >
          <Ionicons name="list" size={20} color={appTheme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: appTheme.colors.primary }]}>View All Tickets</Text>
        </TouchableOpacity>
      </ScrollView>
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
  shareButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 24
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600'
  },
  ticketCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...theme.shadows.lg
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24
  },
  ticketLabel: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2
  },
  ticketContent: {
    marginBottom: 24
  },
  matchName: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20
  },
  ticketInfo: {
    gap: 12,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  infoText: {
    color: theme.colors.white,
    fontSize: 14,
    flex: 1
  },
  ticketNumberContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  },
  ticketNumberLabel: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.9
  },
  ticketNumber: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)'
  },
  ticketType: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1
  },
  ticketPrice: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '800'
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    ...theme.shadows.md
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16
  },
  purchaseInfo: {
    gap: 12
  },
  purchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  purchaseLabel: {
    fontSize: 14
  },
  purchaseValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    ...theme.shadows.sm
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  ticketStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    marginBottom: 20,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  ticketStatusText: {
    ...theme.typography.caption,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.md,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  countdownContent: {
    flex: 1,
  },
  countdownLabel: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: 4,
  },
  countdownTime: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  countdownSubtext: {
    color: theme.colors.white,
    fontSize: 11,
    opacity: 0.8,
  },
  calendarButton: {
    marginBottom: 12,
  },
});

export default TicketViewScreen;

