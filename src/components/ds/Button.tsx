import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'link';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button = ({
    title,
    onPress,
    variant = 'primary',
    loading,
    disabled,
    style
}: ButtonProps) => {

    if (variant === 'link') {
        return (
            <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={style}>
                <Text style={styles.textLink}>{title}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.baseButton, styles[variant], (disabled || loading) && styles.disabled, style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={variant === 'primary' ? styles.textPrimary : styles.textSecondary}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    baseButton: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 0
    },
    primary: { backgroundColor: '#3b82f6', marginTop: 16 },
    secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#334155' },
    textPrimary: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    textSecondary: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
    textLink: { color: '#3b82f6', fontSize: 14, fontWeight: 'bold' },
    disabled: { opacity: 0.5 },
});