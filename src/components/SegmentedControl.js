import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo, useState } from 'react';
import theme from '../theme/colors.js';

const SegmentedControl = ({ options = [], value, onChange }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(options.indexOf(value), 0);
  const pillStyle = useMemo(() => {
    if (!containerWidth || !options.length) return {};
    const segmentWidth = containerWidth / options.length;
    return {
      width: segmentWidth,
      transform: [{ translateX: activeIndex * segmentWidth }]
    };
  }, [activeIndex, containerWidth, options.length]);

  return (
    <View style={styles.wrapper} onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
      <View style={styles.container}>
        <View style={[styles.pill, pillStyle]} />
        {options.map((option) => {
          const isActive = option === value;
          return (
            <TouchableOpacity key={option} style={styles.option} onPress={() => onChange(option)}>
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
    width: '100%'
  },
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    overflow: 'hidden'
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.primary
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  label: {
    fontWeight: '600',
    color: theme.colors.muted
  },
  labelActive: {
    color: theme.colors.white
  }
});

export default SegmentedControl;

