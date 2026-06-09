// src/app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { laporanApi } from '@/lib/api';
import { Colors } from '@/lib/colors';
import { LaporanCard } from '@/components/laporan/LaporanCard';
import { getInitials } from '@/lib/utils';
import type { Laporan } from '@/lib/types';

const STATUS_FILTERS = [
  { label: 'Semua', value: '' },
  { label: '⏳ Menunggu', value: 'pending' },
  { label: '✅ Disetujui', value: 'approved' },
  { label: '❌ Ditolak', value: 'rejected' },
];

const LIMIT = 10;

export default function HomeScreen() {
  const { user } = useAuth();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLaporan = useCallback(async (p = 1, q = search, s = status, append = false) => {
    try {
      if (p === 1 && !append) setLoading(true);
      const { data } = await laporanApi.getAll({
        page: p, limit: LIMIT,
        ...(q.trim() ? { search: q.trim() } : {}),
        ...(s ? { status: s } : {}),
      });
      const list = data.data || [];
      const pagination = data.pagination;
      if (append && p > 1) {
        setLaporan(prev => [...prev, ...list]);
      } else {
        setLaporan(list);
      }
      setTotalPages(pagination?.totalPages || 1);
      setPage(p);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, status]);

  useEffect(() => { fetchLaporan(1, search, status); }, [status]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchLaporan(1, search, status), 500);
    return () => clearTimeout(t);
  }, [search]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLaporan(1, search, status);
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    fetchLaporan(page + 1, search, status, true);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <SafeAreaView style={styles.flex}>
      {/* Top bar with greeting */}
      <View style={styles.topBar}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingText}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.nama || 'Pengguna'} 👋</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.nama || '?')}</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari laporan..."
            placeholderTextColor={Colors.muteSoft}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: Colors.mute, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.chipRow}>
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[styles.chip, status === f.value && styles.chipActive]}
              onPress={() => setStatus(f.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, status === f.value && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat laporan...</Text>
        </View>
      ) : (
        <FlatList
          data={laporan}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <LaporanCard laporan={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>Belum ada laporan</Text>
              <Text style={styles.emptySub}>
                {search ? `Tidak ada hasil untuk "${search}"` : 'Jadilah yang pertama membuat laporan!'}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bgLight },
  topBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  greetingText: { fontSize: 13, color: Colors.mute },
  userName: { fontSize: 17, fontWeight: '600', color: Colors.ink },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.hairline,
    paddingHorizontal: 12, paddingVertical: 9,
    gap: 8, marginBottom: 10,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink, padding: 0 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.hairline,
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.body, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.mute },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: Colors.ink, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.mute, textAlign: 'center', maxWidth: 260 },
  footer: { padding: 20, alignItems: 'center' },
});
