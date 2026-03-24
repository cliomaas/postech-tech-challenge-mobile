import { User, onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    onSnapshot,
    orderBy,
    query
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../services/firebaseConfig';

// 1. Tipagem (Requisito de boa prática do desafio)
export interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    type: 'in' | 'out';
    date: string;
    receiptUrl?: string;
    createdAt?: any;
}

interface TransactionContextData {
    transactions: Transaction[];
    allTransactions: Transaction[];
    balance: number;
    loading: boolean;
    loadMore: () => void;
    hasMore: boolean;
    isFetchingMore: boolean;
    refresh: () => void;
    category: string;
    setCategory: (category: string) => void;
    dateRange: { startDate: Date | null, endDate: Date | null };
    setDateRange: (range: { startDate: Date | null, endDate: Date | null }) => void;
}

const TransactionContext = createContext<TransactionContextData>({} as TransactionContextData);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [queryLimit, setQueryLimit] = useState(10);
    const [user, setUser] = useState<User | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [category, setCategory] = useState('TODAS');
    const [dateRange, setDateRange] = useState<{ startDate: Date | null, endDate: Date | null }>({ startDate: null, endDate: null });

    // 1. Escuta apenas as mudanças de Login/Logout
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (!user) {
                setAllTransactions([]);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // 2. Escuta todos os dados do banco (único listener para economizar leituras e evitar bugs de indexação)
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'users', user.uid, 'transactions'),
            orderBy('date', 'desc')
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
            setAllTransactions(data);
            setLoading(false); // Atualizamos o status de carregamento inicial aqui
        });

        return () => unsubscribeSnapshot();
    }, [user]);

    // 3. Aplica os filtros localmente e evita erros de índice no Firebase
    const filteredTransactions = useMemo(() => {
        let result = allTransactions;

        if (category !== 'TODAS') {
            result = result.filter(t => t.category === category);
        }

        // Função auxiliar para formatar com segurança a data local em YYYY-MM-DD
        const formatDate = (d: Date) => {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        if (dateRange.startDate) {
            result = result.filter(t => t.date >= formatDate(dateRange.startDate!));
        }

        if (dateRange.endDate) {
            result = result.filter(t => t.date <= formatDate(dateRange.endDate!));
        }

        return result;
    }, [allTransactions, category, dateRange]);

    // 4. Aplica a paginação (limit) sobre os dados já filtrados
    const transactions = useMemo(() => {
        return filteredTransactions.slice(0, queryLimit);
    }, [filteredTransactions, queryLimit]);

    // Calcula se existe mais itens a serem carregados baseado na lista filtrada
    const hasMore = filteredTransactions.length > queryLimit;

    const balance = useMemo(() => {
        return allTransactions.reduce((acc, transaction) => {
            return transaction.type === 'in' ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
    }, [allTransactions]);

    const loadMore = () => {
        if (hasMore && !isFetchingMore && !loading) {
            setIsFetchingMore(true);
            // Um pequeno delay artificial só para feedback visual (ver a rodinha girar) antes de renderizar mais itens
            setTimeout(() => {
                setQueryLimit(prev => prev + 10);
                setIsFetchingMore(false);
            }, 500);
        }
    };

    const refresh = () => {
        setCategory('TODAS');
        setDateRange({ startDate: null, endDate: null });
        setQueryLimit(10);
    }

    const handleSetCategory = (cat: string) => {
        setCategory(cat);
    };

    const handleSetDateRange = (range: { startDate: Date | null, endDate: Date | null }) => {
        setDateRange(range);
    };

    return (
        <TransactionContext.Provider value={{
            transactions,
            allTransactions,
            balance,
            loading,
            loadMore,
            hasMore,
            isFetchingMore,
            refresh,
            category,
            setCategory: handleSetCategory,
            dateRange,
            setDateRange: handleSetDateRange
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions deve ser usado dentro de um TransactionProvider');
    }
    return context;
};