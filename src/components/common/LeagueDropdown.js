import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';

const LeagueDropdown = ({ leagues = [], selectedLeagueId, onSelectLeague, selectedLeagueName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (leagueId) => {
    onSelectLeague(leagueId);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownText} numberOfLines={1}>
          {selectedLeagueName || 'Select League'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select League</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={leagues}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedLeagueId === String(item.id) && styles.optionSelected
                  ]}
                  onPress={() => handleSelect(String(item.id))}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    selectedLeagueId === String(item.id) && styles.optionTextSelected
                  ]}>
                    {item.name}
                  </Text>
                  {selectedLeagueId === String(item.id) && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  dropdownText: {
    ...theme.typography.body,
    color: theme.colors.textDark,
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
    marginRight: theme.spacing.sm
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    ...theme.shadows.xl
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  modalTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    fontWeight: '700'
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  optionSelected: {
    backgroundColor: theme.colors.backgroundPrimary
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.textDark,
    fontWeight: '500',
    flex: 1
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700'
  }
});

export default LeagueDropdown;

