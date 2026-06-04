# 0005 — Local Auth (PIN)

## Objetivo
Proteger o app com um PIN de 4 dígitos armazenado de forma segura no dispositivo. O PIN é opcional e configurável nas Configurações.

## Status
`Pendente`

## Dependências
- [0001-database-setup](./0001-database-setup.md)
- [0002-navigation-setup](./0002-navigation-setup.md)
- [0008-settings](./0008-settings.md)

---

## Tecnologias
- `expo-secure-store` — armazena o hash do PIN com criptografia nativa (Keychain no iOS, Keystore no Android)

> **Por que não SQLite?** O PIN é uma credencial de segurança. `expo-secure-store` usa o hardware de criptografia do dispositivo, que é mais seguro do que armazenar no banco SQLite.

---

## Telas

### `app/pin.tsx` — Tela de PIN
Exibida no boot do app se o PIN estiver ativado.

**Campos:**
| Campo | Tipo | Descrição |
|---|---|---|
| PIN input | 4 dígitos | Teclado numérico customizado ou nativo |

**Ações:**
- Digitar 4 dígitos → valida contra o hash salvo
- PIN correto → navega para `(tabs)/index`
- PIN errado → shake + mensagem de erro
- (Opcional) Biometria como alternativa ao PIN

---

### Fluxo de Configuração (dentro de `0008-settings`)
- Toggle "Usar PIN" → solicita criar um PIN
- Criar PIN: digitar 4 dígitos → confirmar → salvar hash
- Alterar PIN: confirmar PIN atual → digitar novo → confirmar
- Desativar PIN: confirmar PIN atual → desativar

---

## Armazenamento

```typescript
// Chave no expo-secure-store:
const PIN_KEY = 'checkhand_pin_hash';

// Salvar PIN (hash SHA-256 do PIN + salt):
await SecureStore.setItemAsync(PIN_KEY, hash);

// Verificar PIN:
const stored = await SecureStore.getItemAsync(PIN_KEY);
const isValid = stored === hash;

// Remover PIN:
await SecureStore.deleteItemAsync(PIN_KEY);
```

---

## Arquivos a Criar

```
app/
└── pin.tsx                          # CRIAR — tela de entrada do PIN
src/
├── hooks/
│   └── usePin.ts                    # CRIAR — verificar, criar, remover PIN
└── utils/
    └── security.ts                  # CRIAR — hashPin(pin, salt)
```

---

## Tasks

- [ ] Instalar `expo-secure-store`: `npx expo install expo-secure-store`
- [ ] Criar `src/utils/security.ts` com função de hash
- [ ] Criar `src/hooks/usePin.ts` (hasPin, verifyPin, createPin, removePin)
- [ ] Criar `app/pin.tsx` com teclado numérico de 4 dígitos
- [ ] No `app/_layout.tsx`, redirecionar para `/pin` no boot se PIN estiver ativo
- [ ] Integrar configuração de PIN na tela de Configurações (feature 0008)

---

## Critérios de Aceite

- App exibe tela de PIN no boot quando PIN está ativado
- PIN incorreto mostra feedback visual (shake/erro) sem revelar o PIN armazenado
- PIN correto redireciona para a tela principal
- Desativar PIN nas configurações remove o registro do SecureStore
- PIN não é armazenado em texto puro — apenas o hash
