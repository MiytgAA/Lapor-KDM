// src/components/laporan/KomentarItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/lib/colors';
import { timeAgo, getInitials } from '@/lib/utils';
import type { Komentar } from '@/lib/types';

export function KomentarItem({ komentar }: { komentar: Komentar }) {
  const isAdmin = komentar.penulis?.role !== 'user';
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: isAdmin ? Colors.primary : Colors.purple }]}>
        <Text style={styles.avatarText}>{getInitials(komentar.penulis?.nama || '?')}</Text>
      </View>

      <View style={styles.bubble}>
        <View style={styles.header}>
          <Text style={styles.name}>{komentar.penulis?.nama}</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>
                {komentar.penulis?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.isi}>{komentar.isi}</Text>
        <Text style={styles.time}>{timeAgo(komentar.created_at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  bubble: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.ink },
  adminBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  adminText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  isi: { fontSize: 14, color: Colors.body, lineHeight: 20 },
  time: { fontSize: 11, color: Colors.mute, marginTop: 4 },
});
