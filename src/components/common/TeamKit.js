/**
 * TeamKit Component
 * Displays team jerseys/kits with fallback handling
 */

import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { getTeamKit, getTeamColors } from '../../utils/teamAssets.js';
import { placeholderImages } from '../../assets/placeholders.js';
import theme from '../../theme/colors.js';

const TeamKit = ({ 
  teamName, 
  kitType = 'home', 
  size = 'medium',
  showLabel = false,
  style 
}) => {
  const kit = getTeamKit(teamName, kitType);
  const colors = getTeamColors(teamName);

  const sizeMap = {
    small: { width: 60, height: 80 },
    medium: { width: 120, height: 160 },
    large: { width: 180, height: 240 },
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={kit}
        style={[styles.kit, { width: dimensions.width, height: dimensions.height }]}
        contentFit="contain"
        placeholder={placeholderImages.logos.namibia}
        transition={200}
        cachePolicy="disk"
        onError={() => {
          // Fallback handled by Image component
        }}
      />
      {showLabel && (
        <View style={[styles.labelContainer, { backgroundColor: colors.primary }]}>
          <Text style={[styles.label, { color: colors.secondary }]}>
            {kitType.toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  kit: {
    borderRadius: theme.borderRadius.sm,
  },
  labelContainer: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
  },
  label: {
    ...theme.typography.caption,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default TeamKit;

