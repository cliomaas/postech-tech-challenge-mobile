import { TransactionProvider } from '@/src/context/TransactionContext';
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
    return (
        <PaperProvider>
            <AuthProvider>
                <TransactionProvider>
                    <Slot />
                </TransactionProvider>
            </AuthProvider>
        </PaperProvider>
    );
}