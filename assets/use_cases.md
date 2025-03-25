## 1. Casos de Uso

### 1.1. Autenticação e Cadastro

#### 1.1.1. Caso de Uso: Realizar Login
##### Para Estudantes (Passageiro/Motorista) – Versão Mobile

- **Ator Primário:** Estudante (seja como passageiro ou motorista)
- **Pré-condições:**  
  - O usuário já deve ter um cadastro ativo na plataforma.  
- **Fluxo Principal:**  
  1. O usuário acessa a tela de login no aplicativo.  
  2. Insere e-mail e senha.  
  3. O sistema valida as credenciais.  
  4. Se válidas, o sistema autentica o usuário e direciona para a tela principal (home).  
- **Fluxos Alternativos:**  
  - Se as credenciais forem inválidas, exibir mensagem de erro e permitir nova tentativa ou a opção de “esqueci minha senha”.  
- **Fluxos de Exceção:**  
  - Falha na conexão com o servidor: exibe mensagem de “erro de conexão” e sugere tentar novamente mais tarde.

##### Para Administradores – Versão Web

- **Ator Primário:** Administrador
- **Pré-condições:**  
  - O administrador já deve ter um cadastro e ser aprovado para acesso à versão web.
- **Fluxo Principal:**
- O administrador acessa a tela de login na versão web da plataforma.
- Insere e-mail e senha.
- O sistema valida as credenciais.
- Se válidas, o sistema autentica o administrador e direciona para o painel de controle.
- **Fluxos Alternativos:**  
  - Se as credenciais forem inválidas, exibir mensagem de erro e permitir nova tentativa ou a opção de “esqueci minha senha”.

---

#### 1.1.2. Caso de Uso: Realizar Cadastro
- **Ator Primário:** Estudante  
- **Fluxo Principal:**  
  1. O usuário acessa a tela de cadastro no aplicativo.  
  2. Preenche os dados pessoais (nome, e-mail, senha, data de nascimento, matrícula).  
  3. Escolhe seu tipo (passageiro, motorista ou ambos).  
  4. Caso selecione motorista, são solicitados dados adicionais (CNH, veículo – modelo, placa, cor, capacidade – e WhatsApp).  
  5. O sistema valida os dados (formato, duplicidade, etc.).  
  6. Se válidos, registra o usuário e envia e-mail de confirmação.  
  7. O sistema encaminha para a tela de login.  
- **Fluxos Alternativos:**  
  - Dados incompletos ou inválidos: exibe mensagens de erro específicas e solicita correção.  
  - Em caso de cadastro de motorista, se faltar algum dado obrigatório (ex: CNH), o sistema impede a conclusão e informa o que é necessário.  
- **Fluxos de Exceção:**  
  - Falha na comunicação com a API do servidor: informa erro e orienta o usuário a tentar mais tarde.

---

### 1.2. Gerenciamento de Caronas

#### 1.2.1. Caso de Uso: Criar Carona (Motorista)
- **Ator Primário:** Motorista (EstudanteMotorista)  
- **Pré-condições:**  
  - O motorista deve estar autenticado e com o perfil de motorista devidamente cadastrado.  
  - Ter veículo cadastrado.  
- **Fluxo Principal:**  
    1. O motorista acessa a opção **“Criar Carona”**.  
    2. Preenche os seguintes dados obrigatórios:  
    - Origem  
    - Destino  
    - Horário de agendamento  
    - Indicação se a viagem será recorrente  
    - Quantidade de vagas disponíveis  
    3. O sistema salva a carona e define o status como **AGENDADA**.  
    4. **Os horários de partida e chegada são calculados automaticamente pelo sistema** com base na distância entre origem e destino, utilizando a **API de mapas**.  
    5. Passageiros interessados enviam uma **solicitação para participar da carona**.  
    6. O motorista analisa as solicitações e **aceita ou rejeita** passageiros.  
    7. Passageiros aceitos são automaticamente vinculados a **paradas geradas pelo sistema**.  
    8. O sistema envia notificações de **confirmação da carona** para passageiros aceitos.  
    9. Caso seja uma viagem recorrente, o sistema verifica se há passageiros **com recorrência agendada** e envia notificações de confirmação a eles.
**Fluxo Alternativo:**  
- Se o motorista não aceitar nenhuma solicitação de passageiros, a carona permanecerá disponível até que o motorista cancele ou inicie a viagem.  
- Caso a viagem tenha sido marcada como recorrente e **nenhum passageiro recorrente tenha sido vinculado**, o motorista poderá editá-la posteriormente.  

**Fluxos de Exceção:**  
- Caso o sistema detecte uma falha na conexão, informa o motorista e sugere tentar novamente.  
  - Dados obrigatórios não preenchidos: impede a criação e exibe alerta.

---

#### 1.2.2. Caso de Uso: Buscar Carona (Passageiro)
- **Ator Primário:** Passageiro  
- **Pré-condições:**  
  - Usuário autenticado.  
  - Localização (origem) e destino informados, possivelmente utilizando integração com mapas (Google Maps API).  
- **Fluxo Principal:**  
    1. O passageiro acessa **"Buscar Carona"**.  
    2. Informa **origem e destino**, podendo utilizar **geolocalização** para identificar sua posição atual.  
    3. O sistema **filtra e sugere caronas compatíveis**, incluindo:  
    - **Caronas AGENDADAS** que ainda não começaram.  
    - **Caronas EM ANDAMENTO** que tenham vagas disponíveis e ainda não passaram pela localização do passageiro.  
    4. Para **Caronas EM ANDAMENTO**, o sistema verifica se:  
    - A parada do passageiro pode ser adicionada sem comprometer o trajeto.  
    - O tempo estimado até o embarque é viável para que o motorista consiga pará-lo sem atrasar significativamente o percurso.  
    - O passageiro está dentro de uma **margem de distância aceitável** do trajeto atual da carona.  
    5. O passageiro seleciona uma carona e pode:  
    - **Solicitar participação na viagem**.  
    - **Buscar outra carona**.  
    6. O motorista recebe a solicitação e pode:  
    - **Aceitar** a solicitação.  
    - **Recusar** a solicitação.  
    - **Propor um novo ponto de encontro**.  
    7. Se aceito, o passageiro recebe **confirmação da viagem** e um tempo estimado de chegada do motorista.  
    8. O passageiro pode **cancelar sua solicitação até o momento do embarque**.  
- **Fluxos Alternativos:**  
  - Se nenhuma carona for encontrada, o sistema cancela a busca depois de 8 minutos e exibe mensagem de alerta.  

---

#### 1.2.3. Caso de Uso: Registrar Participação em Carona (Inscrição)
- **Ator Primário:** Passageiro  
- **Pré-condições:**  
  - Passageiro autenticado.  
  - Carona com vagas disponíveis e com status **AGENDADA** ou
**EM ANDAMENTO**. 
- **Fluxo Principal:**  
  1. Na tela de detalhes da carona, o passageiro seleciona “Participar”.  
  2. O sistema verifica se há vagas e se não há conflito com outros compromissos ou caronas agendadas.  
  3. Caso positivo, registra o passageiro na carona (incluindo criação de um registro em *PassageiroRecorrencia* para caronas recorrentes, se aplicável).  
  4. Atualiza a lista de passageiros na *Parada* correspondente ou diretamente na carona.  
  5. Envia uma notificação ao motorista confirmando a inscrição.  
- **Fluxos Alternativos:**  
  1. Se a carona estiver cheia ou o horário conflitar, exibe mensagem de alerta e impede a inscrição.
  2. Se o motorista solicitar mudança de ponto de encontro, o sistema atualiza a inscrição e notifica o passageiro.
  3. Se o motorista recusar a inscrição, o sistema informa o passageiro e libera a vaga para outro interessado.  
- **Fluxos de Exceção:**  
  - Falha na atualização dos dados: reverte operação e informa o usuário.

---

#### 1.2.4. Caso de Uso: Cancelar Inscrição em Carona
- **Ator Primário:** Passageiro  
- **Pré-condições:**  
  - Passageiro já registrado na carona.  
- **Fluxo Principal:**  
  1. O passageiro acessa detalhes da carona inscrita.  
  2. Seleciona a opção “Cancelar Inscrição”.  
  3. O sistema atualiza o status da inscrição (pode alterar o registro de *PassageiroRecorrencia* para **CANCELADA** ou remover a inscrição, conforme a regra de negócio).  
  4. Envia notificação ao motorista informando sobre o cancelamento e libera a vaga para outro passageiro.
- **Fluxos de Exceção:**  
  - Falha na atualização do banco de dados: reverte e exibe erro.

---

#### 1.2.5. Caso de Uso: Gerenciar Viagem (Motorista)
- **Ator Primário:** Motorista  
- **Pré-condições:**  
  - Carona criada.  
- **Fluxo Principal:**  
  1. O motorista acessa a lista de viagens agendadas.  
  2. Seleciona uma carona e inicia a viagem, alterando o status para **EM_ANDAMENTO**.  
  3. Durante a viagem, o motorista pode visualizar a localização dos pontos de parada e confirmar a chegada em cada parada (deve ter um raio máximo de tolerância igual a 500 metros). 
  4. Ao término da viagem, o motorista finaliza a carona, atualizando o status para **FINALIZADA**.  
  5. O sistema gera o histórico da viagem e aciona o fluxo de avaliações (tanto para motorista quanto para passageiros).  
- **Fluxos Alternativos:**  
  - Cancelamento da viagem: o motorista pode cancelar a viagem antes de iniciar ou durante (caso passageiro ainda não tenha embarcado) (status **CANCELADA**), notificando todos os passageiros.  
---

#### 1.2.6. Caso de Uso: Gerenciar Passageiros da Viagem (Motorista)
- **Ator Primário:** Motorista  
- **Pré-condições:**  
  - Viagem em fase de agendamento ou durante a execução.  
- **Fluxo Principal:**  
  1. Na tela de detalhes da viagem, o motorista visualiza a lista de passageiros inscritos.  
  2. Pode confirmar ou recusar inscrições (por exemplo, se exceder a capacidade ou houver conflitos).  
  3. Atualiza manualmente a lista de passageiros conforme necessário (ex: remarcação de parada ou mudança de rota).  
  4. Envia notificações individuais aos passageiros caso haja alteração.  
- **Fluxos Alternativos:**  
  - Se algum passageiro não comparecer, o motorista pode removê-lo da lista e liberar vaga para outro passageiro (caso o sistema permita waitlist).  
  - Caso passageiro não comparece, uma denúncia automática é registrada com conteúdo “Passageiro não compareceu” e sua avaliação para essa corrida é zerada.
- **Fluxos de Exceção:**  
  - Caso haja falha ao atualizar os dados dos passageiros, o sistema exibe erro e permite nova tentativa.

---

#### 1.2.7. Caso de Uso: Visualizar Mapa (Navegação)
- **Ator Primário:** Motorista  
- **Pré-condições:**  
  - Viagem iniciada ou próxima de iniciar.  
- **Fluxo Principal:**  
  1. O motorista acessa a funcionalidade “Visualizar Mapa”.  
  2. O sistema integra com a API do Google Maps para mostrar a rota e pontos de parada.  
- **Fluxos Alternativos:**  
  - Se houver erro na integração com o mapa, exibe mensagem e sugere navegação via outro recurso (ex: link externo).  
---

### 1.3. Avaliações e Histórico

#### 1.3.1. Caso de Uso: Avaliar Motorista (Passageiro)
- **Ator Primário:** Passageiro  
- **Pré-condições:**  
  - Viagem finalizada.  
- **Fluxo Principal:**  
  1. O passageiro acessa o histórico de viagens e seleciona a carona finalizada.  
  2. Seleciona “Avaliar Motorista” e insere nota (de 1 a 5) e comentário caso já não tenha avaliado.
  3. O sistema registra a avaliação e recalcula a média de avaliações do motorista.   
- **Fluxos Alternativos:**  
  - Caso o passageiro não queira avaliar, pode pular o processo.  
- **Fluxos de Exceção:**  
  - Se o registro da avaliação falhar, o sistema informa e solicita nova tentativa.

---

#### 1.3.2. Caso de Uso: Avaliar Passageiro (Motorista)
- **Ator Primário:** Motorista  
- **Pré-condições:**  
  - Viagem finalizada.  
- **Fluxo Principal:**  
  1. O motorista acessa o histórico de viagens e seleciona a carona concluída.  
  2. Seleciona o passageiro e insere nota e comentário.  
  3. O sistema registra a avaliação e atualiza a média do passageiro.  
- **Fluxos Alternativos e Exceções:**  
  - Similar ao fluxo de avaliação do motorista.

---

#### 1.3.3. Caso de Uso: Visualizar Histórico de Viagens
- **Ator Primário:** Estudante (tanto passageiro quanto motorista)  
- **Pré-condições:**  
  - Usuário autenticado e com viagens registradas.  
- **Fluxo Principal:**  
  1. O usuário acessa a seção “Histórico de Viagens”.  
  2. O sistema lista todas as viagens (agendadas, realizadas, canceladas) com detalhes (rota, horário, avaliações).  
  3. Permite filtrar por datas, status ou destino.  
- **Fluxos Alternativos:**  
  - Caso não haja viagens registradas, exibe mensagem informando “Nenhuma viagem registrada”.

---

### 1.5. Denúncias e Gerenciamento Administrativo

#### 1.5.1. Caso de Uso: Denunciar Usuário
- **Ator Primário:** Estudante  
- **Pré-condições:**  
  - Usuário autenticado e com uma viagem ou interação realizada.  
- **Fluxo Principal:**  
  1. O estudante seleciona um outro usuário (motorista ou passageiro) a partir de seu perfil no histórico de viagem.  
  2. Seleciona a opção “Denunciar” e insere uma descrição do ocorrido.  
  3. O sistema registra a denúncia com status **PENDENTE** e associa o denunciante, denunciado e, quando aplicável, o identificador da viagem.  
  4. Envia confirmação ao denunciante e notifica o administrador para análise.  
- **Fluxos Alternativos:**  
  - Se o usuário tentar denunciar sem selecionar um motivo ou descrição, o sistema solicita que complete a informação.  
- **Fluxos de Exceção:**  
  - Falha na gravação da denúncia: exibe mensagem de erro e orienta nova tentativa.

---

#### 1.5.2. Caso de Uso: Gerenciar Denúncias (Administrador)
- **Ator Primário:** Administrador  
- **Pré-condições:**  
  - Administrador autenticado na interface web.  
- **Fluxo Principal:**  
  1. O administrador acessa a seção “Gerenciar Denúncias”.  
  2. Visualiza a lista de denúncias com filtros (por status, data, usuário).  
  3. Seleciona uma denúncia para análise e pode:  
     - Marcar como **RESOLVIDA**;  
     - Solicitar mais informações;  
     - Aplicar sanções (suspensão da conta até que o administrador resolva reativar).  
  4. O sistema atualiza o status da denúncia e registra a ação tomada.  
  5. Envia notificações ao denunciado e, se aplicável, ao denunciante.  
  6. Recalcula a avaliação do denunciado, se necessário (usando o seguinte critério: se a denúncia for confirmada, é reduzida a avaliação do denunciado em 0.5 pontos).
- **Fluxos Alternativos:**  
  - Se o administrador decidir reabrir uma denúncia resolvida por novas evidências, altera o status para **PENDENTE** novamente.  
- **Fluxos de Exceção:**  
  - Problemas na atualização do status da denúncia: registrar log e alertar para intervenção manual.

---

#### 1.5.3. Caso de Uso: Aprovar Novos Usuários (Administrador)
- **Ator Primário:** Administrador  
- **Pré-condições:**  
  - Novos cadastros de estudantes (possivelmente pendentes de validação).  
- **Fluxo Principal:**  
  1. O administrador acessa a seção “Aprovar Novos Usuários”.  
  2. Visualiza a lista de cadastros pendentes (dados básicos e documentos, se houver verificação manual).  
  3. Seleciona um cadastro e analisa as informações.  
  4. Aprova ou rejeita o cadastro, informando o motivo (no caso de rejeição).  
  5. O sistema atualiza o status do cadastro e envia notificação ao usuário.  
- **Fluxos Alternativos:**  
  - Se houver dúvidas, o administrador pode solicitar documentação complementar.  
- **Fluxos de Exceção:**  
  - Se a atualização do cadastro falhar, o administrador é notificado para reprocessar a ação.

---

#### 1.5.4. Caso de Uso: Gerenciar Universidade e Usuários (Administrador)
- **Ator Primário:** Administrador  
- **Pré-condições:**  
  - Acesso autenticado na interface administrativa.  
- **Fluxo Principal:**  
  1. O administrador acessa a área de “Gerenciamento de Universidade”.    
  2. Em “Gerenciar Usuários”, o administrador pode:  
     - Editar perfis de usuários;  
     - Suspender ou reativar contas;  
     - Visualizar histórico e avaliações dos usuários.

---

### 1.6. Gerenciamento de Recorrência  
#### 1.6.1. Caso de Uso: Gerenciar Recorrência de Carona
- **Ator Primário:** Passageiro e Motorista  
- **Pré-condições:**  
    - Carona marcada como recorrente.  

- **Fluxo Principal:**  
    1. Durante a criação da carona, o motorista marca a opção “Recorrente”.  
    2. Passageiros interessados podem se inscrever em um padrão recorrente, com registro vinculado a *PassageiroRecorrencia* e status **AGUARDANDO** ou **CONFIRMADA** conforme aprovação automática ou manual.   
    3. Notificações são enviadas periodicamente, antes de cada ocorrência da carona.  

- **Fluxos Alternativos:**  
    - Caso o passageiro recuse qualquer recorrência, todas as seguintes serão canceladas também.  
    - A recorrência permanece **PENDENTE** até o dia da viagem, quando ocorre a confirmação final do passageiro.  

---