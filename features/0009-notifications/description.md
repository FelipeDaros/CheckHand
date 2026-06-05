# 0009 — Notificações Locais

## Objetivo
Agendar notificações locais para checklists com data de prazo (`due_date`), lembrando o usuário no dia do vencimento. Não usa push — é 100% local no dispositivo.

## Status
`Concluído`

## Dependências
- [0001-database-setup](../0001-database-setup.md)
- [0003-checklist-crud](../0003-checklist-crud.md)
- [0007-due-date](../0007-due-date.md)
- [0008-settings](../0008-settings.md)

---

## Comportamento

### Quando agendar
- Ao criar um checklist com `due_date`
- Ao editar um checklist e definir ou alterar o `due_date`
- A notificação dispara **às 9h do dia do prazo**
- Se o prazo já passou, nenhuma notificação é agendada (silencioso)
- Só agenda se o toggle "Notificações" estiver ativo nas configurações

### Quando cancelar
- Ao editar um checklist e remover o `due_date`
- Ao alterar o `due_date` (cancela a anterior, agenda nova)
- Ao deletar um checklist
- Ao desativar o toggle nas configurações (cancela todas + limpa `notification_id` no banco)
- Ao usar "Limpar todos os dados" nas configurações

### Conteúdo da notificação
- **Title**: título do checklist
- **Body**: `"Prazo hoje!"`
- **Data**: `{ checklistId: number }` — usado para navegar ao tocar

### Permissões
- Solicitada na primeira vez que o usuário cria/edita um checklist com `due_date`
- Se concedida: notificação agendada normalmente
- Se negada: `Alert` informando que notificações estão bloqueadas + banner vermelho persistente no topo do app com ícone de sino bloqueado
- O banner desaparece automaticamente quando o usuário ativa a permissão nas configurações do dispositivo e retorna ao app
- O salvamento do checklist nunca é bloqueado por falta de permissão

---

## Modelo de Dados

Migration v2 adicionou `notification_id` na tabela `checklists`:

```sql
ALTER TABLE checklists ADD COLUMN notification_id TEXT;
```

O valor é o identificador retornado por `scheduleNotificationAsync`. Usado para cancelar individualmente sem precisar varrer todas as notificações agendadas.

---

## Configuração Android

Channel registrado no módulo-level de `app/_layout.tsx` (fora de qualquer componente):

```typescript
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

---

## Arquivos Criados/Modificados

```
src/
├── repositories/
│   ├── notificationRepository.ts   # CRIADO — schedule/cancel/cancelAll
│   └── checklistRepository.ts      # MODIFICADO — updateChecklist aceita notificationId,
│                                   #              nova fn updateNotificationId
├── hooks/
│   ├── useNotifications.ts         # CRIADO — permissão, schedule, cancel, permissionDenied
│   └── useChecklists.ts            # MODIFICADO — add() retorna id, remove() cancela notif,
│                                   #              update() aceita notificationId
│   └── useSettings.ts              # MODIFICADO — notificationsEnabled + toggleNotifications
├── contexts/
│   └── NotificationContext.tsx     # CRIADO — compartilha notifBlocked entre layout e tabs
├── types/
│   └── index.ts                    # MODIFICADO — Checklist.notification_id: string | null
├── database/
│   └── migrations.ts               # MODIFICADO — DATABASE_VERSION 2, migration v2
app/
├── _layout.tsx                     # MODIFICADO — channel, handler, tap listener,
│                                   #              banner de permissão bloqueada,
│                                   #              NotificationContext.Provider
├── (tabs)/
│   ├── _layout.tsx                 # MODIFICADO — headerStatusBarHeight zerado quando
│   │                               #              banner está visível
│   └── settings.tsx                # MODIFICADO — seção Preferências com toggle Notificações
├── checklist/
│   ├── new.tsx                     # MODIFICADO — agenda notif após criar checklist
│   └── [id]/edit.tsx               # MODIFICADO — cancela antiga e agenda nova ao editar
```

---

## Incompatibilidade com Expo Go

`expo-notifications` não funciona no Expo Go desde o SDK 53. Para testar é necessário um **development build**:

```bash
npx expo run:android
```

---

## Tasks

- [x] Instalar `expo-notifications`
- [x] Criar migration v2: `notification_id TEXT` em `checklists`
- [x] Configurar Android channel em `app/_layout.tsx`
- [x] Criar `src/repositories/notificationRepository.ts`
- [x] Criar `src/hooks/useNotifications.ts`
- [x] Criar `src/contexts/NotificationContext.tsx`
- [x] Integrar agendamento em `app/checklist/new.tsx` e `app/checklist/[id]/edit.tsx`
- [x] Cancelar notificação ao deletar checklist (via `useChecklists.remove`)
- [x] Adicionar toggle "Notificações" na tela de Configurações
- [x] Registrar handler de toque na notificação em `app/_layout.tsx`
- [x] Banner de permissão bloqueada no topo do app
- [x] `headerStatusBarHeight` zerado nas Tabs quando banner está visível

---

## Critérios de Aceite

- [x] Permissão solicitada na primeira vez que o usuário define um prazo
- [x] Notificação agendada corretamente quando checklist tem `due_date` futuro
- [x] Notificação cancelada ao remover prazo ou deletar checklist
- [x] Tocar na notificação abre o checklist correspondente
- [x] Toggle nas configurações cancela todas as notificações quando desativado
- [x] Banner vermelho aparece quando permissão está negada e some ao ser concedida
- [x] Funciona em Android (com channel) — requer development build
