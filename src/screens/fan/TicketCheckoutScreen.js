import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext.js';
// Removed useAuth - fan side doesn't require login
import { useData } from '../../context/DataContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { useToast } from '../../hooks/useToast.js';
import dayjs from '../../lib/dayjs.js';
import theme from '../../theme/colors.js';
import { insertTicket } from '../../database/ticketDatabase.js';

const TicketCheckoutScreen = ({ route, navigation }) => {
  const { matchId, ticketType = 'general' } = route.params || {};
  const { theme: appTheme } = useTheme();
  const { showSuccess, showError } = useToast();
  // No auth required - use guest ID for ticket purchases
  const getGuestUserId = () => {
    // Generate a guest ID based on device or use a simple identifier
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  const { fixtures } = useData();
  const insets = useSafeAreaInsets();
  const [processing, setProcessing] = useState(false);

  const match = useMemo(() => {
    return (fixtures || []).find(m => m.id === matchId || m.match_id === matchId);
  }, [fixtures, matchId]);

  const ticketPrices = {
    general: 50,
    vip: 150,
    premium: 300
  };

  const ticketTypeLabels = {
    general: 'General Admission',
    vip: 'VIP',
    premium: 'Premium'
  };

  const selectedPrice = ticketPrices[ticketType] || ticketPrices.general;
  const matchDate = match ? dayjs(match.match_date) : null;

  const handlePayment = async () => {
    if (!match) {
      showError('Match not found. Please try again.');
      setTimeout(() => navigation.goBack(), 1500);
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing with user feedback
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock payment success - in real app, integrate with payment gateway
      const paymentSuccess = true;

      if (paymentSuccess) {
        // Save ticket to database (no login required for fans)
        const guestUserId = getGuestUserId();
        const ticketData = {
          match_id: match.id || match.match_id,
          user_id: guestUserId,
          seat: ticketType === 'general' ? 'General Admission' : `${ticketType.toUpperCase()} Section`,
          match_name: `${match.home_team} vs ${match.away_team}`,
          match_date: matchDate.format('YYYY-MM-DD'),
          match_time: matchDate.format('HH:mm'),
          venue: match.venue || 'TBA',
          ticket_type: ticketType,
          price: selectedPrice
        };

        const ticket = await insertTicket(ticketData);

        showSuccess('Ticket purchased successfully!');

        // Navigate to ticket view screen after brief delay
        setTimeout(() => {
          navigation.replace('TicketView', { ticketId: ticket.id });
        }, 1000);
      } else {
        showError('Payment failed. Please check your payment method and try again.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      showError('Failed to process payment. Please check your connection and try again.');
      setProcessing(false);
    }
  };

  if (!match) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.muted} />
          <Text style={styles.errorText}>Match not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={appTheme.colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appTheme.colors.textDark }]}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Match Info */}
        <View style={[styles.matchCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.matchTitle, { color: appTheme.colors.textDark }]}>
            {match.home_team} vs {match.away_team}
          </Text>
          <View style={styles.matchDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color={appTheme.colors.primary} />
              <Text style={[styles.detailText, { color: appTheme.colors.textSecondary }]}>
                {matchDate.format('dddd, MMMM D, YYYY')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color={appTheme.colors.primary} />
              <Text style={[styles.detailText, { color: appTheme.colors.textSecondary }]}>
                {matchDate.format('HH:mm')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color={appTheme.colors.primary} />
              <Text style={[styles.detailText, { color: appTheme.colors.textSecondary }]}>
                {match.venue || 'Venue TBA'}
              </Text>
            </View>
          </View>
        </View>

        {/* Ticket Details */}
        <View style={[styles.ticketDetailsCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.textDark }]}>Ticket Details</Text>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: appTheme.colors.textSecondary }]}>Ticket Type</Text>
            <Text style={[styles.detailValue, { color: appTheme.colors.textDark }]}>
              {ticketTypeLabels[ticketType]}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: appTheme.colors.textSecondary }]}>Seat/Entry</Text>
            <Text style={[styles.detailValue, { color: appTheme.colors.textDark }]}>
              {ticketType === 'general' ? 'General Admission' : `${ticketType.toUpperCase()} Section`}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: appTheme.colors.textSecondary }]}>Quantity</Text>
            <Text style={[styles.detailValue, { color: appTheme.colors.textDark }]}>1</Text>
          </View>
        </View>

        {/* Price Summary */}
        <View style={[styles.priceCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.textDark }]}>Price Summary</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: appTheme.colors.textSecondary }]}>
              {ticketTypeLabels[ticketType]} Ticket
            </Text>
            <Text style={[styles.priceValue, { color: appTheme.colors.textDark }]}>N${selectedPrice}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: appTheme.colors.border }]} />

          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: appTheme.colors.textDark }]}>Total</Text>
            <Text style={[styles.totalValue, { color: appTheme.colors.primary }]}>N${selectedPrice}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.footer, { backgroundColor: appTheme.colors.surface, borderTopColor: appTheme.colors.border }]}>
        <LoadingButton
          title="Proceed to Pay"
          onPress={handlePayment}
          loading={processing}
          disabled={processing}
          icon="card"
          iconPosition="left"
          fullWidth
          style={styles.payButton}
        />
      </View>
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
    fontSize: 20,
    fontWeight: '800'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100
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
  matchCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    ...theme.shadows.md
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16
  },
  matchDetails: {
    gap: 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  detailText: {
    fontSize: 14
  },
  ticketDetailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    ...theme.shadows.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  detailLabel: {
    fontSize: 14
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  priceCard: {
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.md
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  priceLabel: {
    fontSize: 14
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    marginVertical: 12
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    ...theme.shadows.lg
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    ...theme.shadows.md
  },
  payButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700'
  }
});

export default TicketCheckoutScreen;

