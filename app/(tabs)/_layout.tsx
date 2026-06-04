import { Tabs } from 'expo-router';
import { CheckSquare, Gear } from 'phosphor-react-native';
import { colors } from '@/theme';

export default function TabsLayout() {
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
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <Gear size={24} color={color} weight="regular" />,
        }}
      />
    </Tabs>
  );
}
