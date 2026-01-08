import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { createTicket } from '../../api/client.js';
import { useData } from '../../context/DataContext.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';

const TicketCreationScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { fixtures } = useData();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    match_id: '',
    user_id: '',
    section: '',
    row: '',
    seat: '',
    price: '',
    status: 'available'
  });

  const handleSave = async () => {
    if (!formData.match_id) {
      showError('Match is required');
      return;
    }
    if (!formData.price) {
      showError('Price is required');
      return;
    }

    try {
      setSaving(true);
      const ticketData = {
        ...formData,
        match_id: parseInt(formData.match_id),
        user_id: formData.user_id ? parseInt(formData.user_id) : null,
        price: parseFloat(formData.price),
        status: formData.status || 'available'
      };

      await createTicket(ticketData);
      showSuccess('Ticket created successfully');
      navigation.goBack();
    } catch (error) {
      showError(error.userMessage || 'Failed to create ticket');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>Create Ticket</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textDark }]}>Match *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
            value={formData.match_id}
            onChangeText={(text) => setFormData({ ...formData, match_id: text })}
            placeholder="Match ID"
            keyboardType="numeric"
          />
          {fixtures && fixtures.length > 0 && (
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              Available matches: {fixtures.map(m => m.id).join(', ')}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textDark }]}>User ID (Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
            value={formData.user_id}
            onChangeText={(text) => setFormData({ ...formData, user_id: text })}
            placeholder="User ID (leave empty for available ticket)"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textDark }]}>Section</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
            value={formData.section}
            onChangeText={(text) => setFormData({ ...formData, section: text })}
            placeholder="e.g., A, B, VIP"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textDark }]}>Row</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
            value={formData.row}
            onChangeText={(text) => setFormData({ ...formData, row: text })}
            placeholder="e.g., 1, 2, 3"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textDark }]}>Seat</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
            value={formData.seat}
            onChangeText={(text) => setFormData({ ...formData, seat: text })}
            placeholder="e.g., 1, 2, 3"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textDark }]}>Price (NAD) *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            placeholder="e.g., 150.00"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textDark }]}>Status</Text>
          <View style={styles.statusButtons}>
            {['available', 'sold', 'reserved', 'cancelled'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  formData.status === status && { backgroundColor: theme.colors.interactive || '#DC143C' }
                ]}
                onPress={() => setFormData({ ...formData, status })}
              >
                <Text style={[
                  styles.statusButtonText,
                  formData.status === status && { color: '#FFFFFF' }
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <LoadingButton
          title="Create Ticket"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  backButton: {
    padding: baseTheme.spacing.xs,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: baseTheme.spacing.lg,
  },
  inputGroup: {
    marginBottom: baseTheme.spacing.md,
  },
  label: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  input: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
  },
  hint: {
    ...baseTheme.typography.caption,
    marginTop: baseTheme.spacing.xs / 2,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.sm,
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
    padding: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    alignItems: 'center',
  },
  statusButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    color: baseTheme.colors.textDark,
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
  },
});

export default TicketCreationScreen;

