import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator, Alert, Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from '../src/components/ds/Button';
import { InputField } from '../src/components/ds/InputField';
import { auth, db, storage } from '../src/services/firebaseConfig';

const CATEGORIES = ['ALIMENTACAO', 'MORADIA', 'LAZER', 'TRANSPORTE', 'OUTROS', 'INCOME'];

const KEYWORDS: Record<string, string[]> = {
    ALIMENTACAO: ["mercado", "ifood", "restaurante", "padaria", "lanche", "cafe", "jantar"],
    MORADIA: ["aluguel", "luz", "agua", "internet", "gas", "condominio"],
    LAZER: ["cinema", "netflix", "spotify", "show", "viagem", "bar", "jogo", "praia"],
    TRANSPORTE: ["uber", "99", "taxi", "gasolina", "combustivel", "metro", "onibus"],
};

export default function TransactionForm() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('OUTROS');
    const [type, setType] = useState<'in' | 'out'>('out');
    const [image, setImage] = useState<string | null>(null);
    const [categoryTouched, setCategoryTouched] = useState(false);


    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CARD'); // Inicia com cartão
    const [sendLater, setSendLater] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false); // Fecha o picker após a seleção em ambos os sistemas
        if (selectedDate) setDate(selectedDate);
    };


    const suggestion = useMemo(() => {
        if (!description.trim() || type === 'in') return null;
        const normalized = description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        for (const [cat, keywords] of Object.entries(KEYWORDS)) {
            if (keywords.some(k => normalized.includes(k))) return cat;
        }
        return null;
    }, [description, type]);

    useEffect(() => {
        if (suggestion && !categoryTouched) {
            setCategory(suggestion);
        }
    }, [suggestion, categoryTouched]);

    // Carregar dados (Protegido contra uid null)
    useEffect(() => {
        const loadData = async () => {
            if (id && auth.currentUser) {
                try {
                    const docRef = doc(db, 'users', auth.currentUser.uid, 'transactions', id as string);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        setDescription(data.description);
                        setAmount(data.amount.toString());
                        setCategory(data.category);
                        setType(data.type);
                        setImage(data.receiptUrl);
                    }
                } finally {
                    setFetching(false);
                }
            } else if (!id) {
                setFetching(false);
            }
        };
        loadData();
    }, [id, auth.currentUser]);

    const handleSave = async () => {
        if (!description.trim()) {
            Alert.alert("Aviso", "Por favor, adicione uma descrição para a transação.");
            return;
        }

        const parsedAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert("Aviso", "O valor da transação deve ser maior que zero.");
            return;
        }

        if (!auth.currentUser) return;

        setLoading(true);

        try {
            let receiptUrl = image;
            if (image && image.startsWith('file://')) {
                const response = await fetch(image);
                const blob = await response.blob();
                const storageRef = ref(storage, `receipts/${auth.currentUser.uid}/${Date.now()}`);
                await uploadBytes(storageRef, blob);
                receiptUrl = await getDownloadURL(storageRef);
            }
            const data = {
                description: description.trim(),
                amount: parsedAmount,
                category: type === 'in' ? 'INCOME' : category,
                type,
                date: date.toISOString().split('T')[0], // Usa a data do estado
                paymentMethod,
                isScheduled: sendLater, // Salva se é agendado ou não
                receiptUrl,
                updatedAt: serverTimestamp(),
            };

            if (id) {
                await updateDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', id as string), data);
            } else {
                await addDoc(collection(db, 'users', auth.currentUser.uid, 'transactions'), {
                    ...data,
                    createdAt: serverTimestamp(),
                });
            }
            router.back();
        } catch (e) {
            Alert.alert("Erro", "Não foi possível salvar.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4f46e5" />;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerRow}>
                <View style={{ width: 40 }} />
                <Text style={styles.title}>{id ? 'Editar Gasto' : 'Nova Transação'}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
                    <FontAwesome5 name="times" size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <View style={styles.typeContainer}>
                <TouchableOpacity
                    style={[styles.typeBtn, type === 'out' && styles.typeBtnActiveOut]}
                    onPress={() => { setType('out'); setCategory('OUTROS'); }}
                >
                    <Text style={[styles.typeText, type === 'out' && styles.typeTextActive]}>Despesa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeBtn, type === 'in' && styles.typeBtnActiveIn]}
                    onPress={() => { setType('in'); setCategory('INCOME'); }}
                >
                    <Text style={[styles.typeText, type === 'in' && styles.typeTextActive]}>Receita</Text>
                </TouchableOpacity>
            </View>

            <InputField label="Descrição" icon="pencil" placeholder="Ex: Mercado..." value={description} onChangeText={setDescription} />
            <InputField label="Valor (R$)" icon="dollar" placeholder="0,00" keyboardType="numeric" value={amount} onChangeText={setAmount} />

            <Text style={styles.label}>Data da Transação</Text>
            {Platform.OS === 'web' ? (
                <input
                    type="date"
                    value={date.toISOString().split('T')[0]}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={paymentMethod === 'PIX' && !sendLater}
                    onChange={(e: any) => {
                        if (e.target.value) {
                            const [year, month, day] = e.target.value.split('-');
                            setDate(new Date(Number(year), Number(month) - 1, Number(day)));
                        }
                    }}
                    style={{
                        padding: 15,
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        marginBottom: 20,
                        fontSize: 16,
                        width: '100%',
                        backgroundColor: (paymentMethod === 'PIX' && !sendLater) ? '#f1f5f9' : '#fff',
                        color: (paymentMethod === 'PIX' && !sendLater) ? '#94a3b8' : '#1e293b',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        outline: 'none'
                    }}
                />
            ) : (
                <>
                    <TouchableOpacity
                        style={[
                            styles.input,
                            (paymentMethod === 'PIX' && !sendLater) && styles.inputDisabled
                        ]}
                        onPress={() => {
                            // Só abre o calendário se não for PIX imediato
                            if (paymentMethod !== 'PIX' || sendLater) {
                                setShowDatePicker(true);
                            }
                        }}
                        disabled={paymentMethod === 'PIX' && !sendLater}
                    >
                        <View style={styles.dateInputContent}>
                            <Text style={{ color: (paymentMethod === 'PIX' && !sendLater) ? '#94a3b8' : '#1e293b' }}>
                                {date.toLocaleDateString('pt-BR')}
                            </Text>
                            <FontAwesome5
                                name="calendar-alt"
                                size={16}
                                color={(paymentMethod === 'PIX' && !sendLater) ? '#cbd5e1' : '#004D40'}
                            />
                        </View>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={onDateChange}
                            minimumDate={new Date()} // O ByteBank não deixa agendar pro passado, né? ;)
                        />
                    )}
                </>
            )}

            <Text style={styles.label}>Método de Pagamento</Text>
            <View style={styles.categoryGrid}>
                {['PIX', 'CARTÃO', 'DINHEIRO'].map(method => (
                    <TouchableOpacity
                        key={method}
                        style={[styles.catItem, paymentMethod === method && styles.catItemActive]}
                        onPress={() => {
                            setPaymentMethod(method);
                            if (method === 'PIX' && !sendLater) setDate(new Date());
                        }}
                    >
                        <Text style={[styles.catText, paymentMethod === method && styles.catTextActive]}>{method}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {paymentMethod === 'PIX' && (
                <View style={styles.pixContainer}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => {
                            const nextValue = !sendLater;
                            setSendLater(nextValue);
                            if (!nextValue) setDate(new Date());
                        }}
                    >
                        <View style={[styles.checkbox, sendLater && styles.checkboxChecked]}>
                            {sendLater && <FontAwesome5 name="check" size={10} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxLabel}>Agendar este PIX para depois?</Text>
                    </TouchableOpacity>
                </View>
            )}

            {type === 'out' && (
                <>
                    <Text style={styles.label}>Categoria</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.filter(c => c !== 'INCOME').map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.catItem, category === cat && styles.catItemActive]}
                                onPress={() => { setCategory(cat); setCategoryTouched(true); }}
                            >
                                <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {suggestion && suggestion !== category && (
                        <Text style={styles.suggestionText}>Sugestão: <Text style={{ fontWeight: 'bold' }}>{suggestion}</Text></Text>
                    )}
                </>
            )}

            <TouchableOpacity style={styles.imagePicker} onPress={async () => {
                let res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
                if (!res.canceled) setImage(res.assets[0].uri);
            }}>
                {image ? <Image source={{ uri: image }} style={styles.preview} /> : (
                    <View style={styles.imagePlaceholder}>
                        <FontAwesome5 name="camera" size={20} color="#94a3b8" />
                        <Text style={{ color: '#94a3b8', marginTop: 8 }}>Anexar Recibo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Button title="Confirmar" onPress={handleSave} loading={loading} style={styles.saveBtn} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 25 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
    circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 25, marginTop: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
    input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    typeContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 25 },
    typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    typeBtnActiveOut: { backgroundColor: '#ef4444' },
    typeBtnActiveIn: { backgroundColor: '#10b981' },
    typeText: { fontWeight: '600', color: '#64748b' },
    typeTextActive: { color: '#fff' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    catItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    catItemActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    catText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    catTextActive: { color: '#fff' },
    suggestionText: { fontSize: 12, color: '#4f46e5', marginBottom: 20 },
    imagePicker: { height: 150, backgroundColor: '#fff', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    preview: { width: '100%', height: '100%', borderRadius: 14 },
    imagePlaceholder: { alignItems: 'center' },
    saveBtn: { backgroundColor: '#4f46e5', borderRadius: 16, height: 56, marginBottom: 40 },
    pixContainer: {
        backgroundColor: '#E4EDE3', // Tom de verde clarinho do ByteBank
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#004D40',
    },
    checkboxRow: { flexDirection: 'row', alignItems: 'center' },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#004D40',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkboxChecked: { backgroundColor: '#004D40' },
    checkboxLabel: { fontSize: 14, color: '#004D40', fontWeight: '600' },
    infoText: { fontSize: 11, color: '#64748b', marginTop: 8, fontStyle: 'italic' },
    inputDisabled: {
        backgroundColor: '#f1f5f9', // Cor de fundo cinza para parecer desabilitado
        borderColor: '#e2e8f0',
    },
    dateInputContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
});