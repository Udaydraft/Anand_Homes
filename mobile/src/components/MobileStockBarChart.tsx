import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DayData {
  day: string;
  stockIn: number;
  stockOut: number;
}

interface Props {
  data: DayData[];
  stockOutColor?: string;
}

export const MobileStockBarChart: React.FC<Props> = ({
  data,
  stockOutColor = '#E5A91E',
}) => {
  const maxValue = 200;
  const chartHeight = 110;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Stock Overview (This Week)</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0D5C3A' }]} />
            <Text style={styles.legendText}>Stock In</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: stockOutColor }]} />
            <Text style={styles.legendText}>Stock Out</Text>
          </View>
        </View>
      </View>

      {/* Bars row */}
      <View style={styles.barsContainer}>
        {data.map((item) => {
          const inHeight = Math.max(6, (item.stockIn / maxValue) * chartHeight);
          const outHeight = Math.max(6, (item.stockOut / maxValue) * chartHeight);

          return (
            <View key={item.day} style={styles.dayColumn}>
              <View style={styles.barsPair}>
                <View
                  style={[
                    styles.bar,
                    { height: inHeight, backgroundColor: '#0D5C3A' },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    { height: outHeight, backgroundColor: stockOutColor },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barsPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 100,
  },
  bar: {
    width: 6,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6,
  },
});
