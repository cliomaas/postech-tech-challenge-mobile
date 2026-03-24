import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { deleteDoc, doc } from 'firebase/firestore';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    LayoutAnimation,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { ReceiptModal } from '../../src/components/ReceiptModal';
import { TransactionCard } from '../../src/components/TransactionCard';
import { Button } from '../../src/components/ds/Button';
import { useTransactions } from '../../src/context/TransactionContext';
import { auth, db } from '../../src/services/firebaseConfig';

const CATEGORIES = ['TODAS', 'ALIMENTACAO', 'MORADIA', 'LAZER', 'TRANSPORTE', 'OUTROS', 'INCOME'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TransactionsScreen() {
    const {
        transactions,
        loading,
        loadMore,
        hasMore,
        isFetchingMore,
        refresh,
        category,
        setCategory,
        dateRange,
        setDateRange
    } = useTransactions();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState<'startDate' | 'endDate'>('startDate');

    const isFilterActive = useMemo(() => category !== 'TODAS' || !!dateRange.startDate || !!dateRange.endDate, [category, dateRange]);

    const animateLayout = () => {
        if (Platform.OS !== 'web') {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
    };

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    const handleDelete = (id: string) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Deseja apagar este lançamento agendado?");
            if (confirmed && auth.currentUser) {
                deleteDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', id)).catch(() => {
                    window.alert("Não foi possível excluir a transação.");
                });
            }
            return;
        }

        Alert.alert("Excluir", "Deseja apagar este lançamento agendado?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                    if (!auth.currentUser) return;
                    try {
                        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', id));
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível excluir a transação.");
                    }
                }
            }
        ]);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            animateLayout();
            if (datePickerTarget === 'startDate') {
                setDateRange({ ...dateRange, startDate: selectedDate });
            } else {
                setDateRange({ ...dateRange, endDate: selectedDate });
            }
        }
    };

    const renderDateFilters = () => (
        <>
            <View style={styles.dateFilterContainer}>
                {Platform.OS === 'web' ? (
                    <>
                        <View style={{ flex: 1, marginRight: 5 }}>
                            <Text style={styles.label}>Data Início</Text>
                            <input
                                type="date"
                                value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
                                onChange={(e: any) => {
                                    animateLayout();
                                    if (e.target.value) {
                                        const [year, month, day] = e.target.value.split('-');
                                        setDateRange({ ...dateRange, startDate: new Date(Number(year), Number(month) - 1, Number(day)) });
                                    } else {
                                        setDateRange({ ...dateRange, startDate: null });
                                    }
                                }}
                                style={styles.webDatePicker}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 5 }}>
                            <Text style={styles.label}>Data Fim</Text>
                            <input
                                type="date"
                                value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
                                onChange={(e: any) => {
                                    animateLayout();
                                    if (e.target.value) {
                                        const [year, month, day] = e.target.value.split('-');
                                        setDateRange({ ...dateRange, endDate: new Date(Number(year), Number(month) - 1, Number(day)) });
                                    } else {
                                        setDateRange({ ...dateRange, endDate: null });
                                    }
                                }}
                                style={styles.webDatePicker}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={{ flex: 1, marginRight: 5 }}>
                            <Text style={styles.label}>Data Início</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => { setDatePickerTarget('startDate'); setShowDatePicker(true); }}
                            >
                                <Text style={styles.dateButtonText}>{dateRange.startDate?.toLocaleDateString('pt-BR') ?? 'Selecionar'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginLeft: 5 }}>
                            <Text style={styles.label}>Data Fim</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => { setDatePickerTarget('endDate'); setShowDatePicker(true); }}
                            >
                                <Text style={styles.dateButtonText}>{dateRange.endDate?.toLocaleDateString('pt-BR') ?? 'Selecionar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={dateRange[datePickerTarget] || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </>
    );

    const renderFilters = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Transações</Text>
            <Text style={styles.subtitle}>Filtre por categoria e data</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
            >
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.filterChip, category === cat && styles.filterChipActive]}
                        onPress={() => {
                            animateLayout();
                            setCategory(cat);
                        }}
                    >
                        <Text style={[styles.filterChipText, category === cat && styles.filterChipTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {renderDateFilters()}
            {isFilterActive && (
                <Button variant='primary' onPress={() => {
                    animateLayout();
                    setCategory('TODAS');
                    setDateRange({ startDate: null, endDate: null });
                }} title="Limpar Filtros" />
            )}
        </View>
    );

    const ListEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            {isFilterActive ? (
                <>
                    <FontAwesome5 name="search-minus" size={40} color="#e2e8f0" />
                    <Text style={styles.emptyText}>Nenhuma transação encontrada para estes filtros.</Text>
                </>
            ) : (
                <>
                    <FontAwesome5 name="receipt" size={40} color="#e2e8f0" />
                    <Text style={styles.emptyText}>Nada por aqui ainda...</Text>
                </>
            )}
        </View>
    );

    if (loading && !isFetchingMore) {
        return (
            <View style={styles.container}>
                {renderFilters()}
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderFilters}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refresh}
                        tintColor="#4f46e5"
                    />
                }
                renderItem={({ item }) => (
                    <TransactionCard
                        item={item}
                        onViewReceipt={(url) => {
                            setSelectedImage(url);
                            setModalVisible(true);
                        }}
                        onDelete={handleDelete}
                    />
                )}
                ListEmptyComponent={ListEmptyComponent}
                ListFooterComponent={
                    isFetchingMore ? (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#cbd5e1" />
                        </View>
                    ) : null
                }
            />
            <ReceiptModal
                visible={modalVisible}
                imageUrl={selectedImage}
                onClose={() => setModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 25, paddingTop: 10, marginBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', marginTop: 15, fontWeight: '500', textAlign: 'center' },
    filterScroll: { marginTop: 15, paddingBottom: 15 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8, borderWidth: 1, borderColor: '#cbd5e1' },
    filterChipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    filterChipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    filterChipTextActive: { color: '#ffffff' },
    dateFilterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
    dateButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    dateButtonText: { color: '#1e293b', fontSize: 16 },
    webDatePicker: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        fontSize: 16,
        width: '100%',
        backgroundColor: '#fff',
        color: '#1e293b',
        fontFamily: 'inherit',
        // Usando as any para evitar erro com as propriedades exclusivas da web
        ...({ boxSizing: 'border-box', outline: 'none' } as any)
    }
});