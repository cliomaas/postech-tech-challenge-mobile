import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TransactionProps {
    title: string;
    category: string;
    amount: number;
    date: string;
    type: 'in' | 'out';
    receiptUrl?: string;
}

const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'comida': return 'cutlery';
        case 'compras': return 'shopping-bag';
        case 'lazer': return 'ticket';
        case 'transporte': return 'car';
        default: return 'exchange';
    }
};

export const TransactionItem = ({ title, category, amount, date, type }: TransactionProps) => {
    const isNegative = type === 'out';

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <View style={styles.iconBg}>
                    <FontAwesome name={getIcon(category)} size={16} color="#94a3b8" />
                </View>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>
            <Text style={[styles.amount, isNegative ? styles.negative : styles.positive]}>
                {isNegative ? '-' : '+'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
    left: { flexDirection: 'row', alignItems: 'center' },
    iconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    title: { color: '#f8fafc', fontSize: 15, fontWeight: '500' },
    date: { color: '#64748b', fontSize: 12, marginTop: 2 },
    amount: { fontSize: 15, fontWeight: '600' },
    positive: { color: '#10b981' },
    negative: { color: '#ef4444' },
});