# Agendador de Notificações (0011)

Se você está trabalhando nesta funcionalidade, atualize este arquivo conforme progride.

---

## FASE 1 — Banco de Dados e Tipos [Não Iniciada ⏳]

### Tarefa A — Migration v4 [Não Iniciada ⏳]

`src/database/migrations.ts` — incrementar `DATABASE_VERSION` para `4` e adicionar:

```sql
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT 'Lembrete!',
  type TEXT NOT NULL,
  config TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  notification_ids TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
);
```

### Tarefa B — Tipo ScheduledNotification [Não Iniciada ⏳]

`src/types/index.ts`:

```typescript
export type ScheduledNotificationType = 'interval' | 'weekly' | 'date';

export interface ScheduledNotification {
  id: number;
  title: string;
  body: string;
  type: ScheduledNotificationType;
  config: IntervalConfig | WeeklyConfig | DateConfig;
  is_active: boolean;
  notification_ids: string[];  // já parseado do JSON
  created_at: number;
}

export interface IntervalConfig { hours: number }
export interface WeeklyConfig { weekdays: number[]; hour: number; minute: number }
export interface DateConfig { timestamp: number }
```

---

## FASE 2 — Repository [Não Iniciada ⏳]

### Tarefa C — scheduledNotificationRepository.ts [Não Iniciada ⏳]

`src/repositories/scheduledNotificationRepository.ts`:

```typescript
// Retorna todos, parseando config e notification_ids do JSON
getAll(db): Promise<ScheduledNotification[]>

// Insere novo registro (sem notification_ids ainda — preenchido após agendar)
insert(db, data: Omit<ScheduledNotification, 'id' | 'notification_ids'>): Promise<number>

// Atualiza notification_ids após agendar no expo
updateNotificationIds(db, id, ids: string[]): Promise<void>

// Atualiza is_active
setActive(db, id, active: boolean): Promise<void>

// Remove linha do banco
remove(db, id): Promise<void>
```

O repository não chama `expo-notifications` diretamente — só SQL. O agendamento/cancelamento fica no hook.

---

## FASE 3 — Lógica de Agendamento (Hook) [Não Iniciada ⏳]

### Tarefa D — useScheduledNotifications.ts [Não Iniciada ⏳]

`src/hooks/useScheduledNotifications.ts`:

**Estado:** `notifications: ScheduledNotification[]`

**Funções:**

```typescript
// Carrega lista do banco no mount
load(): void

// Pede permissão → agenda no expo → insere no banco → atualiza notification_ids
create(data: CreateScheduledNotificationInput): Promise<void>

// Cancela IDs no expo → setActive(false) no banco → atualiza estado local
deactivate(id: number): Promise<void>

// Re-agenda no expo com a config existente → setActive(true) no banco → atualiza estado local
activate(id: number): Promise<void>

// Cancela IDs no expo → remove do banco → atualiza estado local
remove(id: number): Promise<void>
```

**Lógica de agendamento por tipo:**

```typescript
async function scheduleByType(notification: ScheduledNotification): Promise<string[]> {
  const { type, config, title, body } = notification;

  if (type === 'interval') {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: config.hours * 3600,
        repeats: true,
      },
    });
    return [id];
  }

  if (type === 'weekly') {
    const ids = await Promise.all(
      config.weekdays.map((weekday) =>
        Notifications.scheduleNotificationAsync({
          content: { title, body },
          trigger: {
            type: SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour: config.hour,
            minute: config.minute,
          },
        })
      )
    );
    return ids;
  }

  if (type === 'date') {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: new Date(config.timestamp * 1000),
      },
    });
    return [id];
  }

  return [];
}
```

**Detecção de disparo para `date`:** ao carregar a lista, verificar se notificações `type === 'date'` com `is_active = 1` têm `timestamp` no passado → chamar `deactivate()` automaticamente.

---

## FASE 4 — UI: Tela de Lista [Não Iniciada ⏳]

### Tarefa E — notifications.tsx (aba) [Não Iniciada ⏳]

`app/(tabs)/notifications.tsx`:

- `FlatList` de `ScheduledNotificationCard`
- Header com botão "+" que navega para `notification-form`
- Estado vazio: ilustração + "Nenhum lembrete criado"
- Sem pull-to-refresh (dados são locais e não mudam externamente)

### Tarefa F — ScheduledNotificationCard.tsx [Não Iniciada ⏳]

`src/components/ScheduledNotificationCard.tsx`:

- Título + descrição legível do agendamento (ex: "Toda segunda e sexta às 09:00")
- Toggle (`Switch`) à direita para ativar/desativar
- Botão de delete (ícone lixeira ou swipe)
- Estilo visual alinhado com o design system (`surfaceCard`, `rounded.md`, `spacing.lg`)

**Formatação legível do agendamento:**

```typescript
function describeSchedule(n: ScheduledNotification): string {
  if (n.type === 'interval') return `A cada ${n.config.hours}h`;
  if (n.type === 'weekly') {
    const names = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const days = n.config.weekdays.map(w => names[w - 1]).join(', ');
    return `Toda ${days} às ${pad(n.config.hour)}:${pad(n.config.minute)}`;
  }
  if (n.type === 'date') {
    const d = new Date(n.config.timestamp * 1000);
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
```

### Tarefa G — Adicionar aba ao _layout.tsx [Não Iniciada ⏳]

`app/(tabs)/_layout.tsx` — adicionar antes da aba "Configurações":

```typescript
import { Bell } from 'phosphor-react-native';

<Tabs.Screen
  name="notifications"
  options={{
    title: 'Lembretes',
    tabBarIcon: ({ color }) => <Bell size={24} color={color} weight="regular" />,
  }}
/>
```

---

## FASE 5 — UI: Formulário de Criação [Não Iniciada ⏳]

### Tarefa H — notification-form.tsx [Não Iniciada ⏳]

`app/notification-form.tsx` (modal ou tela pushed):

**Campos:**
1. Input de título (TextInput)
2. Input de mensagem (TextInput, padrão "Lembrete!")
3. Seletor de tipo: 3 opções em estilo de segmented control ou radio cards

**Campos condicionais por tipo:**

- **Intervalo:** picker de horas (1h, 2h, 4h, 6h, 8h, 12h, 24h) — `Picker` ou botões
- **Dias da semana:** chips Dom/Seg/Ter/Qua/Qui/Sex/Sáb (multi-select) + time picker (hora e minuto)
- **Data específica:** date + time picker (`DateTimePickerAndroid` / `@react-native-community/datetimepicker`)

**Validação antes de salvar:**
- Título obrigatório
- Tipo `weekly` exige pelo menos 1 dia selecionado
- Tipo `date` exige data futura

**Ao salvar:** chama `useScheduledNotifications.create()` → volta para a lista.

**Nota sobre DateTimePicker:** `@react-native-community/datetimepicker` já está incluído no Expo SDK 56 via `expo` package. Usar `npx expo install @react-native-community/datetimepicker` para garantir versão compatível.

---

## Ordem de execução

```
Fase 1 (banco + tipos)
    └── Fase 2 (repository)
            └── Fase 3 (hook)
                    ├── Fase 4 (tela de lista)  ← pode rodar junto com Fase 5
                    └── Fase 5 (formulário)
```

Fases 4 e 5 podem ser desenvolvidas em paralelo — ambas dependem do hook, mas não uma da outra.
