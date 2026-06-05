import { useRouter } from 'expo-router';
import { useWater, type WaterSettings as Settings } from '@/hooks/useWater';
import { WaterSettings } from '@/components/WaterSettings';

export default function WaterSettingsScreen() {
  const router = useRouter();
  const { settings, saveSettings, loading } = useWater();

  async function handleSave(next: Settings) {
    await saveSettings(next);
    router.back();
  }

  if (loading) return null;

  return <WaterSettings initialSettings={settings} onSave={handleSave} />;
}
