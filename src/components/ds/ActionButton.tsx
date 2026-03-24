import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    icon: keyof typeof FontAwesome.glyphMap;
    label: string;
    onPress: () => void;
}

export const ActionButton = ({ icon, label, onPress }: Props) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.iconCircle}>
                <FontAwesome name={icon} size={22} color="#f8fafc" />
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 80,
        marginRight: 16,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    label: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
});