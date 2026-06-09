// src/app/_layout.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppSplashScreen } from '@/components/SplashScreen';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [splashDone, setSplashDone] = useState(false);

  // Hide native splash once our custom splash is ready
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Redirect based on auth state (only after splash done)
  useEffect(() => {
    if (!splashDone || loading) return;
    const inAuth = segments[0] === 'auth';
    if (!user && !inAuth) {
      router.replace('/auth/login' as any);
    } else if (user && inAuth) {
      router.replace('/(tabs)' as any);
    }
  }, [user, loading, splashDone, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="laporan/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Detail Laporan',
            headerBackTitle: 'Kembali',
            headerStyle: { backgroundColor: '#fff' },
            headerShadowVisible: false,
          }}
        />
      </Stack>

      {/* Custom splash overlay — shown until splashDone */}
      {!splashDone && (
        <AppSplashScreen onFinish={() => setSplashDone(true)} />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
