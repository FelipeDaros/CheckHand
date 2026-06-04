# 0004 — Item Management

## Objetivo
Tela de detalhe de uma checklist com seus itens. Permite adicionar, marcar como concluído e excluir itens.

## Status
`Em progresso`

## Dependências
- [0001-database-setup](./0001-database-setup.md)
- [0002-navigation-setup](./0002-navigation-setup.md)
- [0003-checklist-crud](./0003-checklist-crud.md)

---

## Telas

### `app/checklist/[id].tsx` — Detalhe da Checklist
Lista os itens da checklist e permite gerenciá-los.

**Campos exibidos por item:**
| Campo | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Texto do item |
| `is_done` | `0 \| 1` | Checkbox de conclusão |
| `due_date` | `number \| null` | Prazo do item (feature 0007) |

**Ações disponíveis:**
- Toque no checkbox → alterna `is_done`
- Toque no título → edita o texto inline
- Swipe ou ícone de lixo → exclui o item
- Campo de texto + botão no rodapé → adiciona novo item
- Ícone de lápis no header → navega para edição da checklist

---

## Campos do Modelo

### `Item`
```typescript
type Item = {
  id: number;
  checklist_id: number;
  title: string;
  is_done: 0 | 1;
  position: number;
  due_date: number | null;
  created_at: number;
};
```

---

## Arquivos a Criar/Modificar

```
app/
└── checklist/[id].tsx            # MODIFICAR — implementar tela real
src/
├── hooks/
│   └── useItems.ts               # CRIAR — hook: load, add, toggle, remove
└── components/
    ├── ItemRow.tsx                # CRIAR — linha de item com checkbox
    └── AddItemInput.tsx           # CRIAR — input fixo no rodapé
```

---

## Tasks

- [x] Implementar `src/hooks/useItems.ts`
- [x] Criar `src/components/ItemRow.tsx` com checkbox e texto
- [x] Criar `src/components/AddItemInput.tsx`
- [x] Implementar `app/checklist/[id].tsx` com FlatList de itens
- [x] Exibir barra de progresso (ex: "3/7") no header
- [ ] Testar: adicionar → marcar → desmarcar → excluir item

---

## Critérios de Aceite

- Itens exibidos em ordem de `position`
- Marcar como concluído atualiza visualmente de imediato (otimista)
- Adicionar item insere no banco e aparece na lista sem reload manual
- Excluir item com confirmação (ou swipe)
- Header mostra título da checklist + progresso atualizado
- Lista vazia exibe mensagem "Nenhum item ainda. Adicione o primeiro!"
