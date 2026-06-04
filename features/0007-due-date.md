# 0007 — Due Date (Data de Prazo)

## Objetivo
Permitir definir uma data de prazo para checklists e itens individuais, com alerta visual quando o prazo estiver próximo ou vencido.

## Status
`Pendente`

## Dependências
- [0001-database-setup](./0001-database-setup.md)
- [0003-checklist-crud](./0003-checklist-crud.md)
- [0004-item-management](./0004-item-management.md)

---

## Funcionalidades

### Checklist com prazo
- Campo opcional `due_date` no formulário de criação/edição
- Card da checklist exibe o prazo com ícone de calendário
- Prazo vencido → texto em vermelho
- Prazo próximo (≤ 2 dias) → texto em laranja

### Item com prazo
- Campo opcional `due_date` em cada item
- `ItemRow` exibe data de prazo quando definida
- Mesma lógica de cor: vencido = vermelho, próximo = laranja

---

## Modelo de Dados

O campo `due_date` já está previsto no schema (feature 0001). Nenhuma migration adicional necessária.

```sql
-- Já definido em 0001:
checklists.due_date  INTEGER  -- unix timestamp
items.due_date       INTEGER  -- unix timestamp
```

---

## Campos do Formulário

| Campo | Componente | Observação |
|---|---|---|
| Data | `DateTimePicker` ou picker nativo | Via `@react-native-community/datetimepicker` |
| Limpar data | Botão "Remover prazo" | Salva `null` no banco |

---

## Tecnologias

- `@react-native-community/datetimepicker` — date picker nativo para Android/iOS
  - Instalar: `npx expo install @react-native-community/datetimepicker`

---

## Utilitários

```typescript
// src/utils/date.ts
export function formatDueDate(timestamp: number | null): string | null;
export function isDueDateExpired(timestamp: number | null): boolean;
export function isDueDateSoon(timestamp: number | null, days?: number): boolean;
export function getDueDateColor(timestamp: number | null): string;
```

---

## Arquivos a Criar/Modificar

```
src/
├── utils/
│   └── date.ts                   # CRIAR — helpers de data
└── components/
    └── DueDateBadge.tsx          # CRIAR — badge de prazo com cor dinâmica
app/
├── checklist/new.tsx             # MODIFICAR — adicionar date picker
└── checklist/[id]/edit.tsx       # MODIFICAR — adicionar date picker
```

---

## Tasks

- [ ] Instalar `@react-native-community/datetimepicker`
- [ ] Criar `src/utils/date.ts` com funções de formatação e validação
- [ ] Criar `src/components/DueDateBadge.tsx`
- [ ] Adicionar date picker no formulário de checklist
- [ ] Exibir `DueDateBadge` no `ChecklistCard` e `ItemRow`
- [ ] Testar: criar com prazo → exibir cor correta → editar → remover prazo

---

## Critérios de Aceite

- Data pode ser definida e removida nos formulários
- Cards e itens exibem prazo com cores corretas (normal / próximo / vencido)
- Data é armazenada como unix timestamp no banco
- Sem prazo = campo vazio, sem badge exibido
