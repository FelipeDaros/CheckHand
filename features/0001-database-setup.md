# 0001 — Database Setup

## Objetivo
Configurar o banco de dados SQLite com migrations versionadas. Toda leitura e escrita de dados do app passa por aqui.

## Status
`Concluído`

## Dependências
Nenhuma — deve ser implementada primeiro.

---

## Tecnologias
- `expo-sqlite` — banco de dados SQLite nativo
- `SQLiteProvider` — contexto React para acesso ao banco
- `useSQLiteContext()` — hook de acesso nas telas
- `PRAGMA user_version` — controle de versão das migrations

---

## Modelo de Dados

```sql
-- Checklists
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

-- Configurações do app (PIN, preferências)
CREATE TABLE app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## Arquivos a Criar

```
src/
├── types/
│   └── index.ts                          # Interfaces: Checklist, Item, ChecklistWithProgress
├── database/
│   ├── migrations.ts                     # Lógica de migração com user_version
│   └── index.ts                          # Re-exports
└── repositories/
    ├── checklistRepository.ts            # getAllChecklists, create, update, delete
    ├── itemRepository.ts                 # getByChecklist, create, toggle, delete
    └── settingsRepository.ts             # get, set (para PIN e preferências)
```

---

## Tasks

- [x] Criar `src/types/index.ts` com `Checklist`, `Item`, `ChecklistWithProgress`
- [x] Criar `src/database/migrations.ts` com migration v1 (3 tabelas + WAL mode)
- [x] Criar `src/database/index.ts`
- [x] Criar `src/repositories/checklistRepository.ts`
- [x] Criar `src/repositories/itemRepository.ts`
- [x] Criar `src/repositories/settingsRepository.ts`
- [x] Integrar `<SQLiteProvider>` no `app/_layout.tsx` com `onInit={migrateDbIfNeeded}`

---

## Critérios de Aceite

- Banco cria as 3 tabelas corretamente no primeiro boot
- Migrations só executam quando `user_version` está abaixo de `DATABASE_VERSION`
- `PRAGMA journal_mode = WAL` ativo
- Nenhuma query SQL fora dos arquivos em `src/repositories/`
