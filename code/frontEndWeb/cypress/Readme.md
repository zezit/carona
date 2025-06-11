# 🧪 Testes E2E - Sistema de Carona

Este documento descreve como executar os testes end-to-end (E2E) implementados com Cypress para o sistema de carona.

## 📋 Pré-requisitos

Antes de executar os testes, certifique-se de que os seguintes serviços estejam **rodando**:

### ✅ **Obrigatórios**
- 🔄 **Backend API** rodando na porta `8080`
- 🌐 **Frontend Web** rodando na porta `5173` (ou configurada)
- 🗄️ **MySQL Database** ativo e acessível

> 📚 **Nota**: Para instruções detalhadas sobre como iniciar o backend e frontend, consulte a documentação específica de cada serviço.

### ✅ **Verificação Rápida**
```bash
# Verificar se os serviços estão ativos
curl http://localhost:8080/api/  # Backend
curl http://localhost:5173             # Frontend
```

## 🚀 Como Executar os Testes

### **Modo Web (Interface Gráfica)**
Interface visual interativa do Cypress - ideal para desenvolvimento e debug:

```bash
npm run cypress:web
```

**Características:**
- 🖥️ Interface gráfica completa
- 🔍 Debug em tempo real
- ⏯️ Pause e replay de testes
- 📷 Screenshots e vídeos automáticos
- 🔄 Re-execução automática ao salvar arquivos

### **Modo Headless (Terminal)**
Execução em background - ideal para CI/CD e execução rápida:

```bash
npm run test:e2e
```

**Características:**
- ⚡ Execução mais rápida
- 📊 Relatórios em texto
- 🎥 Vídeos salvos automaticamente
- 📷 Screenshots em falhas
- 💻 Ideal para automação

### **Modo Electron (Headless Visual)**
Híbrido entre os dois modos:

```bash
npm run cypress:headless
```

## 🎯 Execução de Testes Específicos

### **Testes Individuais**
```bash
# Apenas testes de login
npx cypress run --spec "cypress/e2e/auth/login.cy.js"

# Apenas testes de aprovação
npx cypress run --spec "cypress/e2e/users/approval.cy.js"

# Apenas testes de métricas
npx cypress run --spec "cypress/e2e/reports/metrics.cy.js"
```


### **Por Browser**
```bash
# Chrome
npx cypress run --browser chrome

# Firefox  
npx cypress run --browser firefox

# Edge
npx cypress run --browser edge
```

## 🖥️ Interface do Cypress

### **Cypress Test Runner (Web)**
Quando você executa `npm run cypress:web`, a interface gráfica oferece:

#### **🏠 Tela Principal**
- **E2E Testing**: Testes de ponta a ponta (nosso foco)
- **Component Testing**: Testes de componentes isolados
- **Settings**: Configurações do projeto

#### **📁 Seleção de Testes**
- Lista todos os arquivos `.cy.js`
- Organização por pastas
- Filtros de busca
- Status de execução anterior

#### **▶️ Execução de Testes**
- **Timeline**: Histórico de comandos executados
- **Preview**: Visualização da aplicação sendo testada
- **DevTools**: Console do navegador integrado
- **Screenshots**: Capturas automáticas

#### **🔧 Ferramentas de Debug**
- **Step-by-step**: Execução passo a passo
- **Time travel**: Volta a estados anteriores
- **Selector playground**: Testa seletores CSS
- **Network tab**: Monitora requisições

### **Cypress Dashboard (Headless)**
No modo terminal, você verá:

```bash
┌────────────────────────────────────────────────────────┐
│ Cypress:        13.x.x                                 │
│ Browser:        Electron                               │
│ Node Version:   v18.x.x                               │
└────────────────────────────────────────────────────────┘

  Running:  login.cy.js                              (1 of 6)
  ✓ Deve fazer login com credenciais válidas
  ✓ Deve mostrar erro com credenciais inválidas
  ✓ Deve validar campos obrigatórios
  
  3 passing (2s)
```

## 📊 Estrutura dos Testes

### **Suítes Disponíveis**
```
cypress/
├── e2e/
│   ├──🔐auth/
│   │   └── login.cy.js           # Testes de autenticação
│   ├──🏠dashboard/
│   │   └── index.cy.js          # Testes do painel principal
│   │     
│   ├──📊reports/
│   │   └── metrics.cy.js         # Testes de relatórios
│   └──👥users/
│       ├── approval.cy.js        # Testes de aprovação
│       ├── management.cy.js      # Testes de gerenciamento
│       
├── fixtures/                    # Dados de teste reutilizáveis
└── support/  
```


# Configurações e comandos
### **Cenários Cobertos**
- ✅ **Fluxos básicos**: Login, navegação, CRUD
- ✅ **Estados vazios**: Páginas sem dados
- ✅ **Cenários de erro**: APIs fora do ar, dados inválidos
- ✅ **Responsividade**: Desktop, tablet, mobile
- ✅ **Persistência**: Refresh, navegação entre abas

## 🔧 Configuração e Customização

### **Configuração Principal**
```javascript
// cypress.config.js
{
  baseUrl: 'http://localhost:5173',    # URL do frontend
  defaultCommandTimeout: 5000,        # Timeout padrão
  viewportWidth: 1280,                 # Resolução padrão
  video: true,                         # Gravar vídeos
  screenshotOnRunFailure: true         # Screenshots em falha
}
```


## 🐛 Troubleshooting

### **Problemas Comuns**

#### **❌ "Timed out waiting for page to load"**
```bash
# Verificar se frontend está rodando
curl http://localhost:5173
```

#### **❌ "Network Error"**  
```bash
# Verificar se backend está rodando
curl http://localhost:8080/api/health
```

#### **❌ "Element not found"**
- Aguardar mais tempo para carregamento
- Verificar se dados estão sendo carregados
- Consultar logs detalhados no teste

### **Debug Avançado**

#### **Modo Verbose**
```bash
DEBUG=cypress:* npm run test:e2e
```

#### **Apenas um Teste**
```bash
npx cypress run --spec "cypress/e2e/login.cy.js" --headed
```

#### **Pausar em Falhas**
```javascript
// Adicionar no teste
cy.pause();
```

## 📈 Relatórios e Resultados

### **Interpretação dos Resultados**
- ✅ **Verde**: Teste passou
- ❌ **Vermelho**: Teste falhou
- ⏭️ **Cinza**: Teste pulado
- ⏱️ **Tempo**: Duração da execução

## 🤝 Contribuindo

### **Adicionando Novos Testes**
1. Criar arquivo na pasta `cypress/e2e/`
2. Seguir padrão dos testes existentes
3. Adicionar logs informativos
4. Testar em diferentes cenários

### **Boas Práticas**
- ✅ Usar seletores estáveis (`data-cy`, `id`)
- ✅ Aguardar elementos aparecerem
- ✅ Testar cenários positivos e negativos
- ✅ Adicionar comentários explicativos
- ✅ Verificar responsividade

## 📚 Referências
- [Documentação do Cypress](https://docs.cypress.io/guides/overview/why-cypress)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
