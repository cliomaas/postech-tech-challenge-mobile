import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Transaction } from '../context/TransactionContext';

interface RecentTransactionsProps {
    data: Transaction[];
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
    return (
        <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Últimas Movimentações</Text>
            </View>

            {data.map((item) => (
                <View key={item.id} style={styles.recentCard}>
                    <View style={[styles.iconCircle, { backgroundColor: item.type === 'in' ? '#ecfdf5' : '#f8fafc' }]}>
                        <FontAwesome5 name={item.type === 'in' ? 'arrow-up' : 'shopping-bag'} size={14} color={item.type === 'in' ? '#10b981' : '#64748b'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.recentDesc} numberOfLines={1}>{item.description}</Text>
                        <Text style={styles.recentCat}>{item.category}</Text>
                    </View>
                    <Text style={[styles.recentAmount, { color: item.type === 'in' ? '#10b981' : '#1e293b' }]}>
                        {item.type === 'in' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    recentSection: { paddingHorizontal: 25, marginTop: 20 },
    sectionHeader: { marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    recentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    recentDesc: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    recentCat: { fontSize: 11, color: '#94a3b8' },
    recentAmount: { fontSize: 14, fontWeight: 'bold' },
});