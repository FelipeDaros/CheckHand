# CheckHand

App mobile de checklists e rastreamento de hábitos, offline-first, para Android e iOS.

## Funcionalidades

- **Checklists** — crie listas com itens, defina prazos e acompanhe o progresso
- **Notificações locais** — lembretes automáticos para checklists com data de vencimento
- **Autenticação por PIN** — proteja o app com um PIN de 4 dígitos
- **Water Tracker** — rastreie sua hidratação diária com meta configurável, ofensiva e histórico
- **Offline-first** — tudo salvo localmente via SQLite, sem necessidade de conta ou internet

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK ~56.0.8 |
| Runtime | React Native 0.85.3 / React 19 |
| Linguagem | TypeScript (strict) |
| Navegação | Expo Router (file-based) |
| Banco de dados | expo-sqlite (SQLite) |
| Animações | react-native-reanimated |
| Plataformas | Android, iOS |

## Estrutura do projeto

```
CheckHand/
├── app/                    # Rotas (Expo Router file-based)
│   ├── (tabs)/             # Abas principais
│   │   ├── index.tsx       # Checklists
│   │   ├── water.tsx       # Water tracker
│   │   └── settings.tsx    # Configurações
│   ├── _layout.tsx         # Layout raiz (SQLiteProvider)
│   ├── [id].tsx            # Detalhe de checklist
│   └── water-settings.tsx  # Configurações do water tracker
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── database/
│   │   └── migrations.ts   # Migrações de schema (PRAGMA user_version)
│   ├── repositories/       # Acesso ao banco por entidade
│   ├── hooks/              # Custom hooks
│   ├── theme/              # Design system (cores, tipografia, espaçamento)
│   └── types/              # Interfaces TypeScript
├── features/               # Especificações e plano de implementação
├── CLAUDE.md               # Instruções para o agente de IA
└── DESIGN.md               # Design system completo
```

## Começando

### Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio ou Xcode para emuladores

### Instalação

```bash
npm install
```

### Rodando o app

```bash
# Dev server (escolha a plataforma no terminal)
npx expo start

# Direto no Android
npx expo start --android

# Direto no iOS
npx expo start --ios
```

> Use sempre `npx expo install` para adicionar dependências — garante compatibilidade com o SDK 56.

## Banco de dados

O schema é gerenciado por migrações versionadas com `PRAGMA user_version` em `src/database/migrations.ts`. A versão atual é **3**.

| Versão | Mudança |
|---|---|
| 1 | Tabelas `checklists`, `items`, `app_settings` |
| 2 | Coluna `notification_id` em `checklists` |
| 3 | Tabela `water_log` |

## Design system

Cores, tipografia, espaçamento e especificações de componentes estão documentados em [`DESIGN.md`](./DESIGN.md). Os tokens ficam em `src/theme/` e são importados via:

```typescript
import { colors, spacing, typography } from '@/theme';
```
