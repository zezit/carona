# Documentação de Testes E2E - Carona App

## 📚 Índice

- [Visão Geral](#-visão-geral)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Estrutura de Testes](#-estrutura-de-testes)
- [Guia de Execução](#-guia-de-execução)
- [Cobertura de Código](#-cobertura-de-código)
- [Troubleshooting](#-troubleshooting)
- [Boas Práticas](#-boas-práticas)

## 🎯 Visão Geral

Este projeto utiliza **Maestro** para testes End-to-End (E2E) no aplicativo mobile React Native. Os testes são executados no **Expo Go** em emulador Android, com suporte a cobertura de código via Istanbul.

### Tecnologias Utilizadas

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| Maestro | 1.40.3 | Framework de testes E2E |
| Expo Go | Latest | Runtime para desenvolvimento |
| Istanbul | 6.1.1 | Instrumentação de código |
| NYC | 15.1.0 | Relatórios de cobertura |

## 🛠️ Configuração do Ambiente

### Pré-requisitos

1. **Node.js** (v18+)
2. **Android Studio** com emulador configurado
3. **Expo CLI** (`npm install -g @expo/cli`)
4. **Maestro** instalado

### Instalação do Maestro

```bash
# Windows (PowerShell)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verificar instalação
maestro --version
```

### Configuração do Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Instalar Expo Go no emulador
# Via Play Store ou APK direto

# 3. Verificar emulador
adb devices
```

## 📁 Estrutura de Testes

```
mobile/
├── test/
│   └── .maestro/
│       ├── 01_signup_flow.yaml         # Cadastro de usuário
│       ├── 02_login_flow.yaml          # Login válido/inválido
│       ├── 03_search_ride_flow.yaml    # Busca de carona
│       ├── 04_driver_create_flow.yaml  # Virar motorista
│       └── 05_profile_management_flow.yaml # Gerenciamento de perfil
├── babel.config.js                      # Configuração cobertura
├── metro.config.js                      # Configuração Metro
├── run-tests.ps1                        # Script automação
└── package.json                         # Scripts NPM
```




### Anatomia de um Teste Maestro

```yaml
appId: host.exp.exponent  # ID do Expo Go
---
# Navegação inicial
- launchApp
- waitForAnimationToEnd
- tapOn: "Carona?"
- waitForAnimationToEnd

# Interação com elementos
- tapOn:
    testID: "email-input"
- inputText: "test@example.com"

# Verificações
- assertVisible: "Login bem-sucedido"
```

## 🧪 Catálogo de Testes

### ✅ Login Flow (`login_flow.yaml`)

**Cenários Cobertos:**
- ✅ Login com credenciais válidas
- ✅ Login com credenciais inválidas
- ✅ Validação de campos obrigatórios
- ✅ Navegação entre telas

**Elementos Testados:**
```yaml
testID: "email-input"     # Campo de email
testID: "password-input"  # Campo de senha
testID: "login-button"    # Botão de login
```

**Assertions:**
- `"E-mail ou senha incorretos"` - Erro de login
- `"Bem-vindo"` - Login bem-sucedido

### 🔄 Create Ride Flow (`create_ride_flow.yaml`)

**Cenários Planejados:**
- [ ] Criação de carona com dados válidos
- [ ] Validação de campos obrigatórios
- [ ] Seleção de origem e destino
- [ ] Configuração de data/hora
- [ ] Confirmação de criação

### 🔄 Find/Request Ride Flow

**Cenários Planejados:**
- [ ] Busca por caronas disponíveis
- [ ] Filtros de busca
- [ ] Solicitação de carona
- [ ] Confirmação de solicitação

### 🔄 Profile Management Flow

**Cenários Planejados:**
- [ ] Visualização de perfil
- [ ] Edição de dados pessoais
- [ ] Upload de foto
- [ ] Alteração de senha

## 🚀 Guia de Execução

### Execução Manual

```bash
# 1. Configurar ambiente
$env:EXPO_DEVTOOLS = "false"

# 2. Iniciar aplicação
expo start

# 3. Conectar no Expo Go
# - Abrir Expo Go no emulador
# - Escanear QR code ou inserir URL
# - Aguardar app carregar

# 4. Executar testes (novo terminal)
maestro test test/.maestro/

# 5. Teste específico
maestro test test/.maestro/login_flow.yaml
```

### Execução Automatizada

```bash
# Script PowerShell completo
.\run-tests.ps1

# Via NPM
npm run test:e2e:simple

# Apenas testes (Expo já rodando)
npm run test:e2e
```

### Execução com Cobertura

```bash
# 1. Iniciar com instrumentação
npm run start:coverage

# 2. Executar testes
npm run test:e2e

# 3. Gerar relatório
npm run coverage:report

# 4. Abrir relatório
start coverage/index.html
```

## 📊 Cobertura de Código

### Configuração

**babel.config.js:**
```javascript
// Instrumentação condicional
if (process.env.COVERAGE === 'true') {
  plugins.push(['babel-plugin-istanbul', {
    exclude: [
      'node_modules/**',
      '**/*.test.js',
      '**/*.spec.js',
      '**/e2e/**'
    ]
  }]);
}
```

### Relatórios Disponíveis

| Formato | Localização | Uso |
|---------|-------------|-----|
| HTML | `coverage/index.html` | Navegação visual |
| Text | Console | CI/CD pipelines |
| LCOV | `coverage/lcov.info` | Integração ferramentas |

### Métricas Coletadas

- **Statements**: Linhas executadas
- **Branches**: Condições testadas
- **Functions**: Funções chamadas
- **Lines**: Cobertura por linha

## 🔧 Troubleshooting

### Problemas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| `Element not found: email-input` | testID incorreto | Verificar IDs no código |
| Banner Expo aparece | Dev tools ativo | `$env:EXPO_DEVTOOLS = "false"` |
| App fecha durante teste | clearState problemático | Remover ou ajustar |
| `waitFor` comando inválido | Versão Maestro | Usar `waitForAnimationToEnd` |

### Debug de Elementos

```bash
# Capturar hierarquia UI atual
maestro hierarchy > debug_elements.txt

# Buscar elementos específicos
maestro hierarchy | findstr -i "email\|login\|button"

# Screenshot para referência
adb shell screencap -p > screenshot.png
```

### Validação de Ambiente

```bash
# Verificar Maestro
maestro --version

# Verificar emulador
adb devices

# Verificar Expo Go
adb shell pm list packages | findstr expo

# Testar conexão
maestro test --dry-run test/.maestro/login_flow.yaml
```

## 📝 Boas Práticas

### Estrutura de Testes

```yaml
# ✅ BOM: Teste focado e claro
appId: host.exp.exponent
---
- launchApp
- waitForAnimationToEnd
- tapOn: "Carona?"
- waitForAnimationToEnd

# Teste específico com comentários
# Test: Valid login
- tapOn:
    testID: "email-input"
- inputText: "test@example.com"
```

### Nomenclatura de Elementos

```jsx
// ✅ BOM: testID consistente
<FormInput
  testID="email-input"  // kebab-case
  label="Email"
/>

// ❌ RUIM: ID inconsistente
<FormInput
  id="emailField"  // camelCase misturado
  testID="Email_Input"  // snake_case
/>
```

### Organização de Arquivos

```
test/.maestro/
├── auth/
│   ├── login_flow.yaml
│   ├── register_flow.yaml
│   └── logout_flow.yaml
├── rides/
│   ├── create_ride_flow.yaml
│   └── find_ride_flow.yaml
└── profile/
    └── profile_management_flow.yaml
```

### Assertions Efetivas

```yaml
# ✅ BOM: Assertion específica
- assertVisible: "Login realizado com sucesso"

# ❌ RUIM: Assertion genérica
- assertVisible: "Success"

# ✅ BOM: Aguardar carregamento
- waitForAnimationToEnd
- assertVisible: "Dashboard"

# ❌ RUIM: Assertion imediata
- assertVisible: "Dashboard"
```

### Dados de Teste

```yaml
# ✅ BOM: Dados realistas
- inputText: "test@pucminas.br"
- inputText: "senha123"

# ❌ RUIM: Dados genéricos
- inputText: "test"
- inputText: "pass"
```

## 📈 Métricas e Monitoramento

### KPIs de Teste

- **Taxa de Sucesso**: % de testes passando
- **Tempo de Execução**: Duração total dos testes
- **Cobertura de Código**: % de código testado
- **Detecção de Bugs**: Bugs encontrados vs total

### Relatórios Periódicos

```bash
# Relatório semanal
npm run test:e2e > weekly_report.txt

# Trending de cobertura
npm run coverage:report && echo "$(date): $(grep -o '[0-9]*%' coverage/index.html | head -1)" >> coverage_trend.log
```

## 🔄 Integração CI/CD

### GitHub Actions (Exemplo)

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Run E2E tests
        run: npm run test:e2e:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---






