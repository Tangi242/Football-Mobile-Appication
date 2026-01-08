import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext.js';
import theme from '../../theme/colors.js';

const CheckoutProgress = ({ currentStep = 1, steps = ['Cart', 'Review', 'Payment', 'Confirmation'] }) => {
  const { theme: appTheme } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <View key={step} style={styles.stepContainer}>
            <View style={styles.stepContent}>
              {/* Step Circle */}
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isCompleted || isActive
                      ? (appTheme.colors.interactive || appTheme.colors.error || '#DC143C')
                      : appTheme.colors.backgroundPrimary,
                    borderColor: isCompleted || isActive
                      ? (appTheme.colors.interactive || appTheme.colors.error || '#DC143C')
                      : appTheme.colors.border,
                  },
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      {
                        color: isActive
                          ? theme.colors.white
                          : appTheme.colors.textSecondary,
                      },
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>

              {/* Step Label */}
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isActive || isCompleted
                      ? appTheme.colors.textDark
                      : appTheme.colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {step}
              </Text>
            </View>

            {/* Connector Line */}
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: isCompleted
                      ? (appTheme.colors.interactive || appTheme.colors.error || '#DC143C')
                      : appTheme.colors.border,
                  },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  stepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  stepNumber: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  stepLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    textAlign: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: theme.spacing.xs,
    marginTop: -16, // Align with circle center
  },
});

export default CheckoutProgress;










