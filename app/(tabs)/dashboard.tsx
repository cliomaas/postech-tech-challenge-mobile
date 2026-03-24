import { auth } from '@/src/services/firebaseConfig';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnalyticsCharts } from '../../src/components/AnalyticsCharts';
import { RecentTransactions } from '../../src/components/RecentTransactions';
import { BalanceCard } from '../../src/components/ds/BalanceCard';
import { useTransactions } from '../../src/context/TransactionContext';

export default function Dashboard() {
    const { allTransactions, balance, loading } = useTransactions();
    const [userName, setUserName] = useState(auth.currentUser?.displayName?.split(' ')[0] || 'Pessoa');
    const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');

    // ANIMAÇÕES DE TRANSIÇÃO DO DASHBOARD
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
        ]).start();
    }, []);

    // Resolve a condição de corrida no cadastro (o Dashboard carrega antes do displayName ser salvo)
    useEffect(() => {
        const checkName = setInterval(() => {
            if (auth.currentUser?.displayName) {
                setUserName(auth.currentUser.displayName.split(' ')[0]);
                clearInterval(checkName);
            }
        }, 500);

        setTimeout(() => clearInterval(checkName), 3000); // Garante que não vai rodar para sempre

        return () => clearInterval(checkName);
    }, []);

    const recentTransactions = useMemo(() => {
        let filtered = allTransactions;
        if (filter !== 'all') {
            filtered = allTransactions.filter(t => t.type === filter);
        }
        return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
    }, [allTransactions, filter]);

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#004D40" /></View>;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {/* HEADER UNIFICADO */}
                <View style={styles.header}>
                    <Text style={styles.welcome}>Olá, {userName}!</Text>

                    <BalanceCard balance={balance} />

                    <Text style={styles.title}>Análises</Text>
                    <Text style={styles.subtitle}>Sua jornada financeira no ByteBank</Text>
                </View>

                {/* GRÁFICOS COMPONENTIZADOS */}
                <AnalyticsCharts transactions={allTransactions} />

                {/* FILTROS DE MOVIMENTAÇÕES */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterBtn, filter === 'in' && styles.filterBtnActiveIn]}
                        onPress={() => setFilter('in')}
                    >
                        <Text style={[styles.filterText, filter === 'in' && styles.filterTextActive]}>Entradas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterBtn, filter === 'out' && styles.filterBtnActiveOut]}
                        onPress={() => setFilter('out')}
                    >
                        <Text style={[styles.filterText, filter === 'out' && styles.filterTextActive]}>Saídas</Text>
                    </TouchableOpacity>
                </View>

                {/* COMPONENTE DE LISTA EXTRAÍDO */}
                <RecentTransactions data={recentTransactions} />
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 25, paddingTop: 10, marginBottom: 5 },
    welcome: { color: '#0f172a', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b', marginBottom: 10 },
    filterContainer: { flexDirection: 'row', paddingHorizontal: 25, marginTop: 15, gap: 10 },
    filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e2e8f0' },
    filterBtnActive: { backgroundColor: '#4f46e5' },
    filterBtnActiveIn: { backgroundColor: '#10b981' },
    filterBtnActiveOut: { backgroundColor: '#ef4444' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    filterTextActive: { color: '#ffffff' },
});