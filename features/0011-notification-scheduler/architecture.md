# Architecture — Agendador de Notificações (0011)

## Decisões

### Tabela própria `scheduled_notifications` (não reutilizar `checklists`)

Os agendamentos são entidades autônomas — sem vínculo com checklists. Misturar no schema existente criaria colunas nulas desnecessárias e acoplamento sem benefício.

**Por quê:** separação de responsabilidades. A tabela `checklists` gerencia checklists; a nova tabela gerencia lembretes agendados. Migrations independentes facilitam rollback.

---

### `config` e `notification_ids` como TEXT/JSON no banco

Em vez de colunas separadas por campo de config (ex: `interval_hours`, `weekly_weekdays`, `date_timestamp`), um único campo `config TEXT` armazena o JSON da configuração.

**Por quê:** os 3 tipos têm estruturas radicalmente diferentes. Colunas por tipo criariam muitas colunas nulas. JSON em TEXT é uma prática estabelecida com expo-sqlite — o repository parseia/serializa ao ler/escrever.

**Trade-off:** sem tipagem no banco (qualquer JSON é aceito). O TypeScript garante no lado da aplicação.

**`notification_ids`** segue o mesmo padrão — é um array serializado como `'["id1","id2"]'`. Múltiplos IDs surgem quando `type = 'weekly'` com vários dias selecionados.

---

### Agendamento semanal = N notificações (uma por dia selecionado)

`expo-notifications` `WeeklyTriggerInput` aceita apenas um `weekday` por chamada. Para "toda segunda e sexta", são necessárias 2 chamadas → 2 IDs armazenados em `notification_ids`.

**Por quê:** é a única forma suportada pela API. A alternativa — usar `TimeIntervalTriggerInput` com 7 dias — não respeita dias específicos.

**Impacto:** ao desativar/reativar, todos os IDs são cancelados/re-agendados em batch via `Promise.all`.

---

### Detecção de disparo para `type = 'date'` no app open

Após uma notificação `date` disparar, o expo não notifica o app automaticamente sobre isso. A lógica de marcar como inativo acontece na próxima abertura do app: ao carregar a lista, compara `timestamp` do config com `Date.now()` para agendamentos `date` ainda marcados como ativos.

**Por quê:** não há evento `onNotificationFired` confiável para esse caso. A verificação no carregamento é simples e suficiente.

**Alternativa descartada:** usar notification response listener para detectar o toque — não resolve o caso em que o usuário não tocou na notificação.

---

### Agendamento e cancelamento no hook (não no repository)

O repository (`scheduledNotificationRepository.ts`) só executa SQL. Toda lógica de `expo-notifications` (schedule, cancel) fica em `useScheduledNotifications.ts`.

**Por quê:** segue o padrão estabelecido no 0009 (`notificationRepository.ts` faz o schedule, `useNotifications.ts` coordena permissão + state). Repositórios focados em SQL são mais fáceis de testar e reusar.

---

### Reutilizar `useNotifications` do 0009 para permissão

O hook do 0009 já encapsula o fluxo de pedido de permissão. `useScheduledNotifications` chama `requestPermission()` antes de qualquer `scheduleNotificationAsync`.

**Por quê:** evita duplicar a lógica de permissão. Se o usuário já concedeu permissão para os checklists, não precisa conceder de novo — o hook lida com isso.

---

### Sem edição de agendamento (apenas criação + toggle + delete)

MVP não inclui edição. Para alterar um agendamento, o usuário deleta e cria de novo.

**Por quê:** a edição exigiria cancelar os IDs antigos, re-agendar com nova config e atualizar o banco — complexidade adicional sem frequência de uso clara. Fácil de adicionar depois.

---

### `@react-native-community/datetimepicker` para pickers de data/hora

Disponível no Expo SDK 56. Necessário para time picker (horas/minutos) no tipo `weekly` e para date+time picker no tipo `date`.

**Alternativa descartada:** inputs de texto livres para hora — má UX em mobile.

**Nota:** em Android, usar a API imperativa `DateTimePickerAndroid.open()`. Em iOS, usar o componente `DateTimePicker` inline ou em modal.

---

### Aba chamada "Lembretes" (não "Notificações")

"Notificações" pode ser confundido com uma central de notificações recebidas do sistema. "Lembretes" comunica melhor a intenção de agendamento proativo pelo usuário.

**Alternativa:** "Alarmes" — descartado (conotação muito forte, associado a som alto).
