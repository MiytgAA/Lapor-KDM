// src/app/laporan/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, FlatList, Modal, Dimensions,
  KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { laporanApi } from '@/lib/api';
import { Colors } from '@/lib/colors';
import { formatDateTime, timeAgo, getInitials } from '@/lib/utils';
import { StatusBadge } from '@/components/laporan/StatusBadge';
import { KomentarItem } from '@/components/laporan/KomentarItem';
import type { Laporan } from '@/lib/types';

const { width: SCREEN_W } = Dimensions.get('window');

export default function DetailLaporanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [komentar, setKomentar] = useState('');
  const [sendingKom, setSendingKom] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  const fetchLaporan = async () => {
    try {
      const { data } = await laporanApi.getById(Number(id));
      setLaporan(data.data);
    } catch {
      Alert.alert('Error', 'Laporan tidak ditemukan', [
        { text: 'Kembali', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (id) fetchLaporan(); }, [id]);

  const handleRefresh = () => { setRefreshing(true); fetchLaporan(); };

  const handleStatus = async (status: 'approved' | 'rejected') => {
    if (!laporan) return;
    const label = status === 'approved' ? 'setujui' : 'tolak';

    const performAction = async () => {
      setUpdatingStatus(true);
      try {
        await laporanApi.updateStatus(laporan.id, status);
        if (Platform.OS === 'web') {
          window.alert(`Laporan berhasil di${label === 'setujui' ? 'setujui' : 'tolak'}`);
        } else {
          Alert.alert('Berhasil', `Laporan berhasil di${label === 'setujui' ? 'setujui' : 'tolak'}`);
        }
        fetchLaporan();
      } catch {
        if (Platform.OS === 'web') window.alert('Gagal mengubah status laporan');
        else Alert.alert('Gagal', 'Gagal mengubah status laporan');
      } finally {
        setUpdatingStatus(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Apakah Anda yakin ingin ${label} laporan ini?`)) {
        performAction();
      }
      return;
    }

    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${label} laporan ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: status === 'approved' ? '✅ Setujui' : '❌ Tolak',
          style: status === 'rejected' ? 'destructive' : 'default',
          onPress: performAction,
        },
      ]
    );
  };

  const handleAddKomentar = async () => {
    if (!komentar.trim()) return;
    setSendingKom(true);
    try {
      await laporanApi.addKomentar(Number(id), komentar.trim());
      setKomentar('');
      fetchLaporan();
    } catch {
      Alert.alert('Gagal', 'Gagal mengirim komentar');
    } finally {
      setSendingKom(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerFull}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat laporan...</Text>
      </View>
    );
  }

  if (!laporan) return null;

  const handleDelete = () => {
    const performDelete = async () => {
      setLoading(true);
      try {
        await laporanApi.delete(laporan!.id);
        if (Platform.OS === 'web') {
          window.alert('Laporan berhasil dihapus');
        } else {
          Alert.alert('Berhasil', 'Laporan berhasil dihapus');
        }
        router.back();
      } catch {
        if (Platform.OS === 'web') {
          window.alert('Gagal menghapus laporan');
        } else {
          Alert.alert('Gagal', 'Gagal menghapus laporan');
        }
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.')) {
        performDelete();
      }
      return;
    }

    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: performDelete },
      ]
    );
  };

  const isAdmin = user && ['admin', 'super_admin'].includes(user.role);
  const isOwner = user?.id === laporan.user_id;
  const canEdit = isOwner && laporan.status === 'pending';
  const hasImages = laporan.gambar && laporan.gambar.length > 0;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* Category strip + header card */}
        <View style={styles.headerCard}>
          <View style={[styles.catStrip, { backgroundColor: laporan.kategori?.warna || Colors.purple }]} />
          <View style={styles.headerBody}>
            {/* Badges */}
            <View style={styles.badgeRow}>
              <View style={[styles.catBadge, { backgroundColor: laporan.kategori?.warna || Colors.purple }]}>
                <Text style={styles.catText}>{laporan.kategori?.nama}</Text>
              </View>
              <StatusBadge status={laporan.status} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{laporan.judul}</Text>

            {/* Meta */}
            <View style={styles.meta}>
              <View style={styles.metaAvatar}>
                <Text style={styles.metaAvatarTxt}>{getInitials(laporan.pelapor?.nama || '?')}</Text>
              </View>
              <View>
                <Text style={styles.metaName}>{laporan.pelapor?.nama}</Text>
                <Text style={styles.metaDate}>{formatDateTime(laporan.created_at)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Admin actions */}
        {isAdmin && laporan.status === 'pending' && (
          <View style={styles.adminCard}>
            <Text style={styles.adminLabel}>⚙️ Tindakan Admin</Text>
            <View style={styles.adminBtns}>
              <TouchableOpacity
                style={[styles.adminBtn, styles.approveBtn, updatingStatus && styles.btnDisabled]}
                onPress={() => handleStatus('approved')}
                disabled={updatingStatus}
              >
                {updatingStatus ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.adminBtnTxt}>✅ Setujui</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adminBtn, styles.rejectBtn, updatingStatus && styles.btnDisabled]}
                onPress={() => handleStatus('rejected')}
                disabled={updatingStatus}
              >
                {updatingStatus ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.adminBtnTxt}>❌ Tolak</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Owner actions */}
        {canEdit && (
          <View style={styles.ownerActions}>
            <Text style={styles.adminLabel}>👤 Tindakan Anda</Text>
            <View style={styles.adminBtns}>
              <TouchableOpacity 
                style={[styles.adminBtn, styles.editBtnNew]} 
                onPress={() => router.push(`/laporan/edit/${laporan.id}` as any)}
              >
                <Text style={styles.editBtnTxtNew}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.adminBtn, styles.deleteBtn]} 
                onPress={handleDelete}
              >
                <Text style={styles.deleteBtnTxt}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Image gallery */}
        {hasImages && (
          <View style={styles.galleryCard}>
            <Text style={styles.sectionTitle}>📷 Lampiran Foto ({laporan.gambar.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
              {laporan.gambar.map(g => {
              let uri = g.url;
              if (Platform.OS === 'android' && uri.includes('localhost')) {
                uri = uri.replace('localhost', '10.0.2.2');
              }
              return (
                <TouchableOpacity key={g.id} onPress={() => setLightbox(uri)} activeOpacity={0.85}>
                  <Image source={{ uri }} style={styles.galleryImg} />
                </TouchableOpacity>
              );
            })}
            </ScrollView>
          </View>
        )}

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.sectionTitle}>📝 Deskripsi Laporan</Text>
          <Text style={styles.descText}>{laporan.deskripsi}</Text>
        </View>

        {/* Comments section */}
        <View style={styles.komentarCard}>
          <Text style={styles.sectionTitle}>💬 Komentar ({laporan.komentar?.length || 0})</Text>

          {laporan.komentar && laporan.komentar.length > 0 ? (
            <View style={styles.komentarList}>
              {laporan.komentar.map(k => (
                <KomentarItem key={k.id} komentar={k} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyKom}>
              <Text style={styles.emptyKomEmoji}>💭</Text>
              <Text style={styles.emptyKomText}>Belum ada komentar</Text>
            </View>
          )}
        </View>

        {/* Extra bottom space for keyboard */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Sticky comment input */}
      {user && (
        <View style={styles.inputBar}>
          <View style={styles.inputAvatar}>
            <Text style={styles.inputAvatarTxt}>{getInitials(user.nama)}</Text>
          </View>
          <TextInput
            style={styles.komInput}
            placeholder="Tulis komentar..."
            placeholderTextColor={Colors.muteSoft}
            value={komentar}
            onChangeText={setKomentar}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!komentar.trim() || sendingKom) && styles.sendBtnDisabled]}
            onPress={handleAddKomentar}
            disabled={!komentar.trim() || sendingKom}
          >
            {sendingKom
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.sendTxt}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Lightbox */}
      <Modal visible={!!lightbox} transparent animationType="fade" onRequestClose={() => setLightbox(null)}>
        <TouchableOpacity style={styles.lightbox} onPress={() => setLightbox(null)} activeOpacity={1}>
          {lightbox && (
            <Image source={{ uri: lightbox }} style={styles.lightboxImg} resizeMode="contain" />
          )}
          <Text style={styles.lightboxClose}>✕ Tutup</Text>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bgLight },
  container: { paddingBottom: 24 },
  centerFull: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#fff' },
  loadingText: { fontSize: 14, color: Colors.mute },

  headerCard: {
    backgroundColor: '#fff', marginBottom: 12, overflow: 'hidden',
    borderBottomWidth: 1, borderBottomColor: Colors.hairline,
  },
  catStrip: { height: 5 },
  headerBody: { padding: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  catBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
  catText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.ink, lineHeight: 28, marginBottom: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  metaAvatarTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  metaName: { fontSize: 13, fontWeight: '600', color: Colors.ink },
  metaDate: { fontSize: 11, color: Colors.mute },

  adminCard: {
    backgroundColor: '#fff', padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.hairline,
  },
  adminLabel: { fontSize: 13, fontWeight: '600', color: Colors.body, marginBottom: 10 },
  adminBtns: { flexDirection: 'row', gap: 10 },
  adminBtn: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  approveBtn: { backgroundColor: Colors.bgGreen, borderWidth: 1, borderColor: '#bbf7d0' },
  rejectBtn: { backgroundColor: Colors.bgRed, borderWidth: 1, borderColor: '#fecaca' },
  adminBtnTxt: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  btnDisabled: { opacity: 0.5 },

  ownerActions: {
    backgroundColor: '#fff', padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.hairline,
  },
  editBtnNew: { backgroundColor: Colors.bgLight, borderWidth: 1, borderColor: Colors.hairline },
  editBtnTxtNew: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  deleteBtn: { backgroundColor: Colors.bgRed, borderWidth: 1, borderColor: '#fecaca' },
  deleteBtnTxt: { fontSize: 14, fontWeight: '600', color: Colors.rejected },

  galleryCard: {
    backgroundColor: '#fff', padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.hairline,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.ink, marginBottom: 12 },
  gallery: { gap: 8, paddingRight: 4 },
  galleryImg: {
    width: 140, height: 100, borderRadius: 8,
    resizeMode: 'cover', borderWidth: 1, borderColor: Colors.hairline,
  },

  descCard: {
    backgroundColor: '#fff', padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.hairline,
  },
  descText: { fontSize: 15, color: Colors.body, lineHeight: 24 },

  komentarCard: {
    backgroundColor: '#fff', padding: 16,
    borderWidth: 1, borderColor: Colors.hairline,
  },
  komentarList: { gap: 2 },
  emptyKom: { alignItems: 'center', paddingVertical: 24 },
  emptyKomEmoji: { fontSize: 32, marginBottom: 8 },
  emptyKomText: { fontSize: 13, color: Colors.mute },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#fff', padding: 12, gap: 10,
    borderTopWidth: 1, borderTopColor: Colors.hairline,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: -2 },
  },
  inputAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  inputAvatarTxt: { color: '#fff', fontSize: 11, fontWeight: '600' },
  komInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.hairline,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: Colors.ink, maxHeight: 100,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },

  lightbox: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  lightboxImg: { width: SCREEN_W, height: SCREEN_W * 0.9 },
  lightboxClose: { color: 'rgba(255,255,255,0.7)', marginTop: 24, fontSize: 15 },
});
