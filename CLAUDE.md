@AGENTS.md

# CheckHand — Instruções para Claude Code

## Visão Geral do Projeto

**CheckHand** é um app mobile de tarefas e checklists para Android e iOS, construído com Expo SDK 56.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK ~56.0.8 |
| Runtime | React Native 0.85.3 / React 19 |
| Linguagem | TypeScript (strict) |
| Navegação | Expo Router (file-based) |
| Banco de dados | expo-sqlite (SQLite offline) |
| Plataformas | Android, iOS |

## Estrutura de Pastas

```
CheckHand/
├── app/                    # Rotas do Expo Router (file-based routing)
│   ├── (tabs)/             # Grupo de abas principais
│   │   ├── index.tsx       # Tela inicial (checklists)
│   │   └── _layout.tsx     # Layout das abas
│   ├── _layout.tsx         # Layout raiz (SQLiteProvider vai aqui)
│   └── [id].tsx            # Tela de detalhe dinâmica
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── database/
│   │   ├── migrations.ts   # Migrações de schema (PRAGMA user_version)
│   │   └── index.ts        # Re-exports do banco
│   ├── repositories/       # Acesso a dados por entidade
│   ├── hooks/              # Custom hooks (ex: useChecklists)
│   ├── theme/              # Tokens do design system (cores, tipografia, espaçamento)
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── types/              # Interfaces e types TypeScript
│   └── utils/              # Funções utilitárias
├── assets/
├── features/                   # Plano e especificações de features (ver features/plan.md)
├── CLAUDE.md
├── DESIGN.md                   # Design system: cores, tipografia, espaçamento, componentes
├── estrutura.md                # Modelo de dados, navegação e decisões técnicas
└── app.json
```

## Convenções

- **Componentes**: PascalCase, um arquivo por componente
- **Hooks**: prefixo `use`, ex: `useChecklists.ts`
- **Repositórios**: sufixo `Repository`, ex: `checklistRepository.ts`
- **Types**: interfaces prefixadas com `I` apenas quando ambíguas; prefer `type` para unions
- **Estilos**: `StyleSheet.create` inline no mesmo arquivo do componente
- **Imports**: absolutos via `@/` alias (configurar em tsconfig)

## Design System

O arquivo `DESIGN.md` na raiz contém o design system completo do projeto (cores, tipografia, espaçamento, border radius e especificações de componentes).

### Onde ficam os tokens no código

```
src/
└── theme/
    ├── colors.ts       # Paleta de cores do DESIGN.md
    ├── typography.ts   # Tamanhos, pesos e line-heights
    ├── spacing.ts      # Escala de espaçamento (xxs → section)
    └── index.ts        # Re-exports: import { colors, typography, spacing } from '@/theme'
```

### Como usar os tokens

```typescript
import { colors, spacing, typography } from '@/theme';

const styles = StyleSheet.create({
  container: { backgroundColor: colors.canvas, padding: spacing.lg },
  title:     { color: colors.ink, fontSize: typography.headingMd.fontSize },
});
```

### Principais tokens do DESIGN.md

| Token | Valor | Uso |
|---|---|---|
| `colors.canvas` | `#eeefe9` | Background principal (cor creme) |
| `colors.ink` | `#23251d` | Títulos e textos principais |
| `colors.body` | `#4d4f46` | Texto de corpo |
| `colors.primary` | `#f7a501` | CTA primário (amarelo-laranja) |
| `colors.surfaceCard` | `#ffffff` | Fundo de cards |
| `spacing.sm` | `8px` | Gap pequeno |
| `spacing.lg` | `16px` | Padding padrão |
| `spacing.xl` | `24px` | Padding interno de cards |
| `rounded.md` | `6px` | Border radius padrão |
| `rounded.full` | `9999px` | Pills e chips |

> Ao criar qualquer componente visual, consultar `DESIGN.md` antes de definir cores, fontes ou espaçamentos manualmente.

## Banco de Dados (expo-sqlite)

- O `SQLiteProvider` fica no layout raiz `app/_layout.tsx`
- Migrações usam `PRAGMA user_version` para versionamento
- Todo acesso ao DB passa por funções em `src/repositories/`
- Nunca usar SQL direto nos componentes ou hooks — sempre via repositório

## Navegação (Expo Router)

- Usar file-based routing do Expo Router v4 (incluído no SDK 56)
- Grupos com `(nome)/` para organizar sem afetar a URL
- Layouts compartilhados em `_layout.tsx`
- Parâmetros dinâmicos com `[id].tsx`

## Regras Importantes

- Não adicionar dependências sem verificar compatibilidade com Expo SDK 56
- Sempre instalar pacotes com `npx expo install` (não `npm install`) para garantir versões compatíveis
- Não usar `expo-sqlite` com SQL direto nos componentes — usar repositórios
- Não criar abstrações antes de ter 3+ usos reais do padrão
- Não adicionar comentários que expliquem o que o código faz — só o porquê quando não óbvio

## Scripts

```bash
npx expo start          # Iniciar dev server
npx expo start --android
npx expo start --ios
```
