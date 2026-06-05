# Water Tracker — 0010

Se você está trabalhando nesta funcionalidade, atualize este arquivo conforme progride.

---

## FASE 1 — Banco de dados e navegação [Não Iniciada ⏳]

Entrega: nova aba visível no app com tela esqueleto e banco pronto.

### Migration v3 — tabela water_log [Não Iniciada ⏳]

Em `src/database/migrations.ts`, incrementar `DATABASE_VERSION` para `3`:

```typescript
if (currentVersion === 2) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS water_log (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_ml INTEGER NOT NULL,
      logged_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);
  currentVersion = 3;
}
```

### Adicionar aba "Água" em (tabs)/_layout.tsx [Não Iniciada ⏳]

Importar ícone `Drop` do `phosphor-react-native` e adicionar `Tabs.Screen`:

```tsx
<Tabs.Screen
  name="water"
  options={{
    title: 'Água',
    tabBarIcon: ({ color }) => <Drop size={24} color={color} weight="regular" />,
  }}
/>
```

### Criar tela esqueleto app/(tabs)/water.tsx [Não Iniciada ⏳]

Layout mínimo com `ScrollView`, placeholder do copo, texto de progresso e botões. Sem lógica ainda — apenas estrutura visual para validar o layout na tela real.

---

## FASE 2 — Repositório e Hook [Não Iniciada ⏳]

Entrega: lógica completa de leitura e escrita, sem animação ainda. Os botões funcionam e o progresso é persistido.

### Criar waterRepository.ts [Não Iniciada ⏳]

`src/repositories/waterRepository.ts`:

```typescript
// Retorna o total em ml consumido hoje (meia-noite até agora)
export async function getTodayTotal(db: SQLiteDatabase): Promise<number>

// Insere um registro de consumo
export async function addIntake(db: SQLiteDatabase, amountMl: number): Promise<void>

// Remove todos os registros de hoje
export async function clearToday(db: SQLiteDatabase): Promise<void>
```

O filtro "hoje" usa `unixepoch('now', 'start of day')` como limite inferior:
```sql
SELECT COALESCE(SUM(amount_ml), 0) as total
FROM water_log
WHERE logged_at >= unixepoch('now', 'start of day')
```

### Criar useWater.ts [Não Iniciada ⏳]

`src/hooks/useWater.ts` — expõe:

```typescript
{
  todayMl: number,          // total consumido hoje
  goalMl: number,           // meta configurada
  progress: number,         // 0.0 a 1.0
  isComplete: boolean,      // todayMl >= goalMl
  add: (ml: number) => Promise<void>,
  reset: () => Promise<void>,
  loading: boolean,
}
```

Carrega `water_goal_ml` via `getSetting`. Ao `add()`, verifica se atingiu a meta para cancelar notificações.

### Conectar tela water.tsx com o hook [Não Iniciada ⏳]

Substituir placeholders pelos dados reais. Implementar:
- Botões +250ml e +500ml chamando `add()`
- Modal/Alert para valor personalizado (`TextInput` numérico)
- Botão "Zerar dia" com `Alert.alert` de confirmação
- Exibir `todayMl / goalMl` e percentual

---

## FASE 3 — Copo animado [Não Iniciada ⏳]

Entrega: animação visual do copo integrada à tela. Pode ser feita em paralelo com a Fase 4.

### Criar WaterGlass.tsx [Não Iniciada ⏳]

`src/components/WaterGlass.tsx` — props:

```typescript
type Props = {
  progress: number;  // 0.0 a 1.0
  width?: number;
  height?: number;
};
```

**Estrutura visual (SVG + Reanimated):**

```
┌──────────────┐  ← borda do copo (SVG Rect com rx arredondado na base)
│  ─ ─ ─ ─ ─  │  ← linha 75%
│  ─ ─ ─ ─ ─  │  ← linha 50%
│  ─ ─ ─ ─ ─  │  ← linha 25%
│  ██████████  │  ← fill animado (sobe de baixo)
└──────────────┘
```

Implementação:
1. `Svg` com `Rect` para a borda do copo (stroke sem fill)
2. `ClipPath` + `AnimatedRect` para o líquido — o `y` e `height` são animados
3. Linhas horizontais de marcação (25%, 50%, 75%) como `Line` no SVG
4. `useSharedValue(progress)` + `withSpring` no Reanimated para suavizar mudanças
5. Quando `progress >= 1`: borda muda para `colors.primary`

```typescript
import Svg, { Rect, Line, ClipPath, Defs, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withSpring } from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
```

### Integrar WaterGlass na tela water.tsx [Não Iniciada ⏳]

Substituir o placeholder pela `WaterGlass` passando `progress` do hook.
Adicionar mensagem/ícone de celebração quando `isComplete === true`.

---

## FASE 4 — Configurações e notificações [Não Iniciada ⏳]

Entrega: meta configurável e notificações periódicas funcionando. Pode ser feita em paralelo com a Fase 3.

### Criar WaterSettings.tsx [Não Iniciada ⏳]

`src/components/WaterSettings.tsx` — form com:
- Campo de meta diária em ml (`TextInput` numérico)
- Toggle de notificações
- Seletor de intervalo (1h / 2h / 3h / 4h)
- Seletor de hora de início (picker ou TextInput)
- Seletor de hora de fim

Ao salvar: persiste todas as chaves em `app_settings` e re-agenda as notificações do dia.

### Implementar agendamento em waterRepository.ts [Não Iniciada ⏳]

Função `scheduleWaterNotifications(settings)`:

```typescript
export async function scheduleWaterNotifications(
  db: SQLiteDatabase,
  startHour: number,
  endHour: number,
  intervalHours: number,
): Promise<void>
```

Lógica:
1. Cancelar todas as notificações pendentes do water tracker (`water_notif_ids` no banco)
2. Para cada slot do dia a partir de agora (startHour + n*intervalHours ≤ endHour):
   - Criar um `Date` com a hora do slot
   - Se o slot ainda não passou hoje, agendar com `scheduleNotificationAsync`
3. Salvar os IDs em `water_notif_ids` (JSON) e `water_notif_last_day` (data de hoje)

Conteúdo da notificação:
- **Title**: "Hora de beber água! 💧"
- **Body**: `"Você tomou X ml de Y ml hoje."`

### Cancelar notificações ao atingir meta [Não Iniciada ⏳]

Em `useWater.add()`, após verificar `isComplete`:

```typescript
if (newTotal >= goalMl) {
  await cancelWaterNotifications(db); // cancela IDs do water_notif_ids
}
```

### Reagendar ao abrir o app em novo dia [Não Iniciada ⏳]

Em `useWater`, no `useEffect` de carregamento:

```typescript
const lastDay = await getSetting(db, 'water_notif_last_day');
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
if (lastDay !== today && notifEnabled) {
  await scheduleWaterNotifications(db, startH, endH, intervalH);
}
```

### Integrar WaterSettings na tela water.tsx [Não Iniciada ⏳]

Botão de engrenagem no header da tela abre `WaterSettings` como modal ou sheet inferior. Ao fechar, `useWater` re-carrega as configurações.

---

## FASE 5 — Histórico de dias [Concluída ✅]

Entrega: seção "Histórico" na tela principal mostrando os dias anteriores com consumo registrado.

### getHistory em waterRepository.ts [Concluído ✅]

Agrega `water_log` por dia (excluindo hoje), retorna até 30 dias ordenados do mais recente:

```typescript
export type DayHistory = {
  date: string;    // 'YYYY-MM-DD'
  totalMl: number;
  metGoal: boolean;
};

export async function getHistory(db, goalMl, limit = 30): Promise<DayHistory[]>
```

SQL usado:
```sql
SELECT date(logged_at, 'unixepoch', 'localtime') as day, SUM(amount_ml) as total
FROM water_log
WHERE logged_at < unixepoch('now', 'start of day')
GROUP BY day
ORDER BY day DESC
LIMIT ?
```

### useWater expõe history [Concluído ✅]

`history: DayHistory[]` adicionado ao retorno do hook. É carregado junto com `getTodayTotal` em todos os pontos de atualização (`init`, `add`, `reset`).

### HistoryRow + seção na tela [Concluído ✅]

Componente `HistoryRow` inline em `water.tsx`:
- Label de data ("Ontem", "seg, 02/06" etc.)
- Mini barra de progresso (track cinza + fill `colors.primary`)
- Total em ml; dourado + bold quando meta atingida

A seção "Histórico" só renderiza quando `history.length > 0`.

---

## FASE 6 — Ofensiva + dias da semana [Concluída ✅]

Entrega: faixa de dias da semana com ofensiva estilo Duolingo na parte inferior da tela.

### WeekStrip [Concluído ✅]

Componente inline em `water.tsx` com:
- 7 bolhas circulares (últimos 7 dias incluindo hoje)
- Label abreviada do dia da semana acima de cada bolha (`Dom`, `Seg` …)
- **Ativo** (bebeu água): fundo `colors.primary`, número branco
- **Inativo** (sem consumo): fundo `colors.surfaceSoft`, número `colors.ash`
- Ponto `colors.primary` abaixo da bolha de hoje

### Ofensiva [Concluído ✅]

`computeStreak(history, todayMl)` conta consecutivos dias com `totalMl > 0` de hoje para trás.
Exibe `🔥 X dias seguidos` acima das bolhas quando `streak > 0`.

### buildWeekDays [Concluído ✅]

Gera os últimos 7 dias a partir de hoje, cruzando `history` (dias anteriores) com `todayMl` (dia atual). Não requer query adicional ao banco.

---

## Ordem de execução

```
Fase 1 (setup)
    └── Fase 2 (repositório + hook + UI básica)
            ├── Fase 3 (animação do copo)    ← paralelas entre si
            └── Fase 4 (settings + notifs)  ←
                    └── Fase 5 (histórico)
                            └── Fase 6 (ofensiva + semana)
```
