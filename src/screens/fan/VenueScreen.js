import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLanguage } from '../../context/LanguageContext.js';
import { t } from '../../i18n/locales.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import theme from '../../theme/colors.js';
import { placeholderImages } from '../../assets/placeholders.js';
import { onlineImages } from '../../assets/onlineImages.js';

const VenueScreen = ({ route, navigation }) => {
  const { venueName = 'Independence Stadium', venue } = route.params || {};
  const { language } = useLanguage();

  const venueData = venue || {
    name: venueName,
    address: 'Independence Avenue, Windhoek, Namibia',
    capacity: 25000,
    opened: 2005,
    coordinates: { lat: -22.5700, lng: 17.0836 },
    facilities: [
      'Parking',
      'Food & Beverages',
      'First Aid',
      'Accessibility',
      'WiFi',
      'Parking'
    ],
    image: { uri: onlineImages.stadiums[0] }
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${venueData.coordinates.lat},${venueData.coordinates.lng}`;
    Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${venueData.coordinates.lat},${venueData.coordinates.lng}`;
    Linking.openURL(url).catch(err => console.error('Error opening directions:', err));
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{venueData.name}</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {venueData.image && (
          <Image
            source={venueData.image}
            style={styles.venueImage}
            contentFit="cover"
          />
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={18} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{venueData.address}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people" size={18} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Capacity</Text>
              <Text style={styles.infoValue}>{venueData.capacity.toLocaleString()} seats</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Opened</Text>
              <Text style={styles.infoValue}>{venueData.opened}</Text>
            </View>
          </View>
        </View>

        <View style={styles.facilitiesCard}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.facilitiesGrid}>
            {venueData.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Location & Directions</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={theme.colors.muted} />
            <Text style={styles.mapText}>Interactive Map</Text>
            <Text style={styles.mapSubtext}>Tap buttons below to open in maps app</Text>
          </View>

          <View style={styles.mapActions}>
            <TouchableOpacity style={styles.mapButton} onPress={openMaps} activeOpacity={0.7}>
              <Ionicons name="location" size={18} color={theme.colors.white} />
              <Text style={styles.mapButtonText}>View on Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mapButton, styles.directionsButton]} onPress={getDirections} activeOpacity={0.7}>
              <Ionicons name="navigate" size={18} color={theme.colors.white} />
              <Text style={styles.mapButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm
  },
  backButton: {
    padding: theme.spacing.xs
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    flex: 1,
    textAlign: 'center'
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.lg
  },
  venueImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    gap: theme.spacing.md
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs / 2
  },
  infoValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.textDark,
    fontWeight: '600'
  },
  facilitiesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: theme.spacing.xs
  },
  facilityText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary
  },
  mapSection: {
    marginBottom: theme.spacing.md
  },
  mapPlaceholder: {
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  mapText: {
    ...theme.typography.body,
    color: theme.colors.textDark,
    marginTop: theme.spacing.sm,
    fontWeight: '600'
  },
  mapSubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs / 2
  },
  mapActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
  },
  directionsButton: {
    backgroundColor: theme.colors.accent
  },
  mapButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '700'
  }
});

export default VenueScreen;


