import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext.js';
import theme from '../../theme/colors.js';

const ChartView = ({ data, type = 'bar', onTypeChange, title, subtitle }) => {
  const { theme: appTheme } = useTheme();
  const [chartType, setChartType] = useState(type);

  const handleTypeChange = (newType) => {
    setChartType(newType);
    if (onTypeChange) onTypeChange(newType);
  };

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.surface }]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, { color: appTheme.colors.textDark }]}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, { color: appTheme.colors.muted }]}>{subtitle}</Text>}
        </View>
      )}

      {/* Chart Type Switcher */}
      <View style={styles.switcher}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            chartType === 'bar' && [styles.switchButtonActive, { backgroundColor: appTheme.colors.primary }]
          ]}
          onPress={() => handleTypeChange('bar')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="bar-chart" 
            size={18} 
            color={chartType === 'bar' ? theme.colors.white : appTheme.colors.textSecondary} 
          />
          <Text style={[
            styles.switchText,
            { color: chartType === 'bar' ? theme.colors.white : appTheme.colors.textSecondary }
          ]}>
            Bar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchButton,
            chartType === 'line' && [styles.switchButtonActive, { backgroundColor: appTheme.colors.primary }]
          ]}
          onPress={() => handleTypeChange('line')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="trending-up" 
            size={18} 
            color={chartType === 'line' ? theme.colors.white : appTheme.colors.textSecondary} 
          />
          <Text style={[
            styles.switchText,
            { color: chartType === 'line' ? theme.colors.white : appTheme.colors.textSecondary }
          ]}>
            Line
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Content */}
      <View style={styles.chartContainer}>
        {chartType === 'bar' ? (
          <View style={styles.barChart}>
            {data.map((item, index) => {
              const barHeight = (item.value / maxValue) * 100;
              return (
                <View key={index} style={styles.barItem}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${barHeight}%`,
                          backgroundColor: item.color || appTheme.colors.primary,
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: appTheme.colors.textSecondary }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={[styles.barValue, { color: appTheme.colors.textDark }]}>
                    {item.value}{item.unit || ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.lineChart}>
            <View style={styles.lineChartContent}>
              {data.map((item, index) => {
                const pointHeight = (item.value / maxValue) * 100;
                const nextItem = data[index + 1];
                const nextPointHeight = nextItem ? (nextItem.value / maxValue) * 100 : pointHeight;
                const isLast = index === data.length - 1;
                
                return (
                  <View key={index} style={styles.lineItem}>
                    <View style={styles.linePointContainer}>
                      <View
                        style={[
                          styles.linePoint,
                          {
                            bottom: `${pointHeight}%`,
                            backgroundColor: item.color || appTheme.colors.primary,
                          }
                        ]}
                      />
                      {!isLast && (
                        <View
                          style={[
                            styles.lineConnector,
                            {
                              bottom: `${Math.min(pointHeight, nextPointHeight)}%`,
                              height: `${Math.abs(pointHeight - nextPointHeight)}%`,
                              backgroundColor: item.color || appTheme.colors.primary,
                              opacity: 0.4,
                            }
                          ]}
                        />
                      )}
                    </View>
                    <Text style={[styles.lineLabel, { color: appTheme.colors.textSecondary }]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={[styles.lineValue, { color: appTheme.colors.textDark }]}>
                      {item.value}{item.unit || ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h4,
    fontWeight: '700',
    marginBottom: theme.spacing.xs / 2,
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: 11,
  },
  switcher: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs / 2,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs / 2,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  switchButtonActive: {
    ...theme.shadows.sm,
  },
  switchText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    fontSize: 12,
  },
  chartContainer: {
    minHeight: 200,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
    gap: theme.spacing.xs,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  barWrapper: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: theme.borderRadius.xs,
    minHeight: 4,
    ...theme.shadows.sm,
  },
  barLabel: {
    ...theme.typography.tiny,
    fontSize: 9,
    textAlign: 'center',
  },
  barValue: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  lineChart: {
    height: 200,
  },
  lineChartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    position: 'relative',
  },
  lineItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    position: 'relative',
  },
  linePointContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  linePoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    zIndex: 2,
    borderWidth: 2,
    borderColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  lineConnector: {
    width: 2,
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -1 }],
    zIndex: 1,
  },
  lineLabel: {
    ...theme.typography.tiny,
    fontSize: 9,
    textAlign: 'center',
  },
  lineValue: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
});

export default ChartView;

