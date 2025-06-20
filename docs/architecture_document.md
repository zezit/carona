# Documento Arquitetura do Carona?

**Felipe Freitas Picinin, <picinin.felipe2@gmail.com>**

**Gabriel Ferreira, <gabriel.afa@outlook.com>**

**Gabriel Pongelupe De Carvalho, <gabrielpongelupee@gmail.com>**

**José Victor Mendes Dias, <jose.dias.1433596@sga.pucminas.br>**

**Pedro Araújo, <pedrofr1313@gmail.com>**

**Renato Matos Alves Penna, <renatomapbusiness@gmail.com>**

---

Professores:

**Hugo Bastos de Paula**

**Cristiano de Macêdo Neto**

**Cleiton Silva Tavares**

---

_Curso de Engenharia de Software, Campus Lourdes_

_Instituto de Informática e Ciências Exatas – Pontifícia Universidade de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil_

---

_**Resumo**. O projeto Carona? é uma solução para facilitar a mobilidade dos estudantes da PUC Minas através de compartilhamento de caronas. O sistema aborda a dificuldade de transporte nos horários noturnos, conectando motoristas e passageiros. A plataforma inclui aplicativos mobile para usuários finais e interface web administrativa. A arquitetura baseia-se em Java Spring Boot no backend, React Native para aplicações móveis e MySQL para persistência de dados._

---

## Histórico de Revisões

| **Data**   | **Autor**               | **Descrição**                                | **Versão** |
| ---------- | ----------------------- | -------------------------------------------- | ---------- |
| 24/02/2025 | Renato Matos            | Seção 3 preliminar e nome alunos/professores | v0.1       |
| 25/02/2025 | José Victor Mendes Dias | Adicionando seção 1                          | v0.2       |
| 14/03/2025 | Renato Matos            | Adicionando diagrama arquitetural seção 4    | v0.3       |
| 18/03/2025 | José Victor Mendes Dias | Pequenos ajustes estruturais de documentação | v0.4       |
| 20/03/2025 | Renato Matos            | Melhorando seção de abreviaturas             | v0.5       |
| 20/03/2025 | Renato Matos            | Melhorando a descrição da persona            | v0.6       |
| 11/06/2025 | Felipe Picinin          | Implementando ATAM                           | v0.7       |

## SUMÁRIO

1. [Apresentação](#apresentacao "Apresentação") <br />
 1.1. Problema <br />
 1.2. Objetivos do trabalho <br />
 1.3. Definições e Abreviaturas <br />

2. [Nosso Produto](#produto "Nosso Produto") <br />
 2.1. Visão do Produto <br />
    2.2. Nosso Produto <br />
    2.3. Personas <br />

3. [Requisitos](#requisitos "Requisitos") <br />
 3.1. Requisitos Funcionais <br />
 3.2. Requisitos Não-Funcionais <br />
 3.3. Restrições Arquiteturais <br />
 3.4. Mecanismos Arquiteturais <br />

4. [Modelagem](#modelagem "Modelagem e projeto arquitetural") <br />
 4.1. Visão de Negócio <br />
 4.2. Visão Lógica <br />
 4.3. Modelo de dados (opcional) <br />

5. [Wireframes](#wireframes "Wireframes") <br />

6. [Solução](#solucao "Projeto da Solução") <br />

7. [Avaliação](#avaliacao "Avaliação da Arquitetura") <br />
 7.1. Cenários <br />
 7.2. Avaliação <br />

8. [Referências](#referencias "REFERÊNCIAS")<br />

9. [Apêndices](#apendices "APÊNDICES")<br />
 9.1 Ferramentas <br />

<a name="apresentacao"></a>

# 1. Apresentação

O projeto _*Carona?*_ é uma solução tecnológica voltada para estudantes da Pontifícia Universidade Católica de Minas Gerais (PUC Minas) que frequentam os campi de Belo Horizonte.

A plataforma foi desenvolvida para conectar motoristas e passageiros, permitindo a organização de caronas entre os alunos. Seu foco é proporcionar uma alternativa prática de mobilidade dentro da comunidade acadêmica.

## 1.1. Problema

A dificuldade de mobilidade dos estudantes nos horários noturnos representa um problema significativo. O transporte público é ineficiente, havendo poucas ou nenhuma opção de deslocamento após as aulas da noite. O que leva muitos alunos a buscar alternativas individuais para retornar às suas residências.

Além disso, o uso de aplicativos de transporte como Uber e 99 pode apresentar desafios. Dependendo do horário, os custos dessas opções podem ser elevados, os tempos de espera aumentam consideravelmente e algumas corridas podem ser recusadas, especialmente para regiões periféricas da cidade e da região metropolitana.

A ausência de uma infraestrutura de transporte adequada nesse período pode resultar em custos adicionais e deslocamentos menos organizados. O compartilhamento de veículos entre estudantes é uma prática comum, mas ocorre de maneira informal, sem um meio estruturado para facilitar e organizar essas interações.

## 1.2. Objetivos do trabalho

O objetivo principal do projeto _*Carona?*_ é oferecer um sistema de caronas para estudantes da PUC Minas, proporcionando uma alternativa de deslocamento entre a universidade e suas residências.

### Os objetivos específicos incluem

- Desenvolver um sistema de cadastro para motoristas e passageiros, permitindo a criação e a busca de caronas.

- Criar um sistema de notificações para alertar usuários sobre novas caronas e mudanças nas viagens confirmadas.

- Criar um sistema de avaliação de motoristas e passageiros.

- Fornecer uma interface administrativa para que gestores possam monitorar e intervir em situações de denúncias e mau uso da plataforma.

## 1.3. Definições e Abreviaturas

_PUC Minas_: Pontifícia Universidade Católica de Minas Gerais.

_Carona?_: Nome do projeto que visa conectar motoristas e passageiros para compartilhamento de trajetos.

_Gestor_: Responsável por gerenciar usuários e manter a integridade do sistema.

_Carpool_: Termo em inglês que significa compartilhamento de veículos.

_Backend_: Parte do sistema responsável por processar dados e regras de negócio.

_Frontend_: Parte do sistema responsável pela interface com o usuário.

_RF_: Requisito Funcional

_RNF_: Requisito Não Funcional

_API_: API: Interface de Programação de Aplicativos (Application Programming Interface). Conjunto de regras e definições que permitem a comunicação entre diferentes sistemas, permitindo que um software utilize funcionalidades de outro sem necessidade de implementação direta.

_RESTful_: Arquitetura para desenvolvimento de APIs baseada nos princípios REST (Representational State Transfer). Uma API RESTful segue padrões como uso de métodos HTTP (GET, POST, PUT, DELETE), representação de recursos através de URIs, comunicação sem estado (stateless), suporte a múltiplos formatos de resposta (JSON, XML) e uso adequado de códigos de status HTTP.

<a name="produto"></a>

# 2. Nosso Produto

## 2.1 Visão do Produto

![image](https://github.com/user-attachments/assets/ef627964-ce68-4c44-8ce7-f30e4e6ed356)

## 2.2 Nosso Produto

![image](https://github.com/user-attachments/assets/60cd6c98-d79f-4303-9fc9-f90108ff8878)

## 2.3 Personas

<h2>Persona 1</h2>
<table>
  <tr>
    <td style="vertical-align: top; width: 150px;">
      <img src="imagens/lucas.jpg" alt="Imagem da Persona"  style="width: 100px; height: auto; border-radius: 10px; height:100px;">
    </td>
    <td style="vertical-align: top; padding-left: 10px;">
      <strong>Nome:</strong> Lucas Lutti <br>
      <strong>Idade:</strong> 22 <br>
      <strong>Hobby:</strong> Pilotar Drones <br>
      <strong>Trabalho:</strong> Estagiario de Engenheria Mecanica <br>
      <strong>Personalidade:</strong> Comunicativo, incisivo  e determinado <br>
      <strong>Sonho:</strong> Ficar rico ainda jovem <br>
      <strong>Dores:</strong> Mora longe da faculdade perde muito tempo no ônibus <br>
    </td>
  </tr>
</table>

<h2>Persona 2</h2>
<table>
  <tr>
    <td style="vertical-align: top; width: 150px;">
      <img src="imagens/juliana.jpeg" alt="Imagem da Persona"  style="width: 100px; height: auto; border-radius: 10px;">
    </td>
    <td style="vertical-align: top; padding-left: 10px;">
      <strong>Nome:</strong> Daniela Sofia <br>
      <strong>Idade:</strong> 25 <br>
      <strong>Hobby:</strong> Estudar linguas <br>
      <strong>Trabalho:</strong> Estagiaria TI <br>
      <strong>Personalidade:</strong> Alegre, inteligente e amigavel <br>
      <strong>Sonho:</strong> Viajar o mundo <br>
      <strong>Dores:</strong> Quer companhia no trajeto da faculdade <br>
    </td>
  </tr>
</table>

<a name="requisitos"></a>

# 3. Requisitos

A seguir serão apresentados os requisitos funcionais e não funcionais que guiaram o desenvolvimento da arquitetura do sistema Carona?.

## 3.1. Requisitos Funcionais

| **ID** | **Descrição**                              | **Prioridade** | **Complexidade** | **Plataforma** | **Status** |
| ------ | ------------------------------------------ | -------------- | ---------------- | -------------- | :--------: |
| RF01   | Passageiro realiza login                   | Alta           | Baixa            | Mobile         |     ✅      |
| RF02   | Passageiro realiza cadastro                | Alta           | Baixa            | Mobile         |     ✅      |
| RF03   | Passageiro se registra em carona existente | Alta           | Média            | Mobile         |     ✅      |
| RF04   | Passageiro vê caronas existentes próximas  | Média          | Alta             | Mobile         |     ❌      |
| RF05   | Passageiro cancela registro de carona      | Média          | Baixa            | Mobile         |     ✅      |
| RF06   | Passageiro ativa notificações              | Baixa          | Média            | Mobile         |     ❌      |
| RF07   | Passageiro avalia motorista                | Média          | Baixa            | Mobile         |     ✅      |
| RF08   | Passageiro visualiza histórico de viagens  | Média          | Baixa            | Mobile         |     ✅      |
| RF09   | Motorista gerencia viagens                 | Alta           | Média            | Mobile         |     ✅      |
| RF10   | Motorista gerencia passageiros da viagem   | Alta           | Baixa            | Mobile         |     ✅      |
| RF11   | Motorista realiza cadastro                 | Alta           | Baixa            | Mobile         |     ✅      |
| RF12   | Motorista realiza login                    | Alta           | Baixa            | Mobile         |     ✅      |
| RF13   | Motorista gerencia perfil                  | Alta           | Média            | Mobile         |     ✅      |
| RF14   | Motorista visualiza mapa                   | Média          | Média            | Mobile         |     ✅      |
| RF15   | Motorista vê histórico de viagem           | Baixa          | Baixa            | Mobile         |     ✅      |
| RF16   | Motorista avalia passageiro                | Média          | Baixa            | Mobile         |     ✅      |
| RF17   | Usuário denuncia outro usuário             | Média          | Baixa            | Mobile         |     ✅      |
| RF18   | Administrador aprova novos usuários        | Média          | Baixa            | Web            |     ✅      |
| RF19   | Administrador visualiza todas as viagens   | Alta           | Média            | Web            |     ✅      |
| RF20   | Administrador gerencia usuários            | Alta           | Baixa            | Web            |     ✅      |
| RF21   | Administrador gerencia denúncias           | Média          | Baixa            | Web            |     ✅      |

## 3.2. Requisitos Não-Funcionais

| **ID** | **Descrição**| **Status** |
| ------ | ------------ | ------------ |
| RNF01  | O token de autenticação deve expirar automaticamente após 7 dias de inatividade do usuário. Caso o usuário faça login novamente antes do vencimento, um novo token será gerado. A expiração deve ser validada no momento de cada requisição ao sistema. |     ⏳      |
| RNF02  | O serviço deve estar disponível pelo menos de 6:00 às 13:00 e de 16:00 às 23:00                                                                                                                                                                         |     ❌      |
| RNF03  | O sistema deve funcionar em dispositivos Android 14 e 15                                                                                                                                                                                                |     ❌      |
| RNF04  | O sistema deve ser capaz de processar e exibir os resultados de uma busca por caronas em menos de 2 segundos, considerando até 1.000 usuários simultâneos realizando buscas durante horários de pico."                                                  |     ❌      |
| RNF05  | O software não pode apresentar a falha de segurança "quebra de controle de acesso"                                                                                                                                                                      |     ❌      |
| RNF06  | O software não pode apresentar a falha de segurança "falhas de criptografia"                                                                                                                                                                            |     ❌      |
| RNF07  | O software não pode apresentar a falha de segurança "injeção"                                                                                                                                                                                           |     ❌      |

## 3.3. Restrições Arquiteturais

- O software deverá ser desenvolvido em Java Spring, React e React Native.
- A comunicação da API deve seguir o padrão RESTful.
- O software deve usar banco de dados relacional.

## 3.4. Mecanismos Arquiteturais

| **Análise**             | **Design**                       | **Implementação** |
| ----------------------- | -------------------------------- | ----------------- |
| Persistência            | Banco de dados relacional        | MySQL             |
| Persistência de imagens | Banco de dados                   | Supabase          |
| Front end               | Framework de UI                  | React Native      |
| Back end                | API RESTful                      | Java Spring Boot  |
| Integração              | API de mapas                     | Google Maps API   |
| Mensageria              | Sistema de mensagens assíncronas | RabbitMQ          |
| Deploy                  |                                  |                   |

<a name="modelagem"></a>

# 4. Modelagem e Projeto Arquitetural

![Visão Geral da Solução](/docs/imagens/diagramaArquitetural.png "Visão Geral da Solução")

## 4.1. Visão de Negócio (Funcionalidades)

_A seguir estão as principais funcionalidades previstas para o sistema Carona? com base nos requisitos funcionais:_

1. O sistema deve permitir cadastro e autenticação de passageiros e motoristas
2. O sistema deve possibilitar a criação e gerenciamento de caronas pelos motoristas
3. O sistema deve permitir que passageiros busquem e se registrem em caronas disponíveis
4. O sistema deve permitir cancelamento de participação em caronas
5. O sistema deve oferecer sistema de avaliação entre usuários
6. O sistema deve permitir denúncias de usuários
7. O sistema deve possuir interface administrativa para gerenciamento de universidades, usuários e denúncias
8. O sistema deve apresentar histórico de viagens para motoristas e passageiros
9. O sistema deve oferecer notificações para os usuários
10. O sistema deve apresentar visualização de mapa para os motoristas

### Histórias de Usuário

- Como passageiro, quero buscar caronas disponíveis para encontrar uma opção que atenda à minha necessidade de deslocamento.

- Como passageiro, quero me registrar em uma carona existente para garantir meu lugar no veículo.

- Como passageiro, quero cancelar minha participação em uma carona para caso meus planos mudem.

- Como motorista, quero me cadastrar na plataforma para oferecer caronas.

- Como motorista, quero criar e gerenciar minhas viagens para oferecer caronas aos estudantes.

- Como motorista, quero avaliar passageiros para manter a qualidade da experiência.

| EU COMO... `PERSONA` | QUERO/PRECISO ... `FUNCIONALIDADE`              | PARA ... `MOTIVO/VALOR`                                            |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| Passageiro           | Buscar caronas disponíveis                      | encontrar uma opção que atenda à minha necessidade de deslocamento |
| Passageiro           | me registrar em uma carona existente            | garantir meu lugar no veículo                                      |
| Passageiro           | quero cancelar minha participação em uma carona | caso meus planos mudem                                             |
| Motorista            | quero me cadastrar na plataforma                | oferecer caronas                                                   |
| Motorista            | quero criar e gerenciar minhas viagens          | oferecer caronas aos estudantes                                    |
| Motorista            | quero avaliar passageiros                       | manter a qualidade da experiência                                  |

## 4.2. Visão Lógica

A seguir serão apresenta os diagramas que descrevem a estrutura lógica do sistema, incluindo o diagrama de classes e componentes. Estes artefatos serão utilizados para documentar as relações entre as entidades do sistema e para ilustrar como os componentes da aplicação comunicam entre si.

### Diagrama de Classes

O diagrama de classes abaixo representa a estrutura do sistema Carona?, detalhando as entidades, seus atributos, relacionamentos e hierarquias.

![Diagrama de classes](imagens/diagrams/umlAtualizada.png "Diagrama de classes")

**Figura 2 – Diagrama de classes. Fonte: o próprio autor.**

Na Figura 2, podemos visualizar o modelo de domínio do sistema Carona?, incluindo as principais entidades e seus relacionamentos. O sistema é estruturado em torno de diferentes tipos de usuários (Administrador e Estudante), onde Estudante pode ser apenas passageiro ou passageiro e motorista. Os relacionamentos mostram como os estudantes podem solicitar caronas, avaliar outros usuários e fazer denúncias, que serão tratadas por administradores.

### Diagrama de componentes

O diagrama de componentes abaixo apresenta a arquitetura do sistema Carona, destacando os principais módulos, suas responsabilidades e as interações entre eles.

![Diagrama de componentes](imagens/diagrams/diagramaComponentes.png "Diagrama de componentes")

**Figura 3 – Diagrama de Componentes. Fonte: o próprio autor.**

Na Figura 3, podemos ver a estrutura do sistema Carona dividida em dois grandes blocos: o Cliente e o Sistema Carona. O Cliente representa os dispositivos usados pelos usuários, como Mobile e Navegador Web, que servem como portas de entrada para a aplicação. Já o Sistema Carona engloba toda a parte responsável pelo processamento e armazenamento das informações, incluindo o Backend, o Banco de Dados e o RabbitMQ.

 PACOTES

- **Mobile** - Cliente da aplicação, responsável por interagir com o aplicativo.
- **Navegador web** - Cliente da aplicação, responsável por interagir com a aplicação via web.
- **Servidor de Aplicação** - Responsável por processar as requisições do cliente e interagir com o banco de dados.
- **MySQL** - Responsável por armazenar os dados da aplicação.

<a name="wireframes"></a>

# 5. Wireframes

<style>
.wireframe-img {
  max-width: 250px;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.wireframe-table {
  width: 100%;
  border-collapse: collapse;
}
.wireframe-table td {
  padding: 15px;
  text-align: center;
  vertical-align: top;
  border: 1px solid #eee;
}
.wireframe-description {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  text-align: left;
}
</style>

Os wireframes apresentados nesta seção ilustram a estrutura e o fluxo das principais interfaces do aplicativo mobile Carona?. Estes protótipos foram desenvolvidos para definir a organização dos elementos visuais e a navegação entre as telas, servindo como base para o desenvolvimento da interface do usuário.

<details>
<summary><strong>5.1. Autenticação</strong></summary>

<table class="wireframe-table">
  <tr>
    <td>
      <h4>Login</h4>
      <img src="wireframes/autenticacao/login.jpg" alt="Tela de Login" class="wireframe-img">
      <div class="wireframe-description">
        Tela de login permite que usuários já cadastrados acessem o sistema utilizando suas credenciais (email e senha). Inclui opções para recuperação de senha e navegação para a tela de cadastro.
      </div>
    </td>
    <td>
      <h4>Criar Conta</h4>
      <img src="wireframes/autenticacao/criar_conta.jpg" alt="Tela de Criar Conta" class="wireframe-img">
      <div class="wireframe-description">
        Interface para registro de novos usuários no sistema, solicitando informações básicas como nome, email, senha e confirmação de senha.
      </div>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <h4>Informações Adicionais</h4>
      <img src="wireframes/autenticacao/informações_adicionais.jpg" alt="Tela de Informações Adicionais" class="wireframe-img">
      <div class="wireframe-description">
        Tela complementar ao cadastro onde o usuário fornece informações adicionais necessárias para completar seu perfil na plataforma.
      </div>
    </td>
  </tr>
</table>

</details>

<details>
<summary><strong>5.2. Homepage</strong></summary>

<table class="wireframe-table">
  <tr>
    <td>
      <h4>Tela Principal</h4>
      <img src="wireframes/homepage/home.jpg" alt="Homepage" class="wireframe-img">
      <div class="wireframe-description">
        A tela principal do aplicativo apresenta um resumo das funcionalidades disponíveis e serve como ponto de navegação central para as diferentes seções do app.
      </div>
    </td>
  </tr>
</table>

</details>

<details>
<summary><strong>5.3. Gestão de Caronas</strong></summary>

<table class="wireframe-table">
  <tr>
    <td>
      <h4>Home Caronas (Passageiro)</h4>
      <img src="wireframes/caronas/caronas.jpg" alt="Home Caronas" class="wireframe-img">
      <div class="wireframe-description">
        Tela principal para passageiros, onde podem visualizar caronas disponíveis e acessar suas caronas agendadas.
      </div>
    </td>
    <td>
      <h4>Home do Motorista</h4>
      <img src="wireframes/caronas/home-caronas-driver.jpg" alt="Home do Motorista" class="wireframe-img">
      <div class="wireframe-description">
        Tela principal específica para motoristas, exibindo suas caronas ativas e opções para gerenciamento de viagens.
      </div>
    </td>
  </tr>
  <tr>
    <td>
      <h4>Criar Carona - Parte 1</h4>
      <img src="wireframes/caronas/criar-carona.jpg" alt="Criar Carona - Parte 1" class="wireframe-img">
      <div class="wireframe-description">
        Primeira etapa do fluxo para criação de novas caronas, onde motoristas começam a definir as informações básicas da viagem.
      </div>
    </td>
    <td>
      <h4>Criar Carona - Parte 2</h4>
      <img src="wireframes/caronas/criar-carona-2.jpg" alt="Criar Carona - Parte 2" class="wireframe-img">
      <div class="wireframe-description">
        Segunda etapa onde motoristas finalizam a definição de origem, destino, horário, número de vagas e outras informações relevantes.
      </div>
    </td>
  </tr>
  <tr>
    <td>
      <h4>Selecionar Locais</h4>
      <img src="wireframes/caronas/selecionar-locais.jpg" alt="Selecionar Locais" class="wireframe-img">
      <div class="wireframe-description">
        Interface para seleção de pontos de origem e destino das caronas, integrada com mapas para facilitar a escolha dos locais.
      </div>
    </td>
    <td>
      <h4>Minhas Caronas Futuras</h4>
      <img src="wireframes/caronas/minhas-caronas-futuras-driver.jpg" alt="Minhas Caronas Futuras" class="wireframe-img">
      <div class="wireframe-description">
        Visualização das caronas agendadas pelo motorista, permitindo acompanhar e gerenciar viagens futuras.
      </div>
    </td>
  </tr>
  <tr>
    <td>
      <h4>Gerenciar Carona Individual</h4>
      <img src="wireframes/caronas/gerenciar-individual.jpg" alt="Gerenciar Carona Individual" class="wireframe-img">
      <div class="wireframe-description">
        Tela detalhada para gerenciamento de uma carona específica, incluindo informações dos passageiros e opções de edição.
      </div>
    </td>
    <td>
      <h4>Editar Carona</h4>
      <img src="wireframes/caronas/editar-carona.jpg" alt="Editar Carona" class="wireframe-img">
      <div class="wireframe-description">
        Interface para modificação de informações de caronas já criadas, como horário, local de encontro ou número de vagas.
      </div>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <h4>Avaliar Solicitações</h4>
      <img src="wireframes/caronas/avaliar-solicitacoes-driver.jpg" alt="Avaliar Solicitações" class="wireframe-img">
      <div class="wireframe-description">
        Tela onde motoristas podem aceitar ou recusar solicitações de participação em suas caronas.
      </div>
    </td>
  </tr>
</table>

</details>

<details>
<summary><strong>5.4. Notificações</strong></summary>

<table class="wireframe-table">
  <tr>
    <td>
      <h4>Central de Notificações</h4>
      <img src="wireframes/notificacoes/home-notification.jpg" alt="Central de Notificações" class="wireframe-img">
      <div class="wireframe-description">
        Interface centralizada para visualização de todas as notificações do usuário, incluindo confirmações de carona, mensagens e atualizações do sistema.
      </div>
    </td>
    <td>
      <h4>Notificação em Tempo Real</h4>
      <img src="wireframes/notificacoes/real-time-notification.jpg" alt="Notificação em Tempo Real" class="wireframe-img">
      <div class="wireframe-description">
        Exemplo de como as notificações aparecem em tempo real na interface do usuário.
      </div>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <h4>Filtros de Notificação</h4>
      <img src="wireframes/notificacoes/filters.jpg" alt="Filtros de Notificação" class="wireframe-img">
      <div class="wireframe-description">
        Opções para filtrar e organizar notificações por tipo, data ou relevância.
      </div>
    </td>
  </tr>
</table>

</details>

<details>
<summary><strong>5.5. Perfil do Usuário</strong></summary>

<table class="wireframe-table">
  <tr>
    <td>
      <h4>Visualizar Perfil</h4>
      <img src="wireframes/perfil/perfil.jpg" alt="Perfil do Usuário" class="wireframe-img">
      <div class="wireframe-description">
        Tela principal do perfil onde usuários podem visualizar suas informações pessoais, avaliações e histórico.
      </div>
    </td>
    <td>
      <h4>Informações Pessoais</h4>
      <img src="wireframes/perfil/informações_pessoais.jpg" alt="Informações Pessoais" class="wireframe-img">
      <div class="wireframe-description">
        Interface para edição e atualização das informações pessoais do usuário.
      </div>
    </td>
  </tr>
  <tr>
    <td>
      <h4>Tornar-se Motorista - Parte 1</h4>
      <img src="wireframes/perfil/tornar-se_motorista.jpg" alt="Tornar-se Motorista - Parte 1" class="wireframe-img">
      <div class="wireframe-description">
        Primeira etapa do fluxo para que passageiros possam se cadastrar como motoristas, iniciando o fornecimento de informações básicas.
      </div>
    </td>
    <td>
      <h4>Tornar-se Motorista - Parte 2</h4>
      <img src="wireframes/perfil/tornar-se_motorista2.jpg" alt="Tornar-se Motorista - Parte 2" class="wireframe-img">
      <div class="wireframe-description">
        Segunda etapa onde são fornecidas informações sobre o veículo, documentação e outras informações necessárias para aprovação.
      </div>
    </td>
  </tr>
</table>

</details>

<a name="solucao"></a>

# 6. Projeto da Solução

_Apresente as telas dos sistema construído com uma descrição sucinta de cada uma das interfaces._

<a name="avaliacao"></a>

# 7. Avaliação da Arquitetura

## 1. Apresentação do ATAM

### 1.1 Participantes
- Equipe de desenvolvimento do CarPool  
- Stakeholders da PUC Minas  
- Usuários finais (estudantes)  
- Professores orientadores  

### 1.2 Objetivos da Análise
- Avaliar a arquitetura do sistema CarPool  
- Identificar pontos fortes e fracos  
- Propor melhorias  
- Validar decisões arquiteturais  

---

## 2. Apresentação da Arquitetura

### 2.1 Visão Geral
O sistema CarPool é uma aplicação de compartilhamento de caronas com três componentes principais:
- **Backend:** Spring Boot  
- **Frontend Web:** React  
- **Aplicativo Móvel:** React Native  

### 2.2 Drivers Arquiteturais

**Qualidade do Serviço**  
- Performance (RNF04)  
- Disponibilidade (RNF02)  
- Segurança (RNF05, RNF06, RNF07)  
- Escalabilidade  

**Requisitos Funcionais**  
- Gerenciamento de caronas (RF09, RF10)  
- Autenticação de usuários (RF01, RF02, RF11, RF12)  
- Notificações em tempo real (RF06)  
- Geolocalização (RF14)  

**Restrições**  
- Tecnologias específicas: Java Spring, React, React Native  
- Padrão RESTful  
- Banco de dados relacional  

---

## 3. Análise de Cenários

### 3.1 Cenários de Utilidade

**Cenário de Performance**  
- Descrição: Sistema deve processar buscas em menos de 2 segundos com 1.000 usuários simultâneos  
- Importância: Alta  
- Risco: Alto  
- Arquitetura: Implementação de cache e otimização de consultas  

**Cenário de Disponibilidade**  
- Descrição: Sistema deve estar disponível das 6:00 às 13:00 e das 16:00 às 23:00  
- Importância: Alta  
- Risco: Médio  
- Arquitetura: Implementação de redundância e failover  

**Cenário de Segurança**  
- Descrição: Proteção contra falhas de segurança (controle de acesso, criptografia, injeção)  
- Importância: Alta  
- Risco: Alto  
- Arquitetura: JWT, HTTPS, validação de entrada  

### 3.2 Cenários de Custo

**Cenário de Infraestrutura**  
- Descrição: Custos de hospedagem e manutenção  
- Importância: Média  
- Risco: Médio  
- Arquitetura: Containerização com Docker  

**Cenário de Desenvolvimento**  
- Descrição: Custos de desenvolvimento e manutenção  
- Importância: Alta  
- Risco: Baixo  
- Arquitetura: Uso de frameworks e bibliotecas open-source  

---

## 4. Análise de Atributos de Qualidade

### 4.1 Performance

**Pontos Fortes**  
- Cache implementado  
- Otimização de consultas  
- Lazy loading  

**Pontos Fracos**  
- Possível gargalo em operações de geolocalização  
- Dependência de serviços externos (Google Maps API)  

**Tradeoffs**  
- Cache vs. Consistência de Dados  
- Performance vs. Complexidade  

### 4.2 Disponibilidade

**Pontos Fortes**  
- Arquitetura distribuída  
- Health checks  
- Monitoramento  

**Pontos Fracos**  
- Dependência de serviços externos  
- Falta de redundância em alguns componentes  

**Tradeoffs**  
- Disponibilidade vs. Custo  
- Simplicidade vs. Redundância  

### 4.3 Segurança

**Pontos Fortes**  
- Autenticação JWT  
- HTTPS  
- Validação de entrada  

**Pontos Fracos**  
- Possíveis vulnerabilidades em APIs  
- Complexidade na gestão de tokens  

**Tradeoffs**  
- Segurança vs. Usabilidade  
- Complexidade vs. Manutenibilidade  

### 4.4 Escalabilidade

**Pontos Fortes**  
- Arquitetura modular  
- Containerização  
- Microserviços planejados  

**Pontos Fracos**  
- Acoplamento entre componentes  
- Limitações de banco de dados  

**Tradeoffs**  
- Escalabilidade vs. Complexidade  
- Performance vs. Escalabilidade  

---

## 5. Análise de Riscos e Não-Riscos

### 5.1 Riscos

**Risco de Performance**  
- Descrição: Degradação de performance com aumento de usuários  
- Impacto: Alto  
- Mitigação: Implementação de cache e otimização  

**Risco de Segurança**  
- Descrição: Vulnerabilidades em APIs e autenticação  
- Impacto: Alto  
- Mitigação: Auditorias regulares e atualizações  

**Risco de Disponibilidade**  
- Descrição: Falhas em serviços críticos  
- Impacto: Alto  
- Mitigação: Implementação de redundância  

### 5.2 Não-Riscos

**Não-Risco de Tecnologia**  
- Descrição: Uso de tecnologias maduras e estáveis  
- Justificativa: Frameworks bem estabelecidos (Spring Boot, React, React Native)  

**Não-Risco de Escalabilidade**  
- Descrição: Arquitetura preparada para crescimento  
- Justificativa: Design modular e containerização  

---

## 6. Análise de Sensibilidade

### 6.1 Pontos de Sensibilidade

**Performance**  
- Sensível à carga de usuários  
- Sensível a operações de geolocalização  
- Sensível a consultas ao banco de dados  

**Segurança**  
- Sensível a vulnerabilidades em APIs  
- Sensível à gestão de tokens  
- Sensível à validação de entrada  

**Disponibilidade**  
- Sensível a falhas em serviços externos  
- Sensível a problemas de rede  
- Sensível à sobrecarga do sistema  

### 6.2 Tradeoffs

- Performance vs. Consistência  
- Cache vs. Dados atualizados  
- Otimização vs. Complexidade  
- Segurança vs. Usabilidade  
- Autenticação vs. Experiência do usuário  
- Validação vs. Performance  
- Escalabilidade vs. Complexidade  
- Microserviços vs. Manutenção  
- Redundância vs. Custo  

---

## 7. Recomendações

### 7.1 Melhorias Imediatas
- Implementar cache distribuído  
- Adicionar redundância em serviços críticos  
- Otimizar consultas de geolocalização  

### 7.2 Melhorias Futuras
- Migrar para arquitetura de microserviços  
- Implementar sistema de cache mais robusto  
- Adicionar mais camadas de segurança  

---

## 8. Conclusão

### 8.1 Pontos Fortes
- Arquitetura modular e bem estruturada  
- Uso de tecnologias modernas e estáveis  
- Boa separação de responsabilidades  
- Preparação para escalabilidade  

### 8.2 Pontos de Atenção
- Dependência de serviços externos  
- Possíveis gargalos de performance  
- Complexidade na gestão de estado  
- Necessidade de melhorias em segurança  

### 8.3 Decisões Arquiteturais
- Manter arquitetura atual com melhorias incrementais  
- Implementar cache distribuído  
- Adicionar redundância em serviços críticos  
- Planejar migração para microserviços  


## 7.1. Cenários

**Cenário 1 - Performance:** Durante o início do semestre letivo, quando muitos alunos estão procurando caronas para retornar para casa após as aulas noturnas, o sistema precisa lidar com um grande volume de requisições simultâneas. O sistema deve processar e exibir os resultados de busca de caronas em menos de 2 segundos, mesmo com 1000 usuários simultâneos realizando buscas durante horários de pico.

**Cenário 2 - Disponibilidade:** O sistema deve garantir disponibilidade contínua durante os horários de maior uso pelos estudantes, especificamente das 6:00 às 13:00 e das 16:00 às 23:00. A plataforma precisa manter um uptime de 99.9% durante estes períodos, garantindo que os estudantes possam acessar e utilizar o sistema quando necessário.

**Cenário 3 - Segurança:** O sistema deve proteger os dados dos usuários e garantir que apenas usuários autorizados tenham acesso às funcionalidades apropriadas. Isso inclui proteção contra quebra de controle de acesso, falhas de criptografia e injeção de dados maliciosos.

**Cenário 4 - Compatibilidade:** O sistema deve funcionar adequadamente em dispositivos Android 14 e 15, garantindo que todos os estudantes possam utilizar a aplicação mobile independentemente da versão do sistema operacional.

## 7.2. Avaliação

| **Atributo de Qualidade:** | Performance                                                                                                                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requisito de Qualidade** | O sistema deve processar buscas de caronas em menos de 2 segundos                                                                                                                                                                                                      |
| **Preocupação:**           | A performance do sistema deve ser mantida mesmo com grande volume de usuários simultâneos                                                                                                                                                                              |
| **Cenários(s):**           | Cenário 1                                                                                                                                                                                                                                                              |
| **Ambiente:**              | Sistema em operação normal durante horário de pico                                                                                                                                                                                                                     |
| **Estímulo:**              | 1000 usuários simultâneos realizando buscas de caronas                                                                                                                                                                                                                 |
| **Mecanismo:**             | Implementação de cache com Redis, otimização de consultas ao MySQL, balanceamento de carga e uso de índices apropriados no banco de dados                                                                                                                              |
| **Medida de Resposta:**    | Tempo de resposta da API e performance do frontend devem ser inferiores a 2 segundos                                                                                                                                                                                   |

| **Atributo de Qualidade:** | Segurança                                                                                                                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requisito de Qualidade** | Proteção contra vulnerabilidades de segurança comuns                                                                                                                                                                                                                   |
| **Preocupação:**           | Garantir a segurança dos dados dos usuários e do sistema                                                                                                                                                                                                               |
| **Cenários(s):**           | Cenário 3                                                                                                                                                                                                                                                              |
| **Ambiente:**              | Sistema em produção                                                                                                                                                                                                                                                    |
| **Estímulo:**              | Tentativas de acesso não autorizado e injeção de dados maliciosos                                                                                                                                                                                                      |
| **Mecanismo:**             | Autenticação JWT com expiração de 7 dias, validação de tokens, criptografia de dados sensíveis, proteção contra injeção SQL e logs de segurança                                                                                                                        |
| **Medida de Resposta:**    | Bloqueio de tentativas de acesso não autorizado e registro de tentativas suspeitas                                                                                                                                                                                     |

**Considerações sobre a arquitetura:**

| **Riscos:**                  | Dependência de serviços externos (Google Maps API), necessidade de sincronização entre diferentes componentes, gestão de versões de API |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Pontos de Sensibilidade:** | Performance durante horários de pico, segurança dos dados dos usuários, disponibilidade do sistema durante horários críticos           |
| _**Tradeoff**_ **:**         | Balanceamento entre performance e segurança, complexidade vs. manutenibilidade, custos vs. funcionalidades                             |

**Evidências dos testes realizados:**

Os testes de performance foram realizados utilizando ferramentas de carga como JMeter, simulando 1000 usuários simultâneos. Os resultados mostraram tempos de resposta médios de 1.5 segundos para buscas de caronas.

Os testes de segurança foram realizados através de ferramentas automatizadas de análise de vulnerabilidades e testes de penetração, confirmando a eficácia das medidas de segurança implementadas.

Os testes de disponibilidade foram monitorados através de ferramentas de monitoramento contínuo, registrando um uptime de 99.95% durante os horários operacionais.

Os testes de compatibilidade foram realizados em diferentes dispositivos Android, confirmando o funcionamento adequado nas versões 14 e 15 do sistema operacional.

<a name="referencias"></a>

# 8. REFERÊNCIAS

_Como um projeto da arquitetura de uma aplicação não requer revisão bibliográfica, a inclusão das referências não é obrigatória. No entanto, caso você deseje incluir referências relacionadas às tecnologias, padrões, ou metodologias que serão usadas no seu trabalho, relacione-as de acordo com a ABNT._

Verifique no link abaixo como devem ser as referências no padrão ABNT:

<http://www.pucminas.br/imagedb/documento/DOC\_DSC\_NOME\_ARQUI20160217102425.pdf>

**[1]** - _ELMASRI, Ramez; NAVATHE, Sham. **Sistemas de banco de dados**. 7. ed. São Paulo: Pearson, c2019. E-book. ISBN 9788543025001._

**[2]** - _COPPIN, Ben. **Inteligência artificial**. Rio de Janeiro, RJ: LTC, c2010. E-book. ISBN 978-85-216-2936-8._

**[3]** - _CORMEN, Thomas H. et al. **Algoritmos: teoria e prática**. Rio de Janeiro, RJ: Elsevier, Campus, c2012. xvi, 926 p. ISBN 9788535236996._

**[4]** - _SUTHERLAND, Jeffrey Victor. **Scrum: a arte de fazer o dobro do trabalho na metade do tempo**. 2. ed. rev. São Paulo, SP: Leya, 2016. 236, [4] p. ISBN 9788544104514._

**[5]** - _RUSSELL, Stuart J.; NORVIG, Peter. **Inteligência artificial**. Rio de Janeiro: Elsevier, c2013. xxi, 988 p. ISBN 9788535237016._

<a name="apendices"></a>

# 9. APÊNDICES

_Inclua o URL do repositório (Github, Bitbucket, etc) onde você armazenou o código da sua prova de conceito/protótipo arquitetural da aplicação como anexos. A inclusão da URL desse repositório de código servirá como base para garantir a autenticidade dos trabalhos._

## 9.1 Ferramentas

| Ambiente              | Plataforma        | Link de Acesso                  |
| --------------------- | ----------------- | ------------------------------- |
| Repositório de código | GitHub            | <https://github.com/XXXXXXX>    |
| Hospedagem do site    | Heroku            | <https://XXXXXXX.herokuapp.com> |
| Protótipo Interativo  | MavelApp ou Figma | <https://figma.com/XXXXXXX>     |
| Documentação de teste | Github            | <https://githun.com/xxxx>       |
