// src/app/laporan/edit/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { laporanApi, kategoriApi } from '@/lib/api';
import { Colors } from '@/lib/colors';
import type { Kategori } from '@/lib/types';

export default function EditLaporanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori_id: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await laporanApi.update(Number(id), {
        judul: form.judul.trim(),
        deskripsi: form.deskripsi.trim(),
        kategori_id: Number(form.kategori_id),
      });

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
});
