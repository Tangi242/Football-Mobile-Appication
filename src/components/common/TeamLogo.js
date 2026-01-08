/**
 * TeamLogo Component
 * Displays team logos with graceful fallback handling
 */

import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { getTeamLogo } from '../../utils/teamAssets.js';
import { placeholderImages } from '../../assets/placeholders.js';
import theme from '../../theme/colors.js';

const TeamLogo = ({ 
  teamName, 
  size = 40,
  style,
  showFallback = true 
}) => {
  const logo = getTeamLogo(teamName, showFallback);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={logo}
        style={[styles.logo, { width: size, height: size }]}
        contentFit="contain"
        placeholder={placeholderImages.logos.namibia}
        transition={200}
        cachePolicy="disk"
        onError={() => {
          // Fallback is handled by Image component's placeholder
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  logo: {
    borderRadius: theme.borderRadius.full,
  },
});

export default TeamLogo;










