import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { auth, db } from '../../src/services/firebaseConfig';

import { Button } from '../../src/components/ds/Button';
import { InputField } from '../../src/components/ds/InputField';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'error' | 'success'>('error');

  const router = useRouter();

  const showFeedback = (msg: string, feedbackType: 'error' | 'success' = 'error') => {
    setMessage(msg);
    setType(feedbackType);
    setVisible(true);
  };

  const validate = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (isRegistering && name.length < 2) {
      showFeedback('Por favor, digite seu nome.');
      return false;
    }
    if (!emailRegex.test(email)) {
      showFeedback('O e-mail digitado é inválido.');
      return false;
    }
    if (password.length < 6) {
      showFeedback('A senha precisa de pelo menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (!isRegistering) {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace('/(tabs)/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
          displayName: name
        });

        await userCredential.user.reload();

        const initialData: any[] = [];
        const templates = [
          { description: 'Mercado Central', category: 'ALIMENTACAO', type: 'out', baseAmount: 200 },
          { description: 'Uber', category: 'TRANSPORTE', type: 'out', baseAmount: 30 },
          { description: 'Salário', category: 'INCOME', type: 'in', baseAmount: 4500 },
          { description: 'iFood', category: 'ALIMENTACAO', type: 'out', baseAmount: 60 },
          { description: 'Aluguel', category: 'MORADIA', type: 'out', baseAmount: 1500 },
          { description: 'Cinema', category: 'LAZER', type: 'out', baseAmount: 50 },
          { description: 'Farmácia', category: 'OUTROS', type: 'out', baseAmount: 80 },
          { description: 'Posto de Gasolina', category: 'TRANSPORTE', type: 'out', baseAmount: 150 },
          { description: 'Conta de Luz', category: 'MORADIA', type: 'out', baseAmount: 120 },
          { description: 'Freelance', category: 'INCOME', type: 'in', baseAmount: 800 },
        ];

        for (let i = 0; i < 35; i++) {
          const template = templates[i % templates.length];
          const randomDaysAgo = Math.floor(Math.random() * 90); // Espalha aleatoriamente em até 90 dias atrás
          const date = new Date(Date.now() - randomDaysAgo * 86400000).toISOString().split('T')[0];

          const amount = template.baseAmount + (Math.random() * 50 - 25);

          initialData.push({
            description: template.description,
            amount: template.type === 'in' ? template.baseAmount : Math.max(15, Number(amount.toFixed(2))), // Mínimo de 15 reais para as despesas
            category: template.category,
            type: template.type,
            date: date,
            paymentMethod: template.type === 'in' ? 'PIX' : 'CARTÃO',
            isScheduled: false
          });
        }

        for (const t of initialData) {
          await addDoc(collection(db, 'users', userCredential.user.uid, 'transactions'), {
            ...t,
            createdAt: serverTimestamp()
          });
        }

        showFeedback('Bem-vinda ao ByteBank!', 'success');

        router.replace('/(tabs)/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err.code === 'auth/email-already-in-use'
        ? 'Este e-mail já está cadastrado.'
        : 'E-mail ou senha inválidos.';
      showFeedback(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{isRegistering ? 'Criar Conta' : 'Entrar'}</Text>
              <Text style={styles.subtitle}>
                {isRegistering ? 'Preencha os dados para começar.' : 'Use seu email e senha cadastrados.'}
              </Text>
            </View>

            {isRegistering && (
              <InputField label="Nome" icon="user" value={name} onChangeText={setName} placeholder="Como quer ser chamado?" />
            )}

            <InputField label="Email" icon="envelope" value={email} onChangeText={setEmail} placeholder="seu@email.com" autoCapitalize="none" keyboardType="email-address" />
            <InputField label="Senha" icon="lock" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

            <Button title={isRegistering ? "Cadastrar" : "Entrar"} onPress={handleAuth} loading={loading} variant="primary" />

            <View style={styles.footer}>
              <Text style={styles.footerText}>{isRegistering ? 'Já tem conta?' : 'Não tem conta?'}</Text>
              <Button
                title={isRegistering ? "Ir para Login" : "Criar conta"}
                onPress={() => { setIsRegistering(!isRegistering); setName(''); }}
                variant="link"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000} wrapperStyle={styles.snackbarWrapper} style={[styles.snackbar, type === 'success' ? styles.successBg : styles.errorBg]}>
        <Text style={styles.snackbarText}>{message}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 4 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 15, color: '#64748b', marginTop: 4 },
  footer: { flexDirection: 'row', marginTop: 24, justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#64748b', fontSize: 14 },
  snackbarWrapper: { bottom: 40 },
  snackbar: { borderRadius: 8 },
  successBg: { backgroundColor: '#10b981' },
  errorBg: { backgroundColor: '#ef4444' },
  snackbarText: { color: '#f8fafc', fontWeight: '500', textAlign: 'center' }
});
