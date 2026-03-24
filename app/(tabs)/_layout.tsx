import { FontAwesome5 } from '@expo/vector-icons'; // Troquei para o 5 para ícones mais modernos
import { Tabs, router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, Platform, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/services/firebaseConfig';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#4f46e5', // Roxo/Azul vibrante do ByteBank
            tabBarInactiveTintColor: '#94a3b8',
            tabBarShowLabel: true,
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginBottom: Platform.OS === 'ios' ? 0 : 10,
            },
            tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopWidth: 0, // Remove a linha feia de cima
                position: 'absolute', // Deixa ela "flutuando"
                bottom: 20,
                left: 20,
                right: 20,
                height: 65,
                borderRadius: 20,
                // Sombras para dar profundidade (essencial para não parecer amador)
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
                paddingBottom: Platform.OS === 'ios' ? 20 : 0,
            },
            headerShown: true,
            headerStyle: {
                backgroundColor: '#f8fafc', // Mesma cor de fundo do app para parecer "transparente"
                elevation: 0, // Remove a sombra no Android
                shadowOpacity: 0, // Remove a sombra no iOS
            },
            headerTitle: '',
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS === 'web') {
                            const confirmed = window.confirm("Deseja realmente sair da sua conta?");
                            if (confirmed) signOut(auth);
                            return;
                        }

                        Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
                            { text: "Cancelar", style: "cancel" },
                            { text: "Sair", style: "destructive", onPress: () => signOut(auth) }
                        ]);
                    }}
                    style={{
                        marginRight: 25,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#fff',
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 5,
                        elevation: 2,
                    }}
                >
                    <FontAwesome5 name="sign-out-alt" size={16} color="#ef4444" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
            ),
        }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            backgroundColor: focused ? '#f5f3ff' : 'transparent',
                            padding: 8,
                            borderRadius: 12,
                        }}>
                            <FontAwesome5 name="chart-pie" size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: 'Nova',
                    tabBarIcon: ({ color }) => (
                        <View style={{
                            backgroundColor: '#4f46e5',
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: Platform.OS === 'ios' ? 20 : 30, // Faz ele "saltar" para fora da barra
                            shadowColor: "#4f46e5",
                            shadowOpacity: 0.4,
                            shadowRadius: 10,
                            elevation: 8
                        }}>
                            <FontAwesome5 name="plus" size={20} color="#fff" />
                        </View>
                    ),
                }}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault(); // Impede de abrir a tela em branco (dummy)
                        router.push('/new-transaction'); // Força a abertura da rota real
                    }
                })}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Extrato',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            backgroundColor: focused ? '#f5f3ff' : 'transparent',
                            padding: 8,
                            borderRadius: 12,
                        }}>
                            <FontAwesome5 name="exchange-alt" size={20} color={color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}