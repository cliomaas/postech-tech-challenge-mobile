import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export const createTransaction = async (description: string, amount: number, category: string, type: 'in' | 'out') => {
    const user = auth.currentUser;

    if (!user) throw new Error("Utilizador não autenticado!");

    try {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            description,
            amount,
            category,
            type,
            date: new Date().toLocaleDateString('pt-BR'),
            createdAt: serverTimestamp(), // Essencial para ordenar o extrato!
        });
        console.log("Sucesso! Transação gravada.");
    } catch (e) {
        console.error("Erro ao gravar:", e);
    }
};