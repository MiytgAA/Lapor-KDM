// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { Colors } from '@/lib/colors';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10,
        fontWeight: focused ? '600' : '400',
        color: focused ? Colors.primary : Colors.mute,
        marginTop: 2,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: Colors.hairline,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        headerStyle: { backgroundColor: '#fff', shadowColor: 'transparent', elevation: 0 },
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: Colors.ink },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Lapor KDM',
          headerRight: () => null,
          tabBarIcon: ({ focused }) => <TabIcon label="Beranda" emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tambah"
        options={{
          headerTitle: 'Buat Laporan',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: focused ? Colors.primary : Colors.bgMuted,
              justifyContent: 'center', alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 16 : 8,
              elevation: 3,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}>
              <Text style={{ fontSize: 24, color: focused ? '#fff' : Colors.body }}>＋</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          headerTitle: 'Profil Saya',
          tabBarIcon: ({ focused }) => <TabIcon label="Profil" emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
