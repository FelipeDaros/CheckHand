# 0003 — Checklist CRUD

## Objetivo
Tela principal com a lista de checklists e formulário para criar/editar. É o coração do app.

## Status
`Concluído`

## Dependências
- [0001-database-setup](./0001-database-setup.md)
- [0002-navigation-setup](./0002-navigation-setup.md)

---

## Telas

### `app/(tabs)/index.tsx` — Lista de Checklists
Exibe todas as checklists com progresso (ex: "3/7 itens").

**Campos exibidos por card:**
| Campo | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Nome da checklist |
| `description` | `string \| null` | Descrição curta (opcional) |
| `due_date` | `number \| null` | Data de prazo (unix timestamp) |
| `total_items` | `number` | Total de itens |
| `done_items` | `number` | Itens concluídos |

**Ações disponíveis:**
- Toque no card → navega para `checklist/[id]`
- Botão `+` (FAB) → navega para `checklist/new`
- Swipe ou long press → opção de excluir

---

### `app/checklist/new.tsx` — Criar Checklist
Formulário para criar uma nova checklist.

**Campos do formulário:**
| Campo | Obrigatório | Tipo |
|---|---|---|
| `title` | Sim | `TextInput` |
| `description` | Não | `TextInput` multiline |
| `due_date` | Não | Date picker (feature 0007) |

**Ações:**
- Salvar → cria no banco e volta para a lista
- Cancelar → volta sem salvar

---

### `app/checklist/[id]/edit.tsx` — Editar Checklist
Mesmo formulário de criação, pré-preenchido com os dados atuais.

---

## Arquivos a Criar/Modificar

```
app/
├── (tabs)/index.tsx              # MODIFICAR — implementar lista real
├── checklist/
│   ├── new.tsx                   # CRIAR — formulário de criação
│   └── [id]/edit.tsx             # CRIAR — formulário de edição
src/
├── hooks/
│   └── useChecklists.ts          # CRIAR — hook: load, add, remove, update
└── components/
    ├── ChecklistCard.tsx          # CRIAR — card da lista
    └── ChecklistForm.tsx          # CRIAR — formulário reutilizável
```

---

## Tasks

- [x] Implementar `src/hooks/useChecklists.ts` (getAllChecklists, create, update, delete)
- [x] Criar `src/components/ChecklistCard.tsx`
- [x] Criar `src/components/ChecklistForm.tsx`
- [x] Implementar `app/(tabs)/index.tsx` com FlatList + FAB
- [x] Criar `app/checklist/new.tsx`
- [x] Criar `app/checklist/[id]/edit.tsx`
- [ ] Testar: criar → listar → editar → excluir checklist

---

## Critérios de Aceite

- Lista exibe todas as checklists com progresso correto
- FAB abre formulário de criação
- Salvar uma checklist aparece imediatamente na lista
- Editar preserva os dados anteriores
- Excluir remove a checklist e todos os seus itens (CASCADE)
- Lista vazia exibe mensagem "Nenhuma checklist ainda"
