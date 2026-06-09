// src/app/(tabs)/profil.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { laporanApi } from '@/lib/api';
import { Colors } from '@/lib/colors';
import { getInitials, formatDate } from '@/lib/utils';
import type { Laporan } from '@/lib/types';

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const { data } = await laporanApi.getAll({ user_id: user.id, limit: 100 });
        const list: Laporan[] = data.data || [];
        setStats({
          total: data.pagination?.total || list.length,
          pending: list.filter(l => l.status === 'pending').length,
          approved: list.filter(l => l.status === 'approved').length,
          rejected: list.filter(l => l.status === 'rejected').length,
        });
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
        logout();
      }
      return;
    }
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      default: return 'Masyarakat';
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return Colors.orange;
      case 'admin': return Colors.blue;
      default: return Colors.purple;
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={[styles.avatarBig, { backgroundColor: Colors.primary }]}>
          <Text style={styles.avatarBigText}>{getInitials(user?.nama || '?')}</Text>
        </View>
        <Text style={styles.name}>{user?.nama}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor(user?.role || 'user') + '20', borderColor: roleColor(user?.role || 'user') }]}>
          <Text style={[styles.roleText, { color: roleColor(user?.role || 'user') }]}>
            {roleLabel(user?.role || 'user')}
          </Text>
        </View>
        <Text style={styles.joinDate}>Bergabung {formatDate(user?.created_at || '')}</Text>
      </View>

      {/* Stats */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionLabel}>STATISTIK LAPORAN SAYA</Text>
      </View>
      {loading ? (
        <View style={styles.statLoading}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statTotal]}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Laporan</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: Colors.pending }]}>
            <Text style={[styles.statNum, { color: Colors.pending }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Menunggu</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: Colors.approved }]}>
            <Text style={[styles.statNum, { color: Colors.approved }]}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Disetujui</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: Colors.rejected }]}>
            <Text style={[styles.statNum, { color: Colors.rejected }]}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Ditolak</Text>
          </View>
        </View>
      )}

      {/* Info */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionLabel}>INFORMASI APLIKASI</Text>
      </View>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📱</Text>
          <Text style={styles.infoKey}>Aplikasi</Text>
          <Text style={styles.infoVal}>Lapor KDM</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🔖</Text>
          <Text style={styles.infoKey}>Versi</Text>
          <Text style={styles.infoVal}>1.0.0</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🌐</Text>
          <Text style={styles.infoKey}>Platform</Text>
          <Text style={styles.infoVal}>React Native · Expo</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutEmoji}>🚪</Text>
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Lapor KDM — Sistem Pengaduan Masyarakat © 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bgLight },
  container: { padding: 16, paddingBottom: 48 },
  profileCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.hairline,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  avatarBig: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  avatarBigText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.ink, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.mute, marginBottom: 10 },
  roleBadge: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, marginBottom: 8,
  },
  roleText: { fontSize: 12, fontWeight: '600' },
  joinDate: { fontSize: 12, color: Colors.mute },
  sectionTitle: { marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: Colors.mute, letterSpacing: 1 },
  statLoading: { padding: 20, alignItems: 'center' },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.hairline,
    borderTopWidth: 3, borderTopColor: Colors.primary,
  },
  statTotal: { borderTopColor: Colors.primary },
  statNum: { fontSize: 24, fontWeight: '700', color: Colors.ink },
  statLabel: { fontSize: 11, color: Colors.mute, marginTop: 4, textAlign: 'center' },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 10, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.hairline, overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  infoIcon: { fontSize: 16, width: 24 },
  infoKey: { flex: 1, fontSize: 14, color: Colors.body },
  infoVal: { fontSize: 13, color: Colors.mute, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.hairline, marginLeft: 50 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.bgRed, borderRadius: 10, paddingVertical: 14,
    borderWidth: 1, borderColor: '#fecaca', marginBottom: 24,
  },
  logoutEmoji: { fontSize: 18 },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.rejected },
  footer: { textAlign: 'center', fontSize: 11, color: Colors.muteSoft },
});
