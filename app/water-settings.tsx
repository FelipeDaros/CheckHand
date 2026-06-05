import { useRouter } from 'expo-router';
import { useWater } from '@/hooks/useWater';
import { WaterSettings } from '@/components/WaterSettings';

type Settings = {
  goalMl: number;
  notifEnabled: boolean;
  intervalH: number;
  startH: number;
  endH: number;
};

export default function WaterSettingsScreen() {
  const router = useRouter();
  const { settings, saveSettings } = useWater();

  async function handleSave(next: Settings) {
    await saveSettings(next);
    router.back();
  }

  return <WaterSettings initialSettings={settings} onSave={handleSave} />;
}
