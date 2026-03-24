import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    balance: number;
}

export const BalanceCard = ({ balance }: Props) => {
    const [showBalance, setShowBalance] = useState(true);

    useEffect(() => {
        const loadPreference = async () => {
            const saved = await AsyncStorage.getItem('@showBalance');
            if (saved !== null) {
                setShowBalance(JSON.parse(saved));
            }
        };
        loadPreference();
    }, []);

    const toggleBalance = async () => {
        const newValue = !showBalance;
        setShowBalance(newValue);
        await AsyncStorage.setItem('@showBalance', JSON.stringify(newValue));
    };

    return (
        <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Saldo disponível</Text>
                <TouchableOpacity onPress={toggleBalance}>
                    <FontAwesome5 name={showBalance ? "eye" : "eye-slash"} size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            <View style={styles.balanceContainer}>
                {showBalance ? (
                    <Text style={[styles.balanceValue, { color: balance >= 0 ? '#10b981' : '#ef4444' }]}>
                        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                ) : (
                    <View style={styles.hiddenBalance} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    balanceCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, marginBottom: 25, marginTop: 15 },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    balanceLabel: { color: '#64748b', fontSize: 13, fontWeight: '600' },
    balanceContainer: { height: 40, justifyContent: 'center', marginTop: 4 },
    balanceValue: { fontSize: 28, fontWeight: 'bold' },
    hiddenBalance: { width: 140, height: 12, backgroundColor: '#e2e8f0', borderRadius: 6 },
});