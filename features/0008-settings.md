# 0008 — Settings (Configurações)

## Objetivo
Tela de configurações do app com opções de PIN, preferências visuais e informações gerais.

## Status
`Pendente`

## Dependências
- [0001-database-setup](./0001-database-setup.md)
- [0002-navigation-setup](./0002-navigation-setup.md)
- [0005-local-auth](./0005-local-auth.md) — para as configurações de PIN

---

## Tela

### `app/(tabs)/settings.tsx` — Configurações

---

## Seções e Campos

### Segurança
| Opção | Componente | Descrição |
|---|---|---|
| Usar PIN | `Switch` | Ativa/desativa proteção por PIN |
| Alterar PIN | `TouchableOpacity` | Visível apenas quando PIN está ativo |

### Preferências
| Opção | Componente | Descrição |
|---|---|---|
| Tema | `Switch` ou seletor | Claro / Escuro (futuro) |

### Sobre
| Campo | Valor |
|---|---|
| Versão | lida de `app.json` via `expo-constants` |
| Nome do app | CheckHand |

### Dados
| Ação | Componente | Descrição |
|---|---|---|
| Limpar todos os dados | `Button` (destrutivo) | Apaga tudo do banco — pede confirmação |

---

## Arquivos a Criar/Modificar

```
app/
└── (tabs)/settings.tsx           # MODIFICAR — implementar tela real
src/
├── hooks/
│   └── useSettings.ts            # CRIAR — hook para leitura/escrita de settings
└── components/
    └── SettingsRow.tsx           # CRIAR — linha de configuração reutilizável
```

---

## Tasks

- [ ] Criar `src/components/SettingsRow.tsx` (label + elemento à direita)
- [ ] Criar `src/hooks/useSettings.ts`
- [ ] Implementar seção "Segurança" com toggle de PIN
- [ ] Implementar fluxo de criar PIN (modal ou tela separada)
- [ ] Implementar fluxo de alterar PIN
- [ ] Exibir versão do app via `expo-constants`
- [ ] Implementar "Limpar todos os dados" com `Alert.alert` de confirmação

---

## Critérios de Aceite

- Toggle de PIN ativa/desativa o fluxo de autenticação
- Alterar PIN confirma o PIN atual antes de aceitar o novo
- "Limpar todos os dados" exige confirmação e apaga banco + SecureStore
- Versão do app exibida corretamente
- Configurações persistem entre sessões
