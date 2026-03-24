import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface Props extends TextInputProps {
    label: string;
    icon?: keyof typeof FontAwesome.glyphMap;
    variant?: 'light' | 'dark';
}

export const InputField = ({ label, icon, variant = 'light', ...props }: Props) => {
    const isDark = variant === 'dark';

    return (
        <View style={styles.group}>
            <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>{label}</Text>
            <View style={[styles.inputContainer, isDark ? styles.containerDark : styles.containerLight]}>
                {icon && <FontAwesome name={icon} size={18} color={isDark ? "#94a3b8" : "#94a3b8"} style={styles.icon} />}
                <TextInput
                    style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                    placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                    {...props}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    group: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    labelLight: { color: '#64748b' },
    labelDark: { color: '#f8fafc' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 15,
    },
    containerLight: { backgroundColor: '#fff', borderColor: '#e2e8f0' },
    containerDark: { backgroundColor: '#0f172a', borderColor: '#334155' },
    icon: { marginRight: 10 },
    input: { flex: 1, height: 50, fontSize: 16 },
    inputLight: { color: '#1e293b' },
    inputDark: { color: '#f8fafc' },
});