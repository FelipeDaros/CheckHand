# CheckHand — Plano de Implementação

## Visão Geral

App de checklists offline-first com autenticação local por PIN.
Plataformas: Android e iOS.

---

## Ordem de Implementação

| # | Feature | Arquivo | Status |
|---|---------|---------|--------|
| 1 | Banco de dados e migrations | [0001-database-setup.md](./0001-database-setup.md) | `Concluído` |
| 2 | Navegação (Expo Router) | [0002-navigation-setup.md](./0002-navigation-setup.md) | `Concluído` |
| 3 | CRUD de Checklists | [0003-checklist-crud.md](./0003-checklist-crud.md) | `Concluído` |
| 4 | Gerenciamento de Itens | [0004-item-management.md](./0004-item-management.md) | `Concluído` |
| 5 | Autenticação local (PIN) | [0005-local-auth.md](./0005-local-auth.md) | `Concluído` |
| 6 | Busca e filtro | [0006-search-filter.md](./0006-search-filter.md) | `Concluído` |
| 7 | Data de prazo (due date) | [0007-due-date.md](./0007-due-date.md) | `Concluído` |
| 8 | Tela de Configurações | [0008-settings.md](./0008-settings.md) | `Concluído` |

---

## Como trabalhar em uma Feature

1. Abra o arquivo da feature em `features/`
2. Mude o **Status** para `Em progresso`
3. Siga as **Tasks técnicas** na ordem listada
4. Ao concluir cada task, marque o checkbox `[x]`
5. Ao terminar tudo, mude o **Status** para `Concluído`
6. Faça commit com a mensagem: `feat(0001): descrição do que foi implementado`

---

## Regras Gerais

- Implementar as features **em ordem** (respeitar dependências)
- Nunca escrever SQL diretamente nos componentes — usar repositórios em `src/repositories/`
- Cada tela nova fica em `app/` seguindo o file-based routing do Expo Router
- Testes manuais no dispositivo antes de marcar como `Concluído`
- Ao adicionar um campo novo no banco, criar uma nova migration (incrementar `DATABASE_VERSION`)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK ~56.0.8 |
| Navegação | Expo Router ~56.2.8 |
| Banco de dados | expo-sqlite ~56.0.4 |
| Auth local | expo-secure-store |
| Linguagem | TypeScript (strict) |
| Plataformas | Android, iOS |
