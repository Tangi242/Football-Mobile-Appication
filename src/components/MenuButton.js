import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme/colors.js';
import { useDrawer } from '../context/DrawerContext.js';

const MenuButton = () => {
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <TouchableOpacity
        accessibilityLabel="Open navigation menu"
        onPress={openDrawer}
        style={[styles.button, { bottom: Math.max(insets.bottom + 70, 90) }]}
      >
        <Ionicons name="menu-outline" size={26} color={theme.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10
  }
});

export default MenuButton;

