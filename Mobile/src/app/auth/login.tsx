// src/app/auth/login.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/lib/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Format email tidak valid';
    if (!password) e.password = 'Password wajib diisi';
    else if (password.length < 6) e.password = 'Password minimal 6 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation handled by auth guard in _layout.tsx
    } catch (err: any) {
      console.error('[Login Error]', err);
      let msg = 'Email atau password salah';
      if (!err.response) {
        msg = 'Tidak dapat menghubungi server backend. Pastikan server backend Anda berjalan dan HP Anda terhubung ke jaringan Wi-Fi yang sama.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      Alert.alert('Login Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header branding */}
        <View style={styles.header}>
          <View style={styles.logoRing}>
            <Image
              source={require('@/assets/images/kdm-mascot.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Lapor KDM</Text>
          <Text style={styles.tagline}>Sistem Pengaduan Masyarakat</Text>
        </View>

        {/* Card form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Masuk ke Akun</Text>
          <Text style={styles.cardSub}>Gunakan email dan password yang terdaftar</Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="contoh@email.com"
              placeholderTextColor={Colors.muteSoft}
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors(e => ({ ...e, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Masukkan password"
              placeholderTextColor={Colors.muteSoft}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnPrimaryText}>Masuk</Text>
            }
          </TouchableOpacity>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerLabel}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Accounts */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>AKUN DEMO</Text>
          {[
            { role: 'Super Admin', email: 'superadmin@laporkdm.id', pass: 'admin123' },
            { role: 'Admin', email: 'admin@laporkdm.id', pass: 'admin123' },
            { role: 'User', email: 'user@laporkdm.id', pass: 'user123' },
          ].map((a) => (
            <TouchableOpacity 
              key={a.email} 
              style={styles.demoRow} 
              onPress={() => { setEmail(a.email); setPassword(a.pass); }}
            >
              <Text style={styles.demoRole}>{a.role}:</Text>
              <Text style={styles.demoEmail}>{a.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoImg: { width: 110, height: 110 },
  appName: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: { fontSize: 20, fontWeight: '600', color: Colors.ink, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.mute, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.body, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: Colors.rejected },
  errorText: { fontSize: 12, color: Colors.rejected, marginTop: 4 },
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerLabel: { fontSize: 14, color: Colors.mute },
  registerLink: { fontSize: 14, fontWeight: '600', color: Colors.purple },
  demoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  demoTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  demoRole: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    width: 90,
  },
  demoEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
});
