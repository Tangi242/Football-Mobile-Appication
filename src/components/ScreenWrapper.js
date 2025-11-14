import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import theme from '../theme/colors.js';

const ScreenWrapper = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  backgroundColor = theme.colors.backgroundPrimary,
  ...rest
}) => {
  const insets = useSafeAreaInsets();
  const basePadding = useMemo(
    () => ({
      paddingTop: Math.max(insets.top, 12),
      paddingBottom: Math.max(insets.bottom, 16),
      paddingHorizontal: 16
    }),
    [insets.bottom, insets.top]
  );

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, basePadding, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.body, basePadding, style]} {...rest}>
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
    backgroundColor: theme.colors.backgroundPrimary
  },
  body: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.backgroundPrimary
  }
});

export default ScreenWrapper;

