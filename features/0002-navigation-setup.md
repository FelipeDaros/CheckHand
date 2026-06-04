# 0002 — Navigation Setup

## Objetivo
Configurar a estrutura de navegação do app usando Expo Router com tabs e stack.

## Status
`Concluído`

## Dependências
- [0001-database-setup](./0001-database-setup.md) — `SQLiteProvider` vai no layout raiz

---

## Tecnologias
- `expo-router` — file-based routing (incluído no Expo SDK 56)
- `Stack` — navegação em pilha para telas de detalhe
- `Tabs` — barra de abas inferior

---

## Estrutura de Rotas

```
app/
├── _layout.tsx              # Layout raiz: SQLiteProvider + Stack
├── (tabs)/
│   ├── _layout.tsx          # Layout das abas (Tabs)
│   ├── index.tsx            # Aba "Checklists" — lista principal
│   └── settings.tsx         # Aba "Configurações"
├── checklist/
│   ├── [id].tsx             # Detalhe de uma checklist (itens)
│   └── new.tsx              # Criar nova checklist
├── checklist/[id]/
│   └── edit.tsx             # Editar checklist existente
└── pin.tsx                  # Tela de PIN (aparece no boot se PIN ativado)
```

---

## Arquivos a Criar/Modificar

```
app/
├── _layout.tsx              # MODIFICAR — adicionar SQLiteProvider e Stack.Screen
├── (tabs)/
│   ├── _layout.tsx          # CRIAR
│   ├── index.tsx            # CRIAR (placeholder)
│   └── settings.tsx         # CRIAR (placeholder)
├── checklist/
│   ├── [id].tsx             # CRIAR (placeholder)
│   └── new.tsx              # CRIAR (placeholder)
└── pin.tsx                  # CRIAR (placeholder — ver feature 0005)
```

---

## Tasks

- [x] Criar `app/_layout.tsx` com `SQLiteProvider` + `Stack`
- [x] Criar `app/(tabs)/_layout.tsx` com `Tabs` (2 abas: Checklists, Configurações)
- [x] Criar `app/(tabs)/index.tsx` (placeholder)
- [x] Criar `app/(tabs)/settings.tsx` (placeholder)
- [x] Criar `app/checklist/[id].tsx` (placeholder)
- [x] Criar `app/checklist/new.tsx` (placeholder)
- [x] Verificar que `package.json` tem `"main": "expo-router/entry"`
- [x] Verificar que `app.json` tem `"scheme": "checkhand"`

---

## Critérios de Aceite

- App inicia sem erros no Android e iOS
- Tab bar visível com 2 abas funcionando
- Navegação para tela de detalhe (`checklist/[id]`) funciona via `router.push`
- Botão de voltar (back) funciona corretamente na stack
