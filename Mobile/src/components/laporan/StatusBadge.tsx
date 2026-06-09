// src/components/laporan/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, statusColor, statusBg, statusLabel } from '@/lib/colors';

interface Props { status: string; size?: 'sm' | 'md'; }

export function StatusBadge({ status, size = 'md' }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: statusBg(status) }]}>
      <View style={[styles.dot, { backgroundColor: statusColor(status) }]} />
      <Text style={[styles.text, { color: statusColor(status), fontSize: size === 'sm' ? 10 : 12 }]}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontWeight: '600', letterSpacing: 0.2 },
});
