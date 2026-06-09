// src/components/ui/LoadingOverlay.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { Colors } from '@/lib/colors';

interface Props { visible: boolean; text?: string; }

export function LoadingOverlay({ visible, text = 'Memuat...' }: Props) {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    gap: 14,
    minWidth: 140,
  },
  text: { fontSize: 14, color: Colors.bodyMid, fontWeight: '500' },
});
