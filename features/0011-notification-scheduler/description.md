# 0011 — Agendador de Notificações

## Objetivo

Criar um módulo autônomo de agendamento de notificações — uma nova aba "Notificações" no app onde o usuário pode criar lembretes recorrentes ou únicos, sem precisar de um checklist associado.

## Status

`Pendente`

## Dependências

- [0009-notifications](../0009-notifications/) — `expo-notifications` já instalado e configurado (channel Android, handler, permissão)

---

## Comportamento

### Aba "Notificações"

- Exibe lista de todos os agendamentos criados pelo usuário
- Cada item mostra: título, tipo de agendamento (ex: "Toda segunda e sexta às 9h"), badge de ativo/inativo
- Toggle para ativar/desativar individualmente sem deletar
- Swipe-to-delete ou botão de exclusão que cancela as notificações agendadas no sistema
- Botão "+" para criar novo agendamento

### Tipos de agendamento

#### 1. Por intervalo fixo

Dispara a cada X horas, repetindo indefinidamente até o usuário desativar.

Opções de intervalo: 1h, 2h, 4h, 6h, 8h, 12h, 24h

```
Trigger: TimeIntervalTriggerInput { seconds: X * 3600, repeats: true }
```

#### 2. Por dias da semana

Escolhe um ou mais dias da semana e um horário. Dispara semanalmente nesses dias.

```
Trigger: WeeklyTriggerInput (um por dia selecionado)
Ex: segunda + sexta às 9h → 2 notificações agendadas
```

#### 3. Por data específica

Dispara uma única vez em uma data e hora escolhidas. Após disparar, o item fica inativo automaticamente.

```
Trigger: DateTriggerInput { date: Date }
```

### Formulário de criação/edição

- **Título**: texto livre (obrigatório)
- **Mensagem**: texto livre (opcional, padrão: "Lembrete!")
- **Tipo**: seletor de 3 opções (intervalo / dias da semana / data específica)
- Campos adicionais dependem do tipo escolhido:
  - Intervalo: picker de horas
  - Dias da semana: chips selecionáveis (Seg, Ter, Qua, Qui, Sex, Sáb, Dom) + time picker
  - Data específica: date + time picker

### Desativar vs. deletar

| Ação | Comportamento |
|---|---|
| Toggle off | Cancela notificações agendadas no sistema, mantém o registro no banco |
| Toggle on | Re-agenda as notificações conforme config salva |
| Delete | Cancela notificações + remove o registro do banco |

### Integração com permissões (0009)

- Reutiliza `useNotifications` (pede permissão antes de agendar)
- Banner de permissão bloqueada do 0009 continua ativo

---

## Modelo de Dados

Migration v4 — nova tabela `scheduled_notifications`:

```sql
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT 'Lembrete!',
  type TEXT NOT NULL,             -- 'interval' | 'weekly' | 'date'
  config TEXT NOT NULL,           -- JSON com parâmetros do agendamento
  is_active INTEGER NOT NULL DEFAULT 1,
  notification_ids TEXT NOT NULL DEFAULT '[]',  -- JSON array de IDs retornados pelo expo
  created_at INTEGER NOT NULL     -- Unix timestamp
);
```

### Estrutura do campo `config` por tipo

```typescript
// type = 'interval'
{ hours: 4 }

// type = 'weekly'
{ weekdays: [2, 6], hour: 9, minute: 0 }
// weekdays: 1=Dom, 2=Seg, 3=Ter, 4=Qua, 5=Qui, 6=Sex, 7=Sáb (padrão expo)

// type = 'date'
{ timestamp: 1749600000 }
```

---

## Arquivos a Criar/Modificar

```
src/
├── database/
│   └── migrations.ts              # MODIFICADO — DATABASE_VERSION 4, tabela scheduled_notifications
├── types/
│   └── index.ts                   # MODIFICADO — tipo ScheduledNotification
├── repositories/
│   └── scheduledNotificationRepository.ts   # CRIADO — CRUD + schedule/cancel logic
├── hooks/
│   └── useScheduledNotifications.ts         # CRIADO — lista, create, toggle, delete
└── components/
    └── ScheduledNotificationCard.tsx         # CRIADO — card da lista com toggle + delete

app/
├── (tabs)/
│   ├── _layout.tsx                # MODIFICADO — nova aba "Notificações" com ícone Bell
│   └── notifications.tsx          # CRIADO — tela de lista de agendamentos
└── notification-form.tsx          # CRIADO — modal de criação/edição
```

---

## Critérios de Aceite

- [ ] Criar agendamento do tipo intervalo, semanal ou data específica
- [ ] Notificação dispara no horário correto em device real
- [ ] Toggle desativa/reativa agendamento sem perder configuração
- [ ] Delete cancela notificação agendada e remove do banco
- [ ] Agendamento por data se marca como inativo após disparar (verificado ao reabrir o app)
- [ ] Lista exibe tipo e configuração do agendamento de forma legível
- [ ] Permissão solicitada antes do primeiro agendamento
- [ ] Funciona em Android com development build
