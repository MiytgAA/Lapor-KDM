// src/components/laporan/LaporanCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/colors';
import { truncate, formatDate } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import type { Laporan } from '@/lib/types';

export function LaporanCard({ laporan }: { laporan: Laporan }) {
  const router = useRouter();
  const thumbnail = laporan.gambar?.[0]?.url;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => router.push(`/laporan/${laporan.id}` as any)}
    >
      {/* Category color strip */}
      <View style={[styles.strip, { backgroundColor: laporan.kategori?.warna || Colors.purple }]} />

      <View style={styles.content}>
        {/* Thumbnail */}
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        ) : null}

        <View style={styles.body}>
          {/* Badges row */}
          <View style={styles.badgeRow}>
            <View style={[styles.catBadge, { backgroundColor: laporan.kategori?.warna || Colors.purple }]}>
              <Text style={styles.catText}>{laporan.kategori?.nama}</Text>
            </View>
            <StatusBadge status={laporan.status} size="sm" />
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {laporan.judul}
          </Text>

          {/* Description */}
          <Text style={styles.desc} numberOfLines={2}>
            {truncate(laporan.deskripsi, 100)}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.pelapor}>{laporan.pelapor?.nama}</Text>
            <Text style={styles.date}>{formatDate(laporan.created_at)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.canvas,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  strip: { width: 4 },
  content: { flex: 1 },
  thumbnail: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  body: { padding: 14 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.ink,
    lineHeight: 21,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: Colors.bodyMid,
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    paddingTop: 8,
  },
  pelapor: { fontSize: 12, fontWeight: '500', color: Colors.body },
  date: { fontSize: 11, color: Colors.mute },
});
