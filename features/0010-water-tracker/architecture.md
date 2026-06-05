# Architecture — Water Tracker (0010)

## Decisões

### Unidade: ml (não copos)

O usuário define meta e registra consumo em mililitros. Não há conceito de "copo" como unidade — os botões rápidos (+250ml, +500ml) são apenas atalhos de conveniência, não unidades configuráveis.

**Por quê:** ml é universal e preciso. "Copo" é ambíguo (200ml? 300ml?). A simplicidade de ml evita uma camada de configuração extra (tamanho do copo).

---

### Notificações: one-shot por slot (não repeating interval)

Em vez de usar `TIME_INTERVAL` com `repeats: true`, agendamos notificações individuais para cada horário do dia (ex: 8h, 10h, 12h, ..., 22h).

**Por quê:**
- `repeats: true` não respeita janela de horário — dispara inclusive de madrugada
- Notificações individuais permitem cancelar só os slots futuros quando a meta é atingida, sem cancelar as que já dispararam
- IDs individuais ficam salvos em `water_notif_ids` (JSON no `app_settings`)

**Trade-off:** ao abrir o app em um novo dia, precisamos re-agendar todas as notificações do dia. Isso é feito automaticamente comparando `water_notif_last_day` com a data de hoje.

---

### Animação: react-native-svg + react-native-reanimated

O copo é desenhado com `react-native-svg` (contorno, linhas de marcação, clip-path para o líquido). A animação do nível d'água usa `react-native-reanimated` com `withSpring` para suavidade.

**Por quê:**
- SVG permite formas precisas (bordas arredondadas apenas na base, `ClipPath` para cortar o líquido no formato do copo)
- `Animated` API nativa do RN não tem `withSpring` de alta qualidade — Reanimated roda na UI thread (sem jank)
- Ambas as libs já estão no projeto (`react-native-svg@^15`, `react-native-reanimated@^4`)

**Alternativa descartada:** copo com Views e `borderBottomRadius` — não permite `ClipPath`, o líquido vazaria para fora do contorno arredondado.

---

### Histórico no banco (não só contador diário)

A tabela `water_log` guarda cada registro individualmente com `logged_at`, não apenas um contador acumulado por dia.

**Por quê:** permite filtrar "registros de hoje" por data sem precisar resetar manualmente à meia-noite. Também abre espaço para histórico semanal/mensal no futuro sem mudança de schema.

**Trade-off:** crescimento do banco ao longo do tempo. Mitigado futuramente com limpeza automática de registros com mais de 30 dias.

---

### Configurações na própria aba (não na tela de Settings global)

As configurações de meta e notificações do water tracker ficam acessíveis via botão de engrenagem na tela "Água", não integradas na tela de Configurações global.

**Por quê:** a tela de Settings global já tem PIN + dados. Misturar configurações de hidratação ali ficaria pesado. Cada aba sendo auto-suficiente é mais escalável — se outras features forem adicionadas, cada uma traz suas próprias configurações.

---

### Reset diário implícito (não um job de meia-noite)

Não há nenhum job rodando à meia-noite para zerar o contador. O `getTodayTotal` sempre filtra por `logged_at >= unixepoch('now', 'start of day')`, então o "reset" é implícito — no próximo dia, a query retorna 0 automaticamente.

**Por quê:** simplicidade. Não requer background tasks, alarmes ou lógica de migração. O histórico fica intacto.
