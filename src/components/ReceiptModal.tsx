import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReceiptModalProps {
    visible: boolean;
    imageUrl: string | null;
    onClose: () => void;
}

export function ReceiptModal({ visible, imageUrl, onClose }: ReceiptModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Comprovante</Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome5 name="times" size={20} color="#0f172a" />
                        </TouchableOpacity>
                    </View>

                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
                    ) : (
                        <View style={styles.center}>
                            <Text>Imagem não carregada</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: SCREEN_WIDTH * 0.85, height: SCREEN_HEIGHT * 0.6, backgroundColor: '#fff', borderRadius: 28, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    fullImage: { flex: 1, width: '100%', borderRadius: 16 }
});