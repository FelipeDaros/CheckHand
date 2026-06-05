# 0010 — Water Tracker (Hidratação)

## Objetivo
Nova aba dedicada ao controle de ingestão de água diária. O usuário define uma meta em ml, registra cada consumo com botões rápidos, e acompanha o progresso através de um copo animado que preenche conforme bebe. Notificações periódicas lembram o usuário ao longo do dia dentro de uma janela de horário configurável.

## Status
`Pendente`

## Dependências
- [0001-database-setup](../0001-database-setup.md)
- [0002-navigation-setup](../0002-navigation-setup.md)
- [0008-settings](../0008-settings.md)
- [0009-notifications](../0009-notifications/) — reutiliza expo-notifications já instalado

---

## Comportamento

### Tela principal (aba Água)
- Exibe o **copo animado** preenchendo de baixo para cima conforme o progresso
- Mostra **total consumido / meta** em ml (ex: `1.500 / 2.000 ml`)
- Porcentagem de progresso (ex: `75%`)
- Três botões de adição rápida: **+250 ml**, **+500 ml**, **+personalizado** (input numérico)
- Botão "Zerar dia" com confirmação — apaga todos os registros de hoje
- Ao atingir 100%: copo transborda visualmente + mensagem de parabéns

### Copo animado
- Formato retangular com fundo arredondado (usando SVG)
- Preenche de baixo para cima com animação spring/timing (react-native-reanimated)
- Linhas horizontais internas marcando intervalos de 25% (tracinhos visuais)
- A cor do líquido é `colors.primary` (#f7a501)
- Quando completo: borda do copo muda para `colors.primary`

### Reset diário automático
- Ao abrir o app em um novo dia, o progresso de ontem não é somado ao de hoje
- Registros são filtrados por data — o banco guarda o histórico mas a tela mostra apenas o dia atual

### Notificações
- O usuário configura:
  - **Intervalo entre lembretes** (ex: a cada 1h, 2h, 3h)
  - **Horário de início** (ex: 08:00)
  - **Horário de fim** (ex: 22:00)
- Ao salvar as configurações, todas as notificações do dia são agendadas como one-shot (uma por slot)
- Quando a meta diária é atingida: todas as notificações pendentes do dia são canceladas
- No próximo dia (detectado ao abrir o app): as notificações são reagendadas automaticamente
- Toggle para ativar/desativar lembretes

---

## Modelo de Dados

### Nova tabela (migration v3)
```sql
CREATE TABLE water_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  amount_ml  INTEGER NOT NULL,
  logged_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### Chaves em app_settings
| Chave | Tipo | Padrão | Descrição |
|---|---|---|---|
| `water_goal_ml` | INTEGER | 2000 | Meta diária em ml |
| `water_notif_enabled` | '0'/'1' | '1' | Notificações ativas |
| `water_notif_interval_h` | INTEGER | 2 | Intervalo em horas |
| `water_notif_start_h` | INTEGER | 8 | Hora de início (0-23) |
| `water_notif_end_h` | INTEGER | 22 | Hora de fim (0-23) |
| `water_notif_ids` | JSON | '[]' | IDs das notificações agendadas hoje |
| `water_notif_last_day` | TEXT | '' | Data do último agendamento (YYYY-MM-DD) |

---

## Arquivos a Criar/Modificar

```
app/
└── (tabs)/
    ├── _layout.tsx          # MODIFICAR — adicionar aba "Água" com ícone Drop
    └── water.tsx            # CRIAR — tela principal do water tracker

src/
├── repositories/
│   └── waterRepository.ts  # CRIAR — addIntake, getTodayTotal, clearToday, getTodayLogs
├── hooks/
│   └── useWater.ts         # CRIAR — estado, meta, total hoje, add, reset, notificações
└── components/
    ├── WaterGlass.tsx       # CRIAR — copo SVG animado com react-native-reanimated
    └── WaterSettings.tsx    # CRIAR — form de configurações (meta + notificações)

src/database/
└── migrations.ts            # MODIFICAR — migration v3 (water_log table)
```

---

## Tasks

- [ ] Migration v3: tabela `water_log`
- [ ] Criar `src/repositories/waterRepository.ts`
- [ ] Criar `src/hooks/useWater.ts`
- [ ] Adicionar aba "Água" em `app/(tabs)/_layout.tsx`
- [ ] Criar tela `app/(tabs)/water.tsx` com layout básico
- [ ] Criar `src/components/WaterGlass.tsx` (SVG + Reanimated)
- [ ] Criar `src/components/WaterSettings.tsx`
- [ ] Implementar notificações periódicas com janela de horário
- [ ] Cancelar notificações ao atingir meta
- [ ] Reagendar notificações ao abrir em novo dia

---

## Critérios de Aceite

- [ ] Usuário define meta diária em ml
- [ ] Botões +250ml e +500ml adicionam ao total e animam o copo
- [ ] Botão personalizado abre input numérico e adiciona
- [ ] Copo preenche proporcionalmente com animação suave
- [ ] Linhas de marcação visíveis a cada 25%
- [ ] Ao atingir 100%: visual de conclusão
- [ ] Zerar dia apaga registros de hoje com confirmação
- [ ] Notificações chegam nos horários configurados
- [ ] Notificações param ao atingir a meta do dia
- [ ] Progresso reseta automaticamente no próximo dia
