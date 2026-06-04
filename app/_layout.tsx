import { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { migrateDbIfNeeded } from '@/database';
import { hasPin } from '@/utils/security';
import { getSetting } from '@/repositories/settingsRepository';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider databaseName="checkhand.db" onInit={migrateDbIfNeeded} useSuspense>
        <StatusBar style="dark" backgroundColor={colors.canvas} />
        <RootNavigator />
      </SQLiteProvider>
    </Suspense>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function checkPin() {
      try {
        const pinActive = await hasPin();
        const onPinScreen = segments[0] === 'pin';
        if (pinActive && !onPinScreen) {
          router.replace('/pin');
        }
      } finally {
        setChecked(true);
      }
    }
    checkPin();
  }, []);

  if (!checked) return <Loading />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.ink,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="checklist/new"
        options={{ title: 'Nova Checklist', presentation: 'modal' }}
      />
      <Stack.Screen
        name="checklist/[id]/edit"
        options={{ title: 'Editar Checklist', presentation: 'modal' }}
      />
      <Stack.Screen
        name="checklist/[id]/index"
        options={{ title: 'Checklist' }}
      />
      <Stack.Screen
        name="pin"
        options={{ title: '', headerShown: false }}
      />
    </Stack>
  );
}

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
});
