import { Stack, useRouter, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getDb } from '../db/database';
import { getSettings } from '../db/settingsRepo';
import { seedChecklistIfEmpty } from '../db/checklistRepo';
import { useAppStore } from '../store';
import { getDayNumber } from '../lib/utils';
import { colors } from '../lib/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const setSettings = useAppStore((s) => s.setSettings);
  const setDayNumber = useAppStore((s) => s.setDayNumber);
  const setLoading = useAppStore((s) => s.setLoading);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function init() {
      try {
        await getDb();
        await seedChecklistIfEmpty();
        const settings = await getSettings();
        if (settings) {
          setSettings(settings);
          setDayNumber(getDayNumber(settings.start_date));
        }
        const isOnboarded = settings?.onboarding_complete === 1;
        setOnboarded(isOnboarded);
      } catch (e) {
        const msg = e instanceof Error ? e.message + '\n' + e.stack : String(e);
        console.error('Init error:', e);
        setInitError(msg);
        setOnboarded(false);
      } finally {
        setLoading(false);
        setReady(true);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (onboarded === false) {
      router.replace('/onboarding/welcome');
    } else {
      // Only redirect to learn tab from neutral/root paths — don't override deep-links
      const isNeutralPath = !pathname || pathname === '/' || pathname === '/index';
      if (isNeutralPath) {
        router.replace('/(tabs)/learn');
      }
    }
  }, [ready, onboarded]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {initError ? (
          <Text style={{ color: '#ff6b6b', fontSize: 12, textAlign: 'center', fontFamily: 'monospace' }}>{initError}</Text>
        ) : (
          <ActivityIndicator color={colors.accent} size="large" />
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
