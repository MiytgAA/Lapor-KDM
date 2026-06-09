// src/app/auth/register.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/lib/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ nama: '', email: '', password: '', konfirmasi: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nama.trim() || form.nama.length < 2) e.nama = 'Nama minimal 2 karakter';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email tidak valid';
    if (!form.password || form.password.length < 6) e.password = 'Password minimal 6 karakter';
    if (form.password !== form.konfirmasi) e.konfirmasi = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.nama.trim(), form.email.trim(), form.password);
    } catch (err: any) {
      console.error('[Register Error]', err);
      let msg = 'Registrasi gagal. Coba lagi.';
      if (!err.response) {
        msg = 'Tidak dapat menghubungi server backend. Pastikan server backend Anda berjalan dan HP Anda terhubung ke jaringan Wi-Fi yang sama.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      Alert.alert('Registrasi Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Kembali</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroText}>
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.sub}>Bergabung dan mulai laporkan pengaduan Anda</Text>
        </View>

        <View style={styles.card}>
          {/* Nama */}
          <View style={styles.field}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={[styles.input, errors.nama && styles.inputError]}
              placeholder="Nama Anda"
              placeholderTextColor={Colors.muteSoft}
              value={form.nama}
              onChangeText={v => set('nama', v)}
              autoCapitalize="words"
            />
            {errors.nama ? <Text style={styles.errorText}>{errors.nama}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="contoh@email.com"
              placeholderTextColor={Colors.muteSoft}
              value={form.email}
              onChangeText={v => set('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Minimal 6 karakter"
              placeholderTextColor={Colors.muteSoft}
              value={form.password}
              onChangeText={v => set('password', v)}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Konfirmasi */}
          <View style={styles.field}>
            <Text style={styles.label}>Konfirmasi Password</Text>
            <TextInput
              style={[styles.input, errors.konfirmasi && styles.inputError]}
              placeholder="Ulangi password"
              placeholderTextColor={Colors.muteSoft}
              value={form.konfirmasi}
              onChangeText={v => set('konfirmasi', v)}
              secureTextEntry
            />
            {errors.konfirmasi ? <Text style={styles.errorText}>{errors.konfirmasi}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnText}>Daftar Sekarang</Text>
            }
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primary },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  topBar: { marginBottom: 24 },
  backBtn: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
  heroText: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.body, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.hairline, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.ink },
  inputError: { borderColor: Colors.rejected },
  errorText: { fontSize: 12, color: Colors.rejected, marginTop: 4 },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginLabel: { fontSize: 14, color: Colors.mute },
  loginLink: { fontSize: 14, fontWeight: '600', color: Colors.purple },
});
