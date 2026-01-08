import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext.js';

const ScreenWrapper = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  backgroundColor,
  ...rest
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bgColor = backgroundColor || theme.colors.backgroundPrimary;
  
  const basePadding = useMemo(
    () => ({
      paddingTop: Math.max(insets.top, theme.spacing.sm),
      paddingBottom: Math.max(insets.bottom, theme.spacing.md),
      paddingHorizontal: scrollable ? theme.spacing.lg : 0
    }),
    [insets.bottom, insets.top, scrollable, theme.spacing]
  );

  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      basePadding,
      { backgroundColor: bgColor },
      contentContainerStyle
    ],
    [basePadding, bgColor, contentContainerStyle]
  );

  const bodyStyle = useMemo(
    () => [
      styles.body,
      basePadding,
      { backgroundColor: bgColor },
      style
    ],
    [basePadding, bgColor, style]
  );

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...rest}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={bodyStyle} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    gap: 16,
    paddingVertical: 8
  },
  body: {
    flex: 1,
    width: '100%'
  }
});

export default ScreenWrapper;

