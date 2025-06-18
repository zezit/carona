# Plano de Testes Prioritários – Projeto **Carona?**

## Introdução

Este documento define o plano de testes para as funcionalidades de alta prioridade do sistema **Carona?**, conforme identificadas no documento de arquitetura. Focamos nas funcionalidades com maior impacto no uso do sistema e aquelas que são fundamentais para a operação básica da plataforma.

## Funcionalidades Prioritárias

| **ID** | **Descrição**                              | **Prioridade** |
| ------ | ------------------------------------------ | -------------- |
| RF01   | Passageiro realiza login                   | Alta           |
| RF02   | Passageiro realiza cadastro                | Alta           |
| RF03   | Passageiro se registra em carona existente | Alta           |
| RF09   | Motorista gerencia viagens                 | Alta           |
| RF10   | Motorista gerencia passageiros da viagem   | Alta           |
| RF11   | Motorista realiza cadastro                 | Alta           |
| RF12   | Motorista realiza login                    | Alta           |
| RF13   | Motorista gerencia perfil                  | Alta           |
| RF19   | Administrador visualiza todas as viagens   | Alta           |
| RF20   | Administrador gerencia usuários            | Alta           |

---

## Funcionalidades e Casos de Teste

### 1. Cadastro (Passageiro e Motorista) - RF02, RF11

**Comportamento Esperado**  
O usuário poderá se cadastrar informando nome, e‑mail, senha, confirmação de senha e papel (motorista ou passageiro).
Se for motorista, deverá incluir dados do veículo, CNH e contato (WhatsApp).  
O sistema deve validar todos os campos e, em caso de sucesso, redirecionar para a tela de confirmação de cadastro pendente.

**Verificações**  
- Todos os campos obrigatórios preenchidos  
- Validação de padrão de e‑mail com domínio da instituição (@pucminas.br)  
- Senha com no mínimo 6 caracteres e requisitos de segurança (letra maiúscula, número e símbolo)  
- Confirmação de senha igual à senha  
- Tentativa de cadastro com e‑mail já existente  
- Validação de formato de matrícula (somente números, 11 dígitos)
- Motorista: validação de CNH (formato válido, 11 dígitos)
- Motorista: validação de placa do veículo (formato válido)
- Motorista: validação de capacidade de passageiros (entre 1 e 8)
- Feedback visual claro em casos de erro ou sucesso

**Critérios de Aceite**  
- Usuário criado no banco de dados com status "PENDENTE"  
- Redirecionamento para tela de confirmação de cadastro pendente  
- Mensagens de erro específicas exibidas para campos inválidos
- E-mail com código de confirmação enviado para verificar e-mail do usuário
- Registro de dados completos do veículo (para motoristas)

---

### 2. Login (Passageiro e Motorista) - RF01, RF12

**Comportamento Esperado**  
O usuário poderá acessar a plataforma com e‑mail e senha válidos, tendo seu cadastro previamente aprovado. Em caso de erro, deve receber feedback claro.

**Verificações**  
- Login bem‑sucedido com credenciais válidas e cadastro aprovado  
- Mensagem de erro ao deixar campos vazios  
- Mensagem de erro para senha incorreta  
- Mensagem informativa se o cadastro ainda estiver pendente de aprovação
- Mensagem informativa se o cadastro tiver sido rejeitado
- Bloqueio temporário após 3 tentativas malsucedidas
- Opção "Esqueci minha senha" funcional

**Critérios de Aceite**  
- Sessão iniciada corretamente e token JWT emitido com validade de 7 dias  
- Tela principal carregada após login (diferente para motorista e passageiro)
- Bloqueio de conta temporário sinalizado ao usuário
- Caminho de recuperação de senha via e-mail funcionando corretamente
- Autoridades corretas definidas no token com base no perfil do usuário

---

### 3. Registro em Carona Existente (Passageiro) - RF03

**Comportamento Esperado**  
O passageiro pode visualizar caronas disponíveis, solicitar participação em uma carona e aguardar aprovação do motorista.

**Verificações**  
- Visualização da lista de caronas disponíveis com detalhes (origem, destino, horário, vagas)
- Filtro por origem/destino/horário funcionando corretamente
- Ao solicitar participação, usuário pode adicionar mensagem ao motorista
- Feedback claro após envio da solicitação
- Visualização do status da solicitação (pendente, aprovada, rejeitada)
- Recebimento de notificação quando status é alterado pelo motorista

**Critérios de Aceite**  
- Solicitação registrada no banco de dados
- Notificação enviada ao motorista sobre nova solicitação
- Status inicial de solicitação como "PENDENTE"
- Tela de "Minhas Caronas" atualizada com a nova solicitação e seu status
- Bloqueio de múltiplas solicitações para a mesma carona
- Validação de conflito de horário com outras caronas já confirmadas

---

### 4. Gerenciar Viagens (Motorista) - RF09

**Comportamento Esperado**  
O motorista pode criar, editar, excluir ou encerrar viagens, informando pontos de origem/destino, data/horário e vagas disponíveis.

**Verificações**  
- Criação de nova viagem com todos os dados obrigatórios (origem, destino, horário, vagas)
- Visualização no mapa da rota planejada durante a criação
- Edição de viagem existente (data, horário, vagas, observações)
- Bloqueio de edição para viagens com passageiros já confirmados (exceto observações)
- Cancelamento de viagem com justificativa
- Encerramento de viagem com confirmação de chegada
- Validação de datas (não permitir viagens no passado)
- Visualização da lista de viagens agendadas, em andamento e encerradas

**Critérios de Aceite**  
- Operações persistidas no banco de dados
- Feedback visual após cada ação  
- Atualização imediata da lista de viagens
- Notificações enviadas aos passageiros em caso de alterações ou cancelamentos
- Cálculo correto de distância e tempo estimado da rota
- Registro correto da trajetória para exibição no mapa

---

### 5. Gerenciar Passageiros (Motorista) - RF10

**Comportamento Esperado**  
O motorista pode visualizar a lista de solicitações de passageiros para cada viagem e aceitar ou recusar cada solicitação, além de gerenciar os passageiros já confirmados.

**Verificações**  
- Exibição da lista de solicitações pendentes com informações do passageiro
- Indicador de novas solicitações não visualizadas
- Aceitar solicitação: passageiro adicionado à lista de participantes
- Recusar solicitação: opção de incluir justificativa e notificação ao passageiro
- Remoção de passageiro já aceito (com justificativa)
- Visualização do histórico de avaliações do passageiro
- Contato direto com passageiro via botão de WhatsApp (se ativado pelo passageiro)

**Critérios de Aceite**  
- Mudanças refletidas no status da viagem e contagem de vagas disponíveis
- Notificações enviadas corretamente aos passageiros
- Interface atualizada sem necessidade de recarregar a página
- Validação para não ultrapassar o limite de vagas do veículo
- Histórico de alterações registrado (quem foi aceito/removido e quando)

---

### 6. Gerenciar Perfil (Motorista) - RF13

**Comportamento Esperado**  
O motorista pode atualizar informações do perfil pessoal, dados do veículo, configurações de privacidade e segurança da conta.

**Verificações**  
- Edição de informações pessoais: nome, telefone, e-mail
- Alteração de senha com confirmação da senha atual
- Upload/remoção de foto de perfil
- Edição de dados do veículo (modelo, placa, cor, capacidade)
- Adição/remoção de veículo secundário
- Configuração de privacidade (mostrar/ocultar WhatsApp)
- Exibição de histórico de avaliações recebidas
- Desativação temporária da conta (pausa nas atividades)

**Critérios de Aceite**  
- Dados atualizados no banco de dados
- Feedback de sucesso ou erro por campo
- Validação de formatos (e-mail, telefone, placa)
- Persistência das alterações após logout/login
- Imagens armazenadas corretamente no Supabase
- No caso de alteração de e-mail, verificação do novo e-mail antes da efetivação
- Bloqueio automático de veículo com avaliações negativas recorrentes

---

### 7. Visualizar Todas as Viagens (Administrador) - RF19

**Comportamento Esperado**  
O administrador pode visualizar, filtrar e monitorar todas as viagens registradas no sistema, com detalhes completos e opções de intervenção.

**Verificações**  
- Listagem de todas as viagens com paginação e filtros
- Filtros por status (agendada, em andamento, concluída, cancelada)
- Filtros por período (data/hora)
- Filtros por motorista ou passageiro específico
- Visualização detalhada de cada viagem, incluindo trajetória no mapa
- Visualização de passageiros confirmados em cada viagem
- Acesso ao histórico de alterações na viagem
- Capacidade de cancelar uma viagem com notificação aos envolvidos

**Critérios de Aceite**  
- Carregamento eficiente de grandes volumes de dados (paginação)
- Filtros funcionando corretamente
- Dados detalhados de cada viagem acessíveis
- Rota de cada viagem corretamente exibida no mapa
- Log de ações administrativas registrado
- Notificações enviadas ao cancelar uma viagem
- Exportação de dados de viagens para relatórios em CSV/PDF

---

### 8. Gerenciar Usuários (Administrador) - RF20

**Comportamento Esperado**  
O administrador pode listar, buscar, aprovar, rejeitar, suspender ou reativar usuários do sistema, além de visualizar detalhes e histórico de cada um.

**Verificações**  
- Listagem paginada de todos os usuários com filtros
- Filtros por tipo (motorista/passageiro), status e data de cadastro
- Análise de novos cadastros pendentes de aprovação
- Revisão de documentos anexados pelos usuários (CNH para motoristas)
- Ação de aprovar altera status para "ATIVO"
- Ação de rejeitar altera status para "REJEITADO" com justificativa
- Ação de suspender altera status para "SUSPENSO" com período e justificativa
- Visualização do histórico de caronas e avaliações de cada usuário
- Visualização de denúncias relacionadas ao usuário

**Critérios de Aceite**  
- Estados refletidos corretamente no banco de dados
- Notificações enviadas aos usuários após alteração de status
- Interface responsiva, mesmo com grande volume de usuários
- Restrição correta de acesso após suspensão de usuário
- Log detalhado de ações administrativas (quem aprovou/rejeitou e quando)
- Estatísticas de usuários por status e tipo
- Funcionalidade de busca por nome, e-mail ou matrícula funcionando corretamente

---
##  Escopo dos Testes

### Backend
Testes unitários e de serviço para:
- **Criação de carona**: Sucesso, motorista não aprovado, datas inválidas, vagas inválidas, quantidade acima da capacidade do carro.
- **Busca de carona**: Por ID, por motorista, tratamento de carona inexistente.
- **Alteração de status da carona**: Sucesso, carona não pertence ao motorista, status inválido, carona já cancelada.
- **Atualização de carona**: Sucesso, carona inexistente, carona de outro motorista, datas inconsistentes.

### Mobile
Testes de fluxo automatizados (Maestro) para:
- **Cadastro de usuário**: Preenchimento de dados, validação de sucesso.
- **Login**: Autenticação com credenciais válidas.
- **Busca de carona**: Login e navegação até tela de busca.
- **Criação de motorista**: Login e fluxo de cadastro de motorista.
- **Gerenciamento de perfil**: Login, navegação e validação de informações do perfil.

### Frontend Web
Testes E2E (Cypress) para:
- **Login**: Autenticação com credenciais válidas.
- **Dashboard**: Exibição correta das informações principais após login.
- **Gerenciamento de usuários**: Navegação, exibição e validação de dados de usuários.
- **Aprovação de usuários**: Navegação, exibição e validação de solicitações pendentes.
- **Relatórios/Métricas**: Acesso e validação de dados de métricas e relatórios.

##  Ambiente e Ferramentas

| Ferramenta           | Time            | Descrição                                                      |
|----------------------|-----------------|----------------------------------------------------------------|
| Insomnia/Swagger     | Qualidade       | Ferramenta para realização de testes de API                    |
| Jest                 | Desenvolvimento | Framework utilizada para testes unitários                      |
| Cypress              | Qualidade       | Ferramenta para testes end-to-end                              |
| Lighthouse           | Desenvolvimento | Avaliação de performance e acessibilidade da aplicação         |
| Gravador de Passos   | Desenvolvimento | Prover evidências dos testes                                   |

##  Critérios de Aceite
- Todas as funcionalidades críticas devem possuir testes automatizados cobrindo cenários de sucesso e falha.
- Os testes devem ser executados sem falhas antes de cada entrega.

## Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1  | Blocker             | ● Bug que bloqueia o teste de uma função ou feature, causa crash na aplicação.\n● Botão não funciona impedindo o uso completo da funcionalidade.\n● Bloqueia a entrega. |
| 2  | Grave               | ● Funcionalidade não funciona como o esperado.\n● Input incomum causa efeitos irreversíveis. |
| 3  | Moderada            | ● Funcionalidade não atinge certos critérios de aceitação, mas sua funcionalidade em geral não é afetada.\n● Mensagem de erro ou sucesso não é exibida. |
| 4  | Pequena             | ● Quase nenhum impacto na funcionalidade, porém atrapalha a experiência.\n● Erro ortográfico.\n● Pequenos erros de UI. |

##  Definição de Pronto
Uma funcionalidade será considerada Pronta quando:
- Todos os testes definidos forem realizados e aprovados;
- Nenhum bug classificado como Blocker ou Grave permanecer aberto;
- A validação de negócio for concluída pelo time de produto.

## Evidências
Os scripts de teste e resultados estão disponíveis nos diretórios:
- `code/backend/src/test/java/com/br/puc/carona/service/`
- `code/mobile/test/.maestro/`
- `code/frontEndWeb/cypress/e2e/`


## Estratégia de Teste Recomendada

Para validar adequadamente essas funcionalidades prioritárias, recomenda-se:

1. **Testes Unitários**:
   - Validação de regras de negócio
   - Validação de DTOs/entidades
   - Testes de serviços isolados

2. **Testes de Integração**:
   - Fluxos completos de API (ex: cadastro → aprovação → login)
   - Testes de banco de dados
   - Testes de integração com serviços externos (mapas, mensageria)

3. **Testes End-to-End**:
   - Fluxos completos na interface mobile e web
   - Cenários de uso real (persona-based testing)

4. **Testes de Segurança**:
   - Validação de autenticação e autorização
   - Prevenção de ataques comuns (injeção, XSS)
   - Proteção de dados sensíveis

5. **Testes de Desempenho**:
   - Carga em endpoints críticos
   - Tempos de resposta para cálculos de rota
   - Comportamento sob múltiplas solicitações simultâneas
