import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useMemo, useState, useRef, useEffect } from 'react';
import theme from '../../theme/colors.js';

const SegmentedControl = ({ options = [], value, onChange }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(options.indexOf(value), 0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (containerWidth && options.length) {
      const segmentWidth = containerWidth / options.length;
      Animated.spring(translateX, {
        toValue: activeIndex * segmentWidth,
        useNativeDriver: true,
        tension: 68,
        friction: 8
      }).start();
    }
  }, [activeIndex, containerWidth, options.length]);

  const pillStyle = useMemo(() => {
    if (!containerWidth || !options.length) return {};
    const segmentWidth = containerWidth / options.length;
    return {
      width: segmentWidth,
      transform: [{ translateX }]
    };
  }, [containerWidth, options.length, translateX]);

  return (
    <View style={styles.wrapper} onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
      <View style={styles.container}>
        <Animated.View style={[styles.pill, pillStyle]} />
        {options.map((option) => {
          const isActive = option === value;
          return (
            <TouchableOpacity 
              key={option} 
              style={styles.option} 
              onPress={() => onChange(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: theme.spacing.xs
  },
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C', // Red for active pill
    ...theme.shadows.md
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    zIndex: 1
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  labelActive: {
    color: theme.colors.white,
    fontWeight: '700'
  }
});

export default SegmentedControl;

