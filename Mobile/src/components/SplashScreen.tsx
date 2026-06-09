// src/components/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '@/lib/colors';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export function AppSplashScreen({ onFinish }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1: Fade in + scale up mascot
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Phase 2: Hold for 1.5s then fade out
      setTimeout(() => {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => onFinish());
      }, 1500);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: overlayOpacity }]}>
      {/* Background gradient effect via nested views */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Brand content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Mascot */}
        <View style={styles.mascotRing}>
          <Image
            source={require('@/assets/images/kdm-mascot.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        {/* Brand text */}
        <Text style={styles.appName}>Lapor KDM</Text>
        <Text style={styles.tagline}>Sistem Pengaduan Masyarakat</Text>

        {/* Decorative divider */}
        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: Colors.purple }]} />
          <View style={[styles.line, { backgroundColor: Colors.pink }]} />
          <View style={[styles.line, { backgroundColor: Colors.blue }]} />
        </View>
      </Animated.View>

      {/* Bottom label */}
      <Animated.Text style={[styles.version, { opacity: fadeAnim }]}>
        v1.0.0
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: 'rgba(122,61,255,0.08)',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: 'rgba(59,137,255,0.06)',
  },
  content: { alignItems: 'center', gap: 16 },
  mascotRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mascot: { width: 170, height: 170 },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  line: { width: 32, height: 3, borderRadius: 2 },
  version: {
    position: 'absolute',
    bottom: 48,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
  },
});
