import { Tabs } from 'expo-router';
import { Bell, CheckSquare, Drop, Gear } from 'phosphor-react-native';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { notifBlocked } = useNotificationContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mute,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopColor: colors.hairline,
        },
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        headerStatusBarHeight: notifBlocked ? 0 : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Checklists',
          tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="water"
        options={{
          title: 'Água',
          tabBarIcon: ({ color }) => <Drop size={24} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Lembretes',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <Gear size={24} color={color} weight="regular" />,
        }}
      />
    </Tabs>
  );
}
