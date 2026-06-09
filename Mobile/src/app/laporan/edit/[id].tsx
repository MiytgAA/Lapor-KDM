// src/app/laporan/edit/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform,
  KeyboardAvoidingView, Modal, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePickerLib from 'expo-image-picker';
import { laporanApi, kategoriApi } from '@/lib/api';
import { Colors } from '@/lib/colors';
import type { Kategori } from '@/lib/types';
import { Image } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

export default function EditLaporanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori_id: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<{ uri: string; name?: string; type?: string; isNew?: boolean }[]>([]);
  const [imageChanged, setImageChanged] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  
  const [loadingKat, setLoadingKat] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch kategori
    kategoriApi.getAll()
      .then(r => setKategoris(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingKat(false));

    // Fetch existing laporan
    if (id) {
      laporanApi.getById(Number(id))
        .then(r => {
          const l = r.data.data;
          setForm({
            judul: l.judul,
            deskripsi: l.deskripsi,
            kategori_id: String(l.kategori_id),
          });
          if (l.gambar && l.gambar.length > 0) {
            setImages(l.gambar.map(g => {
              let uri = g.url;
              if (Platform.OS === 'android' && uri.includes('localhost')) {
                uri = uri.replace('localhost', '10.0.2.2');
              }
              return { uri, isNew: false };
            }));
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Data laporan tidak ditemukan');
          router.back();
        })
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  const setField = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.judul.trim() || form.judul.length < 5) e.judul = 'Judul minimal 5 karakter';
    if (!form.kategori_id) e.kategori_id = 'Pilih kategori laporan';
    if (!form.deskripsi.trim() || form.deskripsi.length < 10) e.deskripsi = 'Deskripsi minimal 10 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pickImages = async (fromCamera: boolean) => {
    if (images.length >= 5) {
      Alert.alert('Batas Foto', 'Maksimal 5 foto per laporan');
      return;
    }
    const permission = fromCamera
      ? await ImagePickerLib.requestCameraPermissionsAsync()
      : await ImagePickerLib.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Izin Ditolak', fromCamera ? 'Izin kamera diperlukan' : 'Izin galeri diperlukan');
      return;
    }

    const result = fromCamera
      ? await ImagePickerLib.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
      : await ImagePickerLib.launchImageLibraryAsync({
          mediaTypes: ['images'], quality: 0.8,
          allowsMultipleSelection: true,
          selectionLimit: 5 - images.length,
        });

    if (!result.canceled) {
      const newImgs = result.assets.map(a => ({
        uri: a.uri,
        name: a.fileName || `photo_${Date.now()}.jpg`,
        type: a.mimeType || 'image/jpeg',
        isNew: true,
      }));
      setImages(prev => [...prev, ...newImgs].slice(0, 5));
      setImageChanged(true);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') { pickImages(false); return; }
    Alert.alert('Tambah Foto', 'Pilih sumber foto', [
      { text: '📷 Kamera', onPress: () => pickImages(true) },
      { text: '🖼️ Galeri', onPress: () => pickImages(false) },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImageChanged(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      let submitData: any;
      if (imageChanged) {
        const fd = new FormData();
        fd.append('judul', form.judul.trim());
        fd.append('deskripsi', form.deskripsi.trim());
        fd.append('kategori_id', form.kategori_id);
        fd.append('replace_gambar', 'true');
        images.filter(img => img.isNew).forEach(img => {
          fd.append('gambar', { uri: img.uri, name: img.name, type: img.type } as any);
        });
        submitData = fd;
      } else {
        submitData = {
          judul: form.judul.trim(),
          deskripsi: form.deskripsi.trim(),
          kategori_id: Number(form.kategori_id),
        };
      }

      await laporanApi.update(Number(id), submitData);

      if (Platform.OS === 'web') {
        window.alert('Berhasil! 🎉 Laporan berhasil diperbarui.');
        router.back(); // Go back to details
      } else {
        Alert.alert('Berhasil! 🎉', 'Laporan berhasil diperbarui.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.response?.data?.message || 'Gagal memperbarui laporan.');
      } else {
        Alert.alert('Gagal', err.response?.data?.message || 'Gagal memperbarui laporan.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.centerFull}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.mute }}>Memuat data laporan...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Judul */}
        <View style={styles.field}>
          <Text style={styles.label}>Judul Laporan <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.judul && styles.inputError]}
            placeholder="Tuliskan judul laporan secara singkat"
            placeholderTextColor={Colors.muteSoft}
            value={form.judul}
            onChangeText={v => setField('judul', v)}
            maxLength={255}
          />
          <View style={styles.inputFooter}>
            {errors.judul ? <Text style={styles.errorText}>{errors.judul}</Text> : <Text />}
            <Text style={styles.charCount}>{form.judul.length}/255</Text>
          </View>
        </View>

        {/* Kategori */}
        <View style={styles.field}>
          <Text style={styles.label}>Kategori <Text style={styles.required}>*</Text></Text>
          <View style={styles.kategorisWrap}>
            {loadingKat ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              kategoris.map(k => (
                <TouchableOpacity
                  key={k.id}
                  style={[
                    styles.katChip,
                    { borderColor: k.warna },
                    form.kategori_id === String(k.id) && { backgroundColor: k.warna },
                  ]}
                  onPress={() => setField('kategori_id', String(k.id))}
                  activeOpacity={0.7}
                >
                  <View style={[styles.katDot, { backgroundColor: k.warna }]} />
                  <Text style={[
                    styles.katLabel,
                    form.kategori_id === String(k.id) && { color: '#fff', fontWeight: '600' },
                  ]}>
                    {k.nama}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
          {errors.kategori_id ? <Text style={styles.errorText}>{errors.kategori_id}</Text> : null}
        </View>

        {/* Deskripsi */}
        <View style={styles.field}>
          <Text style={styles.label}>Deskripsi Lengkap <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.textarea, errors.deskripsi && styles.inputError]}
            placeholder="Jelaskan laporan Anda secara detail: lokasi, waktu kejadian, dan dampak yang ditimbulkan..."
            placeholderTextColor={Colors.muteSoft}
            value={form.deskripsi}
            onChangeText={v => setField('deskripsi', v)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.deskripsi ? <Text style={styles.errorText}>{errors.deskripsi}</Text> : null}
        </View>

        {/* Foto */}
        <View style={styles.field}>
          <Text style={styles.label}>Foto Bukti <Text style={styles.optional}>(Opsional, maks. 5 foto)</Text></Text>
          <View style={styles.photoGrid}>
            {images.map((img, i) => (
              <TouchableOpacity key={i} style={styles.photoThumb} onPress={() => setLightbox(img.uri)} activeOpacity={0.85}>
                <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                  <Text style={styles.removeTxt}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addPhoto} onPress={showImageOptions}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>Tambah Foto</Text>
              </TouchableOpacity>
            )}
          </View>
          {images.length > 0 && !imageChanged && (
            <Text style={{ fontSize: 11, color: Colors.mute, marginTop: 8 }}>
              Hapus atau tambah foto untuk mengubah lampiran.
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btnSubmit, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnSubmitText}>💾 Simpan Perubahan</Text>
          }
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={() => router.back()}
          disabled={submitting}
        >
          <Text style={styles.btnCancelText}>Batal</Text>
        </TouchableOpacity>
      </ScrollView>

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
  centerFull: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, paddingBottom: 48, paddingTop: 24 },
  field: {
    backgroundColor: '#fff', borderRadius: 10, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.hairline,
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.body, marginBottom: 8 },
  required: { color: Colors.rejected },
  input: {
    borderWidth: 1, borderColor: Colors.hairline, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: Colors.ink,
  },
  inputError: { borderColor: Colors.rejected },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  charCount: { fontSize: 11, color: Colors.mute },
  errorText: { fontSize: 12, color: Colors.rejected, marginTop: 4 },
  textarea: {
    borderWidth: 1, borderColor: Colors.hairline, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: Colors.ink, minHeight: 120,
  },
  kategorisWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  katChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 6, borderWidth: 1.5,
  },
  katDot: { width: 8, height: 8, borderRadius: 4 },
  katLabel: { fontSize: 13, color: Colors.body },
  btnSubmit: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingVertical: 16, alignItems: 'center', marginTop: 12,
  },
  btnCancel: {
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnSubmitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnCancelText: { color: Colors.mute, fontSize: 15, fontWeight: '600' },
  optional: { fontWeight: '400', color: Colors.mute },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  photoThumb: {
    width: 80, height: 80, borderRadius: 8,
    overflow: 'hidden', position: 'relative',
  },
  thumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeBtn: {
    position: 'absolute', top: 3, right: 3,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  removeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addPhoto: {
    width: 80, height: 80, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.hairline,
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.bgLight,
  },
  addPhotoIcon: { fontSize: 22, marginBottom: 2 },
  addPhotoText: { fontSize: 10, color: Colors.mute, fontWeight: '500' },
  lightbox: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  lightboxImg: { width: SCREEN_W, height: SCREEN_W * 0.9 },
  lightboxClose: { color: 'rgba(255,255,255,0.7)', marginTop: 24, fontSize: 15 },
});
