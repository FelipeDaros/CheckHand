import { useRouter } from 'expo-router';
import { ChecklistForm } from '@/components/ChecklistForm';
import { useChecklists } from '@/hooks/useChecklists';

export default function NewChecklistScreen() {
  const router = useRouter();
  const { add } = useChecklists();

  async function handleSubmit(title: string, description: string | null, dueDate: number | null) {
    await add(title, description, dueDate);
    router.back();
  }

  return (
    <ChecklistForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Criar"
    />
  );
}
