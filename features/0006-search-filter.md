# 0006 — Search & Filter

## Objetivo
Permitir busca por nome e filtragem de checklists na tela principal (por status de conclusão).

## Status
`Pendente`

## Dependências
- [0003-checklist-crud](./0003-checklist-crud.md)

---

## Telas

### `app/(tabs)/index.tsx` — Lista de Checklists (modificação)
Adicionar barra de busca no topo e botões de filtro.

---

## Funcionalidades

### Busca
- Campo de texto no topo da lista
- Filtra checklists em tempo real pelo `title`
- Busca case-insensitive

### Filtros
| Filtro | Descrição |
|---|---|
| Todas | Exibe todas as checklists (padrão) |
| Em andamento | Checklists com `done_items < total_items` |
| Concluídas | Checklists com `done_items = total_items` e `total_items > 0` |

---

## Implementação

A busca e filtro serão feitos **em memória** (no array já carregado do banco), sem nova query SQL a cada caractere digitado. Isso evita overhead no banco e mantém a UI responsiva.

```typescript
// Em useChecklists.ts — adicionar:
function applyFilter(
  list: ChecklistWithProgress[],
  search: string,
  filter: 'all' | 'ongoing' | 'completed'
): ChecklistWithProgress[] {
  return list
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    .filter(c => {
      if (filter === 'ongoing') return c.done_items < c.total_items;
      if (filter === 'completed') return c.total_items > 0 && c.done_items === c.total_items;
      return true;
    });
}
```

---

## Arquivos a Criar/Modificar

```
app/
└── (tabs)/index.tsx              # MODIFICAR — adicionar SearchBar e filtros
src/
├── hooks/
│   └── useChecklists.ts          # MODIFICAR — adicionar applyFilter
└── components/
    ├── SearchBar.tsx             # CRIAR — input de busca
    └── FilterTabs.tsx            # CRIAR — tabs: Todas / Em andamento / Concluídas
```

---

## Tasks

- [ ] Criar `src/components/SearchBar.tsx`
- [ ] Criar `src/components/FilterTabs.tsx`
- [ ] Adicionar lógica de filtro em `useChecklists.ts`
- [ ] Integrar busca + filtros em `app/(tabs)/index.tsx`
- [ ] Testar: busca em tempo real + cada filtro funciona corretamente

---

## Critérios de Aceite

- Busca filtra resultados a cada tecla digitada sem travamento
- Limpar a busca restaura a lista completa
- Filtros "Em andamento" e "Concluídas" mostram apenas os casos corretos
- Estado do filtro persiste enquanto o usuário está na tela (reset ao sair)
