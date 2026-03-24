import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Transaction } from '../context/TransactionContext';

interface TransactionCardProps {
    item: Transaction;
    onViewReceipt: (url: string) => void;
    onDelete: (id: string) => void;
}

export function TransactionCard({ item, onViewReceipt, onDelete }: TransactionCardProps) {
    const router = useRouter();

    // Considera editável/excluível apenas se a data for estritamente no futuro (agendada)
    const today = new Date();
    const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const isEditable = item.date > localToday;

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {/* Ícone de Entrada/Saída */}
                <View style={[
                    styles.iconBox,
                    { backgroundColor: item.type === 'in' ? '#ecfdf5' : '#fef2f2' }
                ]}>
                    <FontAwesome5
                        name={item.type === 'in' ? 'arrow-up' : 'arrow-down'}
                        size={12}
                        color={item.type === 'in' ? '#10b981' : '#ef4444'}
                    />
                </View>

                {/* Detalhes da Transação */}
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.description} numberOfLines={1}>
                        {item.description}
                    </Text>
                    <Text style={styles.dateText}>
                        {item.category} • {item.date || 'Sem data'}
                    </Text>
                </View>

                {/* Lado Direito: Valor e Ações */}
                <View style={styles.rightSide}>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[
                            styles.amount,
                            { color: item.type === 'in' ? '#10b981' : '#0f172a' }
                        ]}>
                            {item.type === 'in' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                        </Text>

                        {item.receiptUrl && (
                            <TouchableOpacity
                                style={styles.receiptBadge}
                                onPress={() => onViewReceipt(item.receiptUrl!)}
                            >
                                <FontAwesome5 name="paperclip" size={10} color="#4f46e5" />
                                <Text style={styles.receiptText}>Recibo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* AÇÕES (Aparecem apenas se for uma transação futura) */}
                    {isEditable && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                activeOpacity={0.6}
                                onPress={() => router.push({ pathname: '/new-transaction', params: { id: item.id } })}
                            >
                                <FontAwesome5 name="pen" size={12} color="#4f46e5" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteBtn}
                                activeOpacity={0.6}
                                onPress={() => onDelete(item.id)}
                            >
                                <FontAwesome5 name="trash" size={12} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    description: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    dateText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    rightSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    amount: { fontSize: 15, fontWeight: '700' },
    receiptBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f3ff', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginTop: 4, gap: 4 },
    receiptText: { fontSize: 9, fontWeight: 'bold', color: '#4f46e5' },
    actionButtons: { flexDirection: 'row', gap: 6, marginLeft: 4 },
    editBtn: { backgroundColor: '#f1f5f9', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    deleteBtn: { backgroundColor: '#fee2e2', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});