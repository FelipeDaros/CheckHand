# CheckHand — Design do Produto

## Visão

App de checklists e tarefas para uso **offline-first** no Android e iOS.
O usuário cria listas de verificação, marca itens como concluídos e acompanha o progresso de cada lista.

## Plataformas Alvo

- Android (foco principal)
- iOS

---

## Funcionalidades

### MVP

- [ ] Criar, editar e excluir **checklists**
- [ ] Adicionar, editar e excluir **itens** dentro de uma checklist
- [ ] Marcar itens como **concluídos / pendentes**
- [ ] Ver **progresso** de cada checklist (ex: 3/7 itens)
- [ ] **Busca e filtro** de checklists (por nome e status)
- [ ] **Data de prazo** (due date) em checklists e itens
- [ ] **Autenticação local** com PIN de 4 dígitos (opcional)
- [ ] Tela de **Configurações** (PIN, sobre, limpar dados)

### Futuro

- [ ] Categorias / tags para checklists
- [ ] Notificações e lembretes para prazos
- [ ] Exportar checklist ou compartilhar
- [ ] Templates de checklist reutilizáveis
- [ ] Reordenar itens com drag & drop

---

## Modelo de Dados

```sql
-- Checklists (ex: "Compras do mês", "Checklist de viagem")
CREATE TABLE checklists (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT,
  due_date    INTEGER,                              -- unix timestamp, nullable
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Itens de cada checklist
CREATE TABLE items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  checklist_id INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title        TEXT    NOT NULL,
  is_done      INTEGER NOT NULL DEFAULT 0,          -- 0 = pendente, 1 = concluído
  position     INTEGER NOT NULL DEFAULT 0,          -- ordem de exibição
  due_date     INTEGER,                             -- unix timestamp, nullable
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Configurações do app (PIN habilitado, preferências)
CREATE TABLE app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

> PIN armazenado via `expo-secure-store` (criptografia nativa), não no SQLite.

---

## Estrutura de Navegação

```
(tabs)/
├── index          → Lista de todas as checklists
└── settings       → Configurações do app

/ (stack)
└── checklist/[id] → Detalhe e itens de uma checklist
```

---

## Princípios de UX

- **Offline-first**: tudo funciona sem internet
- **Rápido**: abrir e marcar um item deve ser ≤ 2 toques
- **Limpo**: interface sem distrações, foco no conteúdo
- **Feedback visual**: progresso visível em cada card de checklist

---

## Decisões Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Banco de dados | expo-sqlite | Nativo ao Expo, offline, sem dependência externa |
| Navegação | Expo Router | File-based, integração nativa com Expo SDK 56 |
| Estilo | StyleSheet (RN) | Sem overhead de biblioteca extra no MVP |
| Estado global | React Context + hooks | Suficiente para o escopo atual |
| Auth local | expo-secure-store | Criptografia nativa (Keychain/Keystore) para o PIN |
| Date picker | @react-native-community/datetimepicker | Picker nativo Android e iOS |
