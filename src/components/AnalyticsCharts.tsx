import React, { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { Transaction } from '../context/TransactionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface AnalyticsChartsProps {
    transactions: Transaction[];
}

export function AnalyticsCharts({ transactions }: AnalyticsChartsProps) {
    const scrollX = useRef(new Animated.Value(0)).current;

    const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');

    const filteredTransactions = useMemo(() => {
        if (selectedMonth === 'ALL') return transactions;
        return transactions.filter(t => {
            if (!t.date) return false;
            const [, month] = t.date.split('-');
            return parseInt(month, 10) - 1 === selectedMonth;
        });
    }, [transactions, selectedMonth]);

    const processedPieData = useMemo(() => {
        const expenses = filteredTransactions.filter(t => t.type === 'out');
        const total = expenses.reduce((acc, t) => acc + t.amount, 0);
        if (total === 0) return [{ value: 1, color: '#e2e8f0', label: 'Sem gastos' }];

        const categories = [...new Set(expenses.map(t => t.category))];
        const colors = ['#004D40', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        return categories.map((cat, index) => ({
            value: expenses.filter(t => t.category === cat).reduce((acc, t) => acc + t.amount, 0),
            color: colors[index % colors.length],
            label: cat,
        }));
    }, [filteredTransactions]);

    const { barData, barMax } = useMemo(() => {
        const ins = filteredTransactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
        const outs = filteredTransactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);

        const max = Math.max(ins, outs);
        return {
            barData: [
                { value: ins, label: 'Entradas', frontColor: '#10b981' },
                { value: outs, label: 'Saídas', frontColor: '#ef4444' }
            ],
            barMax: max === 0 ? 100 : max * 1.2
        };
    }, [filteredTransactions]);

    const { lineData, lineMax } = useMemo(() => {
        const expenses = filteredTransactions.filter(t => t.type === 'out' && t.date);

        if (expenses.length === 0) {
            return { lineData: [{ value: 0, label: '01' }], lineMax: 100 };
        }

        const grouped: Record<string, number> = {};
        expenses.forEach(t => {
            if (selectedMonth === 'ALL') {
                const [year, month] = t.date.split('-');
                const key = `${year}-${month}`;
                grouped[key] = (grouped[key] || 0) + t.amount;
            } else {
                const day = t.date.split('-')[2];
                grouped[day] = (grouped[day] || 0) + t.amount;
            }
        });

        const sortedKeys = Object.keys(grouped).sort();
        const data = sortedKeys.map(key => {
            const label = selectedMonth === 'ALL' ? MONTHS[parseInt(key.split('-')[1], 10) - 1] : key;
            return { value: grouped[key], label };
        });

        if (data.length === 1) {
            data.unshift({ value: 0, label: '' });
        }

        const max = Math.max(...data.map(d => d.value));

        return { lineData: data, lineMax: max === 0 ? 100 : max * 1.2 };
    }, [filteredTransactions, selectedMonth]);

    return (
        <View style={{ height: 400 }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.monthScroll}
                contentContainerStyle={styles.monthScrollContent}
            >
                <TouchableOpacity
                    style={[styles.monthChip, selectedMonth === 'ALL' && styles.monthChipActive]}
                    onPress={() => setSelectedMonth('ALL')}
                >
                    <Text style={[styles.monthText, selectedMonth === 'ALL' && styles.monthTextActive]}>Todos</Text>
                </TouchableOpacity>

                {MONTHS.map((m, i) => (
                    <TouchableOpacity
                        key={m}
                        style={[styles.monthChip, selectedMonth === i && styles.monthChipActive]}
                        onPress={() => setSelectedMonth(i)}
                    >
                        <Text style={[styles.monthText, selectedMonth === i && styles.monthTextActive]}>{m}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Animated.ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                <View style={styles.cardWrapper}>
                    <View style={styles.mainCard}>
                        <Text style={styles.cardLabel}>Gastos por Categoria</Text>
                        <View style={styles.chartContainer}>
                            <PieChart data={processedPieData} donut radius={70} innerRadius={50} innerCircleColor={'#fff'} />
                            <View style={styles.legendContainer}>
                                {processedPieData.slice(0, 4).map((item, i) => (
                                    <View key={i} style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                        <Text style={styles.legendText}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.cardWrapper}>
                    <View style={styles.mainCard}>
                        <Text style={styles.cardLabel}>Entradas vs Saídas</Text>
                        <View style={styles.chartBox}>
                            <BarChart
                                data={barData}
                                maxValue={barMax}
                                noOfSections={4}
                                barWidth={45}
                                initialSpacing={35}
                                spacing={55}
                                hideRules
                                yAxisThickness={0}
                                xAxisThickness={0}
                                yAxisTextStyle={{ color: '#94a3b8', fontSize: 11 }}
                                xAxisLabelTextStyle={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}
                                formatYLabel={(label) => {
                                    const val = Number(label);
                                    if (val >= 1000) return `${(val / 1000).toFixed(1).replace('.0', '')}k`;
                                    return label;
                                }}
                                height={150}
                                width={SCREEN_WIDTH - 130}
                                overflowTop={30}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.cardWrapper}>
                    <View style={styles.mainCard}>
                        <Text style={styles.cardLabel}>Evolução de Gastos</Text>
                        <View style={styles.chartBox}>
                            <LineChart
                                data={lineData}
                                maxValue={lineMax}
                                noOfSections={4}
                                color="#ef4444"
                                thickness={3}
                                dataPointsColor="#ef4444"
                                curved
                                hideRules
                                yAxisThickness={0}
                                xAxisThickness={0}
                                yAxisTextStyle={{ color: '#94a3b8', fontSize: 11 }}
                                xAxisLabelTextStyle={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}
                                formatYLabel={(label) => Number(label) >= 1000 ? `${(Number(label) / 1000).toFixed(1).replace('.0', '')}k` : label}
                                height={150}
                                width={SCREEN_WIDTH - 130}
                                overflowTop={30}
                            />
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>

            <View style={styles.pagination}>
                {[0, 1, 2].map((_, i) => {
                    const width = scrollX.interpolate({
                        inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
                        outputRange: [8, 20, 8], extrapolate: 'clamp',
                    });
                    return <Animated.View key={i} style={[styles.dot, { width }]} />;
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: { width: SCREEN_WIDTH, alignItems: 'center' },
    mainCard: { backgroundColor: '#ffffff', width: SCREEN_WIDTH - 50, height: 320, borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    cardLabel: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 15 },
    chartContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    chartBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    dot: { height: 8, borderRadius: 4, backgroundColor: '#004D40', marginHorizontal: 4, opacity: 0.5 },
    legendContainer: { flex: 1, marginLeft: 15 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    legendColor: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    legendText: { fontSize: 11, color: '#64748b' },
    monthScroll: { maxHeight: 40, marginBottom: 15 },
    monthScrollContent: { paddingHorizontal: 25, alignItems: 'center' },
    monthChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e2e8f0', marginRight: 8 },
    monthChipActive: { backgroundColor: '#4f46e5' },
    monthText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    monthTextActive: { color: '#ffffff' }
});