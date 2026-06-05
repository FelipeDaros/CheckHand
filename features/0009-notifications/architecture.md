# Architecture — Notificações Locais (0009)

## Decisões

### notification_id no banco SQLite (não no SecureStore)

Salvar o identificador retornado por `scheduleNotificationAsync` como coluna `TEXT` na tabela `checklists`.

**Por quê:** o `notification_id` é diretamente ligado ao checklist — faz sentido viver junto com ele. SecureStore é para segredos (PIN, tokens); AsyncStorage adicionaria outra dependência sem ganho real.

**Trade-off descartado:** armazenar todos os IDs em uma única chave no SecureStore como JSON. Problema: exige sincronização manual ao deletar/editar e fica fora de sincronia se o banco for limpo.

---

### Notificação às 9h do dia do prazo (sem "1 dia antes")

O trigger usa `SchedulableTriggerInputTypes.DATE` com `date` setado para às 9h do `due_date`.

**Por quê:** simplicidade para o MVP. O usuário já vê o badge visual de "vencendo hoje/amanhã" no card — a notificação é um reforço, não o único alerta.

**Extensão futura:** agendar duas notificações por checklist (1 dia antes + no dia), armazenando dois IDs (`notification_id_day_before`, `notification_id_due`).

---

### Sem re-agendamento em bulk ao reativar notificações

Ao reativar o toggle "Notificações" nas Settings, não re-agendamos automaticamente para todos os checklists com prazo.

**Por quê:** exigiria varrer todos os checklists, solicitar permissão e agendar N notificações em batch — complexidade alta para ganho baixo. O usuário pode editar qualquer checklist para re-acionar o agendamento.

---

### Permissão solicitada no momento de uso (não no launch)

A permissão é pedida na primeira vez que o usuário cria ou edita um checklist com `due_date`, não ao abrir o app.

**Por quê:** padrão recomendado pelas guidelines de iOS e Android — pedir no contexto de uso tem taxa de aceitação maior do que pedir no cold start.

---

### Lógica de notificação nas telas, não no ChecklistForm

O `ChecklistForm` permanece agnóstico a notificações. O agendamento e cancelamento acontecem em `new.tsx` e `edit.tsx`, após o retorno do `add()`/`update()`.

**Por quê:** o `ChecklistForm` é um componente de apresentação. As telas têm acesso ao contexto anterior do checklist (`checklist.notification_id`, `checklist.due_date`), necessário para comparar e decidir se cancela ou re-agenda. Colocar isso no form exigiria passar muitos props adicionais.

**Alternativa descartada:** colocar a lógica em `useChecklists` (hook). O hook não tem acesso ao título no momento do agendamento e tornaria a assinatura das funções mais complexa.

---

### cancelamento ao deletar via estado do hook, não via parâmetro do repository

`useChecklists.remove()` busca o `notification_id` do array de estado local antes de chamar `deleteChecklist`. `deleteChecklist` no repository não recebe nem cancela notificação.

**Por quê:** mantém o repository focado em SQL puro. O hook já tem o estado dos checklists em memória — não é necessário fazer um `SELECT` adicional.

---

### Banner de permissão via React Context + marginTop nos insets

O estado `notifBlocked` vive em `RootNavigator` e é compartilhado via `NotificationContext` com o layout das tabs.

**Por quê:** o banner precisa ser visível em todas as telas (tabs e modais). O `NotificationContext` evita prop drilling. A verificação acontece no mount e ao voltar do background via `AppState`.

O banner usa `marginTop: insets.top` (não `paddingTop`) para que o fundo vermelho comece abaixo da status bar nativa. Quando o banner está visível, o header das Tabs recebe `headerStatusBarHeight: 0` via contexto para eliminar o espaçamento duplicado.

---

### expo-notifications incompatível com Expo Go (SDK 53+)

A partir do SDK 53, `expo-notifications` não funciona no Expo Go — lança um erro ao importar no Android. Requer development build (`npx expo run:android`).

**Impacto:** durante desenvolvimento, o app não pode ser testado pelo Expo Go quando `expo-notifications` está importado.
