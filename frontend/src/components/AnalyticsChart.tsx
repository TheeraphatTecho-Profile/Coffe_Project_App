import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsChartProps {
  title: string;
  labels: string[];
  data: number[];
  type: 'line' | 'bar';
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ title, labels, data, type }) => {
  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.surfaceWarm,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 93, 35, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(59, 35, 20, ${opacity})`,
    style: { borderRadius: RADIUS.lg },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  const chartData = {
    labels,
    datasets: [{ data }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {type === 'line' ? (
        <LineChart
          data={chartData}
          width={screenWidth - SPACING.xl * 2}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      ) : (
        <BarChart
          data={chartData}
          width={screenWidth - SPACING.xl * 2}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  chart: {
    borderRadius: RADIUS.lg,
    marginLeft: -SPACING.md,
  },
});

export default AnalyticsChart;
