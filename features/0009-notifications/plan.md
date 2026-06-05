# Notificações Locais (0009)

## FASE 1 — Infraestrutura [Completada ✅]

### Instalar expo-notifications [Completada ✅]

```bash
npx expo install expo-notifications
```

### Migration v2 — coluna notification_id [Completada ✅]

`src/database/migrations.ts` — `DATABASE_VERSION` incrementado para `2`:

```typescript
if (currentVersion === 1) {
  await db.execAsync('ALTER TABLE checklists ADD COLUMN notification_id TEXT;');
  currentVersion = 2;
}
```

### Configurar Android channel e handlers em app/_layout.tsx [Completada ✅]

Registrado no módulo-level (fora de componentes) para garantir execução antes do primeiro render:

```typescript
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
```

Listener de toque registrado via `useEffect` em `RootNavigator`:

```typescript
const sub = Notifications.addNotificationResponseReceivedListener((response) => {
  const checklistId = response.notification.request.content.data?.checklistId;
  if (checklistId) router.push(`/checklist/${checklistId}`);
});
return () => sub.remove();
```

### Comentários:
- `shouldShowBanner` e `shouldShowList` são campos obrigatórios no tipo `NotificationBehavior` — a versão do plano original usava apenas `shouldShowAlert` que gerava erro de TypeScript
- O channel Android é chamado no módulo-level, não dentro de um `useEffect`, para garantir que está disponível antes de qualquer agendamento

---

## FASE 2 — Repository e Hook [Completada ✅]

### Criar notificationRepository.ts [Completada ✅]

`src/repositories/notificationRepository.ts`:

```typescript
export async function scheduleChecklistNotification(
  checklistId: number,
  title: string,
  dueDateUnix: number,
): Promise<string | null>

export async function cancelChecklistNotification(notificationId: string): Promise<void>

export async function cancelAllChecklistNotifications(): Promise<void>
```

Trigger usa `SchedulableTriggerInputTypes.DATE` com `date` às 9h do dia do prazo. Se a data já passou, retorna `null` sem agendar.

### Criar useNotifications.ts [Completada ✅]

`src/hooks/useNotifications.ts` — expõe:

- `permissionDenied: boolean` — estado reativo da permissão
- `checkPermission()` — re-verifica o status (chamado no focus da Settings)
- `requestPermission()` — pede permissão se ainda não concedida, mostra Alert se negada
- `scheduleNotification()` — chama `requestPermission` internamente antes de agendar
- `cancelNotification()` — wrapper de `cancelChecklistNotification`
- `cancelAllNotifications()` — wrapper de `cancelAllChecklistNotifications`

### Comentários:
- `scheduleNotification` encapsula o `requestPermission` — os call sites não precisam se preocupar com o fluxo de permissão
- `permissionDenied` é sincronizado via `useEffect` no mount e atualizado após cada `requestPermission`

---

## FASE 3 — Integração com telas e deleção [Completada ✅]

### Atualizar checklistRepository.ts [Completada ✅]

- `updateChecklist` passou a aceitar `notificationId?: string | null` como 5º parâmetro
- Nova função `updateNotificationId(db, id, notificationId)` para atualizar só esse campo após criação
- `deleteChecklist` manteve assinatura original — o cancelamento foi movido para `useChecklists.remove`

### Atualizar useChecklists.ts [Completada ✅]

- `add()` agora retorna `Promise<number>` (ID do checklist criado)
- `update()` aceita `notificationId?: string | null` e persiste via `updateChecklist`
- `remove()` busca o `notification_id` do estado local (`checklists.find`) e cancela antes de deletar

### Integrar em app/checklist/new.tsx [Completada ✅]

Após `add()`, se `dueDate` foi definido e `notificationsEnabled`:
1. `scheduleNotification(id, title, dueDate)` → retorna `notifId`
2. `updateNotificationId(db, id, notifId)` → persiste no banco

### Integrar em app/checklist/[id]/edit.tsx [Completada ✅]

Compara `dueDate` novo com `checklist.due_date` original:
- Se mudou e havia `notification_id` anterior → cancela
- Se novo `dueDate` existe e mudou → agenda nova notificação
- Se `dueDate` foi removido → `newNotifId = null`
- Passa `newNotifId` para `update()`

### Comentários:
- A lógica de notificação ficou nas telas (`new.tsx`, `edit.tsx`), não no `ChecklistForm` — o form permanece agnóstico a notificações
- O plano original previa colocar a lógica no `ChecklistForm`, mas as telas são o local correto pois têm acesso ao contexto anterior do checklist

---

## FASE 4 — Toggle nas Configurações e Banner [Completada ✅]

### Toggle "Notificações" em settings.tsx [Completada ✅]

Seção "Preferências" adicionada com `Switch`:
- Persiste em `app_settings` com chave `notifications_enabled` (`'1'` ou `'0'`)
- Ao desativar: `cancelAllNotifications()` + `UPDATE checklists SET notification_id = NULL`
- `useSettings` atualizado com `notificationsEnabled` e `toggleNotifications()`

### Banner de permissão bloqueada em _layout.tsx [Completada ✅]

`RootNavigator` verifica `Notifications.getPermissionsAsync()` no mount e ao retornar do background (`AppState`). Se `status === 'denied'`, exibe banner vermelho no topo.

`NotificationContext` criado em `src/contexts/NotificationContext.tsx` para compartilhar `notifBlocked` com o layout das tabs.

### Eliminar duplo espaçamento no header das Tabs [Completada ✅]

O Tabs header aplica `headerStatusBarHeight` internamente. Quando o banner está visível, esse espaço já está sendo ocupado pelo banner — resultaria em dupla margem. Solução: `(tabs)/_layout.tsx` consome `NotificationContext` e passa `headerStatusBarHeight: notifBlocked ? 0 : undefined`.

### Comentários:
- O banner usa `marginTop: insets.top` (não `paddingTop`) para que o fundo vermelho comece abaixo da status bar nativa, e não atrás dela
- O `headerStatusBarHeight: undefined` restaura o comportamento padrão quando não há banner

---

## Ordem de execução implementada

```
Fase 1 (setup)
    └── Fase 2 (repository + hook)
            ├── Fase 3 (integração nas telas)
            └── Fase 4 (settings + banner) [executadas em sequência, não paralelas]
```
