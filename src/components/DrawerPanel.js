import { useEffect, useRef } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme/colors.js';
import { useDrawer } from '../context/DrawerContext.js';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(width * 0.85, 360);

const menuItems = [
  { label: 'Settings', icon: 'settings-outline' },
  { label: 'Login', icon: 'log-in-outline' },
  { label: 'Language', icon: 'globe-outline' },
  { label: 'Feedback', icon: 'chatbox-ellipses-outline' },
  { label: 'FAQ', icon: 'help-circle-outline' }
];

const DrawerPanel = () => {
  const { isOpen, closeDrawer } = useDrawer();
  const translate = useRef(new Animated.Value(PANEL_WIDTH)).current;

  useEffect(() => {
    Animated.spring(translate, {
      toValue: isOpen ? 0 : PANEL_WIDTH,
      useNativeDriver: true,
      bounciness: 6
    }).start();
  }, [isOpen, translate]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => isOpen && gesture.dx > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) {
          translate.setValue(Math.min(gesture.dx, PANEL_WIDTH));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > PANEL_WIDTH / 3) {
          closeDrawer();
        } else {
          Animated.spring(translate, {
            toValue: 0,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  return (
    <View pointerEvents={isOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={closeDrawer} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.drawer,
          {
            transform: [{ translateX: translate }]
          }
        ]}
      >
        <Text style={styles.heading}>Quick Access</Text>
        <Text style={styles.subheading}>Navigate through the app</Text>
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                closeDrawer();
              }}
            >
              <View style={styles.iconBubble}>
                <Ionicons name={item.icon} size={20} color={theme.colors.textPrimary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)'
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    paddingTop: 52,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary
  },
  subheading: {
    color: theme.colors.muted,
    marginBottom: 20,
    marginTop: 4
  },
  menu: {
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 12
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: theme.colors.border
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: 12
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textDark
  }
});

export default DrawerPanel;

