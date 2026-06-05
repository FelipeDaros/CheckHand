import { Suspense, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { BellSlash } from 'phosphor-react-native';
import { migrateDbIfNeeded } from '@/database';
import { hasPin } from '@/utils/security';
import { NotificationContext } from '@/contexts/NotificationContext';
import { colors, spacing, typography } from '@/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('checklists', {
      name: 'Checklists',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

setupAndroidChannel();

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider databaseName="checkhand.db" onInit={migrateDbIfNeeded} useSuspense>
        <StatusBar style="dark" />
        <RootNavigator />
      </SQLiteProvider>
    </Suspense>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);
  const [notifBlocked, setNotifBlocked] = useState(false);
  const appState = useRef(AppState.currentState);

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

  useEffect(() => {
    async function requestAndCheckNotifPermission() {
      await Notifications.requestPermissionsAsync();
      const { status } = await Notifications.getPermissionsAsync();
      setNotifBlocked(status === 'denied');
    }

    async function checkNotifPermission() {
      const { status } = await Notifications.getPermissionsAsync();
      setNotifBlocked(status === 'denied');
    }

    requestAndCheckNotifPermission();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        checkNotifPermission();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const checklistId = response.notification.request.content.data?.checklistId;
      if (checklistId) {
        router.push(`/checklist/${checklistId}`);
      }
    });
    return () => sub.remove();
  }, [router]);

  if (!checked) return <Loading />;

  return (
    <NotificationContext.Provider value={{ notifBlocked }}>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        {notifBlocked && (
          <View style={styles.notifBanner}>
            <BellSlash size={14} color={colors.surfaceCard} weight="fill" />
            <Text style={styles.notifBannerText}>
              Notificações bloqueadas — ative nas configurações do dispositivo
            </Text>
          </View>
        )}
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.canvas },
            headerTintColor: colors.ink,
            contentStyle: { backgroundColor: colors.canvas },
            headerStatusBarHeight: notifBlocked ? 0 : undefined,
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
          <Stack.Screen
            name="water-settings"
            options={{ title: 'Hidratação' }}
          />
        </Stack>
      </SafeAreaView>
    </NotificationContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentRed,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  notifBannerText: {
    ...typography.captionSm,
    color: colors.surfaceCard,
    flex: 1,
  },
});
