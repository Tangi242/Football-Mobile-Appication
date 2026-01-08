import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext.js';
import theme from '../../theme/colors.js';

const Tooltip = ({ text, children, position = 'top' }) => {
  const { theme: appTheme } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Show help for ${text}`}
        accessibilityHint="Double tap to view explanation"
      >
        {children || (
          <Ionicons 
            name="help-circle-outline" 
            size={16} 
            color={appTheme.colors.muted} 
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={[styles.tooltipContent, { backgroundColor: appTheme.colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.tooltipHeader}>
              <Ionicons name="information-circle" size={20} color={appTheme.colors.primary} />
              <Text style={[styles.tooltipTitle, { color: appTheme.colors.textDark }]}>
                Explanation
              </Text>
            </View>
            <Text style={[styles.tooltipText, { color: appTheme.colors.textSecondary }]}>
              {text}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: appTheme.colors.primary }]}
              onPress={() => setVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  tooltipContent: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxWidth: '90%',
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tooltipTitle: {
    ...theme.typography.h4,
    fontWeight: '700',
  },
  tooltipText: {
    ...theme.typography.body,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  closeButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  closeButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700',
  },
});

export default Tooltip;










