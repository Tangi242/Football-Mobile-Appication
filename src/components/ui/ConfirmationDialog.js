import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext.js';
import theme from '../../theme/colors.js';

/**
 * Reusable confirmation dialog component
 */
const ConfirmationDialog = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = theme.colors.interactive || theme.colors.error || '#DC143C',
  type = 'warning', // warning, danger, info
  icon,
}) => {
  const { theme: appTheme } = useTheme();

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'danger':
        return 'trash-outline';
      case 'warning':
        return 'warning-outline';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return theme.colors.error || '#EF4444';
      case 'warning':
        return theme.colors.warning || '#F59E0B';
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: appTheme.colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
            <Ionicons name={getIcon()} size={32} color={getIconColor()} />
          </View>
          
          <Text style={[styles.title, { color: appTheme.colors.textDark }]}>
            {title}
          </Text>
          
          <Text style={[styles.message, { color: appTheme.colors.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: appTheme.colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: appTheme.colors.textDark }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Accessibility
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  confirmButton: {
    ...theme.shadows.sm,
  },
  cancelText: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  confirmText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700',
  },
});

export default ConfirmationDialog;










