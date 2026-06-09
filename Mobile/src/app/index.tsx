// src/app/index.tsx
// Root redirect — handled by auth guard in _layout.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href={'/(tabs)' as any} />;
}
