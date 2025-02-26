# TITULO DO PROJETO


**Renato Matos Alves Penna, renatomapbusiness@gmail.com**

**Felipe Freitas Picinin, picinin.felipe2@gmail.com**

**Gabriel Pongelupe De Carvalho, gabrielpongelupee@gmail.com**

**Gabriel Ferreira, gabriel.afa@outlook.com**

**Pedro Araújo, pedrofr1313@gmail.com**

**Renato Cazzoletti, renato.cazzoletti7@gmail.com**

**José Victor Mendes Dias,  jose.dias.1433596@sga.pucminas.br**

---

Professores:

**Hugo Bastos de Paula**

**Cristiano de Macêdo Neto**

**Cleiton Silva Tavares**

---

_Curso de Engenharia de Software, Campus Lourdes_

_Instituto de Informática e Ciências Exatas – Pontifícia Universidade de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil_

---

_**Resumo**. Escrever aqui o resumo. O resumo deve contextualizar rapidamente o trabalho, descrever seu objetivo e, ao final, 
mostrar algum resultado relevante do trabalho (até 10 linhas)._

---

## Histórico de Revisões

| **Data**         | **Autor**               | **Descrição**                                                                                               | **Versão** |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- | ---------- |
| **[dd/mm/aaaa]** | [Nome do autor]         | [Descrever as principais alterações realizadas no documento, evidenciando as seções ou capítulos alterados] | [X]        |
| 24/02/2025       | Renato Matos            | Seção 3 preliminar e nome alunos/professores                                                                | v0.1       |
| 25/02/2025       | José Victor Mendes Dias | Adicionando seção 1                                                                                         | v0.2       |

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

O objetivo principal do projeto _*Carona?*_ é oferecer um sistema de caronas estruturado para estudantes da PUC Minas, proporcionando uma alternativa viável de deslocamento entre a universidade e suas residências.

### Os objetivos específicos incluem:

- Desenvolver um sistema de cadastro para motoristas e passageiros, permitindo a criação e a busca de caronas.

- Criar um sistema de notificações para alertar usuários sobre novas caronas e mudanças nas viagens confirmadas.

- Criar um sistema de avaliação de motoristas e passageiros.

- Fornecer uma interface administrativa para que gestores possam monitorar e intervir em situações de denúncias e mau uso da plataforma.

## 1.3. Definições e Abreviaturas

*PUC Minas*: Pontifícia Universidade Católica de Minas Gerais.

*Carona?*: Nome do projeto que visa conectar motoristas e passageiros para compartilhamento de trajetos de forma segura e eficiente.

*Gestor*: Responsável por gerenciar usuários e manter a integridade do sistema.

<a name="produto"></a>
# 2. Nosso Produto

_Estão seçaõ explora um pouco mais o produto a ser desenvolvido_

## 2.1 Visão do Produto
![image](https://github.com/user-attachments/assets/ef627964-ce68-4c44-8ce7-f30e4e6ed356)


## 2.2 Nosso Produto
![image](https://github.com/user-attachments/assets/60cd6c98-d79f-4303-9fc9-f90108ff8878)


## 2.3 Personas
<h2>Persona 1</h2>
<table>
  <tr>
    <td style="vertical-align: top; width: 150px;">
      <img src="imagens/persona.jpg" alt="Imagem da Persona"  style="width: 100px; height: auto; border-radius: 10px;">
    </td>
    <td style="vertical-align: top; padding-left: 10px;">
      <strong>Nome:</strong> Lucas Lutti <br>
      <strong>Idade:</strong> 22 <br>
      <strong>Hobby:</strong> Pilotar Drones <br>
      <strong>Trabalho:</strong> Estagiario de Engenheria Mecanica <br>
      <strong>Personalidade:</strong> Comunicativo, incisivo  e determinado <br>
      <strong>Sonho:</strong> Ficar rico ainda jovem <br>
      <strong>Dores:</strong> Mora longe da faculdade perde muito tempo no translado <br>
    </td>
  </tr>
</table>

<h2>Persona 2</h2>
<table>
  <tr>
    <td style="vertical-align: top; width: 150px;">
      <img src="imagens/persona.jpg" alt="Imagem da Persona"  style="width: 100px; height: auto; border-radius: 10px;">
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

_Esta seção descreve os requisitos comtemplados nesta descrição arquitetural, divididos em dois grupos: funcionais e não funcionais._

## 3.1. Requisitos Funcionais

_Enumere os requisitos funcionais previstos para a sua aplicação. Concentre-se nos requisitos funcionais que sejam críticos para a definição arquitetural. Lembre-se de listar todos os requisitos que são necessários para garantir cobertura arquitetural. Esta seção deve conter uma lista de requisitos ainda sem modelagem. Na coluna Prioridade utilize uma escala (do mais prioritário para o menos): Essencial, Desejável, Opcional._

| **ID** | **Descrição** | **Prioridade** | **Complexidade** | **Plataforma** | **Sprint** |
| --- | --- | --- | --- | --- | --- |
| R01 | Passageiro realiza login | Alta | Baixa | Mobile |  |
| R02 | Passageiro realiza cadastro | Alta | Baixa | Mobile |  |
| R03 | Passageiro se registra em carona existente | Alta | Média | Mobile |  |
| R04 | Passageiro vê caronas existentes próximas | Média | Alta | Mobile |  |
| R05 | Passageiro cancela registro de carona | Média | Baixa | Mobile |  |
| R06 | Passageiro ativa notificações | Baixa | Média | Mobile |  |
| R07 | Passageiro avalia motorista | Média | Baixa | Mobile |  |
| R08 | Passageiro visualiza histórico de viagens | Média | Baixa | Mobile |  |
| R09 | Motorista gerencia viagens | Alta | Média | Mobile |  |
| R10 | Motorista gerencia passageiros da viagem | Alta | Baixa | Mobile |  |
| R11 | Motorista realiza cadastro | Alta | Baixa | Mobile |  |
| R12 | Motorista realiza login | Alta | Baixa | Mobile |  |
| R13 | Motorista gerencia perfil | Alta | Média | Mobile |  |
| R14 | Motorista visualiza mapa | Média | Média | Mobile |  |
| R15 | Motorista vê histórico de viagem | Baixa | Baixa | Mobile |  |
| R16 | Motorista avalia passageiro | Média | Baixa | Mobile |  |
| R17 | Usuário denuncia outro usuário | Média | Baixa | Mobile |  |
| R18 | Administrador aprova novos usuários | Média | Baixa | Web |  |
| R19 | Administrador gerencia universidade | Alta | Média | Web |  |
| R20 | Administrador visualiza todas as viagens | Alta | Média | Web |  |
| R21 | Administrador gerencia usuários | Alta | Baixa | Web |  |
| R22 | Administrador gerencia denúncias | Média | Baixa | Web |  |

Obs: acrescente mais linhas, se necessário.

## 3.2. Requisitos Não-Funcionais

_Enumere os requisitos não-funcionais previstos para a sua aplicação. Entre os requisitos não funcionais, inclua todos os requisitos que julgar importante do ponto de vista arquitetural ou seja os requisitos que terão impacto na definição da arquitetura. Os requisitos devem ser descritos de forma completa e preferencialmente quantitativa._

| **ID** | **Descrição** |
| --- | --- |
| RNF01 | Os requisitos não-funcionais devem ser testáveis e descritos de forma mensurável |
| RNF02 | O serviço deve estar disponível pelo menos de 6:00 às 13:00 e de 16:00 às 23:00 |
| RNF03 | O sistema deve funcionar em dispositivos Android 14 e 15 |
| RNF04 | O serviço deve estar em conformidade com as leis de proteção de dados (LGPD) |


## 3.3. Restrições Arquiteturais

_Enumere as restrições arquiteturais. Lembre-se de que as restrições arquiteturais geralmente não são consideradas requisitos uma vez que limitam a solução candidata. Os requisitos não impõem restrição, mas precisam ser satisfeitos._

- O software deverá ser desenvolvido em Java Spring e React Native.
- A comunicação da API deve seguir o padrão RESTful.
- O software deve usar banco de dados relacional.

## 3.4. Mecanismos Arquiteturais

_Visão geral dos mecanismos que compõem a arquitetura do sosftware baseando-se em três estados: (1) análise, (2) design e (3) implementação. Em termos de Análise devem ser listados os aspectos gerais que compõem a arquitetura do software como: persistência, integração com sistemas legados, geração de logs do sistema, ambiente de front end, tratamento de exceções, formato dos testes, formato de distribuição/implantação (deploy), entre outros. Em Design deve-se identificar o padrão tecnológico a seguir para cada mecanismo identificado na análise. Em Implementação, deve-se identificar o produto a ser utilizado na solução.
 Ex: Análise (Persistência), Design (ORM), Implementação (Hibernate)._

| **Análise** | **Design** | **Implementação** |
| --- | --- | --- |
| Persistência | Banco de dados relacional | PostgreSQL |
| Front end | Framework de UI | React Native |
| Back end | API RESTful | Java Spring Boot |
| Integração | API de mapas | Google Maps API |
| Log do sistema | | |
| Teste de Software | | |
| Deploy | | |

<a name="modelagem"></a>
# 4. Modelagem e Projeto Arquitetural

_Apresente uma visão geral da solução proposta para o projeto e explique brevemente esse diagrama de visão geral, de forma textual. Esse diagrama não precisa seguir os padrões da UML, e deve ser completo e tão simples quanto possível, apresentando a macroarquitetura da solução._

![Visão Geral da Solução](imagens/visao.png "Visão Geral da Solução")

**Figura 1 - Visão Geral da Solução (fonte: https://medium.com)**

Obs: substitua esta imagem por outra, adequada ao seu projeto (cada arquitetura é única).

## 4.1. Visão de Negócio (Funcionalidades)

_Apresente uma lista simples com as funcionalidades previstas no projeto (escopo do produto)._

1. O sistema deve...
2. O sistema deve...
3. ...

Obs: a quantidade e o escopo das funcionalidades deve ser negociado com os professores/orientadores do trabalho.

### Histórias de Usuário

_Nesta seção, você deve descrever estórias de usuários seguindo os métodos ágeis. Lembre-se das características de qualidade das estórias de usuários, ou seja, o que é preciso para descrever boas histórias de usuários._

Exemplos de Histórias de Usuário:

- Como Fulano eu quero poder convidar meus amigos para que a gente possa se reunir...

- Como Cicrano eu quero poder organizar minhas tarefas diárias, para que...

- Como gerente eu quero conseguir entender o progresso do trabalho do meu time, para que eu possa ter relatórios periódicos dos nossos acertos e falhas.

|EU COMO... `PERSONA`| QUERO/PRECISO ... `FUNCIONALIDADE` |PARA ... `MOTIVO/VALOR`                 |
|--------------------|------------------------------------|----------------------------------------|
|Usuário do sistema  | Registrar minhas tarefas           | Não esquecer de fazê-las               |
|Administrador       | Alterar permissões                 | Permitir que possam administrar contas |

## 4.2. Visão Lógica

_Apresente os artefatos que serão utilizados descrevendo em linhas gerais as motivações que levaram a equipe a utilizar estes diagramas._

### Diagrama de Classes

![Diagrama de classes](imagens/classes.gif "Diagrama de classes")


**Figura 2 – Diagrama de classes (exemplo). Fonte: o próprio autor.**

Obs: Acrescente uma breve descrição sobre o diagrama apresentado na Figura 3.

### Diagrama de componentes

_Apresente o diagrama de componentes da aplicação, indicando, os elementos da arquitetura e as interfaces entre eles. Liste os estilos/padrões arquiteturais utilizados e faça uma descrição sucinta dos componentes indicando o papel de cada um deles dentro da arquitetura/estilo/padrão arquitetural. Indique também quais componentes serão reutilizados (navegadores, SGBDs, middlewares, etc), quais componentes serão adquiridos por serem proprietários e quais componentes precisam ser desenvolvidos._

![Diagrama de componentes](imagens/componentes.png "Diagrama de componentes")

**Figura 3 – Diagrama de Componentes (exemplo). Fonte: o próprio autor.**

_Apresente uma descrição detalhada dos artefatos que constituem o diagrama de implantação._

Ex: conforme diagrama apresentado na Figura X, as entidades participantes da solução são:

- **Componente 1** - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nunc magna, accumsan eget porta a, tincidunt sed mauris. Suspendisse orci nulla, sagittis a lorem laoreet, tincidunt imperdiet ipsum. Morbi malesuada pretium suscipit.
- **Componente 2** - Praesent nec nisi hendrerit, ullamcorper tortor non, rutrum sem. In non lectus tortor. Nulla vel tincidunt eros.

## 4.3. Modelo de dados (opcional)

_Caso julgue necessário para explicar a arquitetura, apresente o diagrama de classes ou diagrama de Entidade/Relacionamentos ou tabelas do banco de dados. Este modelo pode ser essencial caso a arquitetura utilize uma solução de banco de dados distribuídos ou um banco NoSQL._

![Diagrama de Entidade Relacionamento (ER) ](imagens/der.png "Diagrama de Entidade Relacionamento (ER) ")

**Figura 4 – Diagrama de Entidade Relacionamento (ER) - exemplo. Fonte: o próprio autor.**

Obs: Acrescente uma breve descrição sobre o diagrama apresentado na Figura 3.

<a name="wireframes"></a>
# 5. Wireframes

> Wireframes são protótipos das telas da aplicação usados em design de interface para sugerir a
> estrutura de um site web e seu relacionamentos entre suas
> páginas. Um wireframe web é uma ilustração semelhante ao
> layout de elementos fundamentais na interface.

<a name="solucao"></a>
# 6. Projeto da Solução

_Apresente as telas dos sistema construído com uma descrição sucinta de cada uma das interfaces._

<a name="avaliacao"></a>
# 7. Avaliação da Arquitetura

_Esta seção descreve a avaliação da arquitetura apresentada, baseada no método ATAM._

## 7.1. Cenários

_Apresente os cenários de testes utilizados na realização dos testes da sua aplicação. Escolha cenários de testes que demonstrem os requisitos não funcionais sendo satisfeitos. Os requisitos a seguir são apenas exemplos de possíveis requisitos, devendo ser revistos, adequados a cada projeto e complementados de forma a terem uma especificação completa e auto-explicativa._

**Cenário 1 - Acessibilidade:** Suspendisse consequat consectetur velit. Sed sem risus, dictum dictum facilisis vitae, commodo quis leo. Vivamus nulla sem, cursus a mollis quis, interdum at nulla. Nullam dictum congue mauris. Praesent nec nisi hendrerit, ullamcorper tortor non, rutrum sem. In non lectus tortor. Nulla vel tincidunt eros.

**Cenário 2 - Interoperabilidade:** Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Fusce ut accumsan erat. Pellentesque in enim tempus, iaculis sem in, semper arcu.

**Cenário 3 - Manutenibilidade:** Phasellus magna tellus, consectetur quis scelerisque eget, ultricies eu ligula. Sed rhoncus fermentum nisi, a ullamcorper leo fringilla id. Nulla lacinia sem vel magna ornare, non tincidunt ipsum rhoncus. Nam euismod semper ante id tristique. Mauris vel elit augue.

**Cenário 4 - Segurança:** Suspendisse consectetur porta tortor non convallis. Sed lobortis erat sed dignissim dignissim. Nunc eleifend elit et aliquet imperdiet. Ut eu quam at lacus tincidunt fringilla eget maximus metus. Praesent finibus, sapien eget molestie porta, neque turpis congue risus, vel porttitor sapien tortor ac nulla. Aliquam erat volutpat.

## 7.2. Avaliação

_Apresente as medidas registradas na coleta de dados. O que não for possível quantificar apresente uma justificativa baseada em evidências qualitativas que suportam o atendimento do requisito não-funcional. Apresente uma avaliação geral da arquitetura indicando os pontos fortes e as limitações da arquitetura proposta._

| **Atributo de Qualidade:** | Segurança |
| --- | --- |
| **Requisito de Qualidade** | Acesso aos recursos restritos deve ser controlado |
| **Preocupação:** | Os acessos de usuários devem ser controlados de forma que cada um tenha acesso apenas aos recursos condizentes as suas credenciais. |
| **Cenários(s):** | Cenário 4 |
| **Ambiente:** | Sistema em operação normal |
| **Estímulo:** | Acesso do administrador do sistema as funcionalidades de cadastro de novos produtos e exclusão de produtos. |
| **Mecanismo:** | O servidor de aplicação (Rails) gera um _token_ de acesso para o usuário que se autentica no sistema. Este _token_ é transferido para a camada de visualização (Angular) após a autenticação e o tratamento visual das funcionalidades podem ser tratados neste nível. |
| **Medida de Resposta:** | As áreas restritas do sistema devem ser disponibilizadas apenas quando há o acesso de usuários credenciados. |

**Considerações sobre a arquitetura:**

| **Riscos:** | Não existe |
| --- | --- |
| **Pontos de Sensibilidade:** | Não existe |
| _ **Tradeoff** _ **:** | Não existe |

Evidências dos testes realizados

_Apresente imagens, descreva os testes de tal forma que se comprove a realização da avaliação._

<a name="referencias"></a>
# 8. REFERÊNCIAS

_Como um projeto da arquitetura de uma aplicação não requer revisão bibliográfica, a inclusão das referências não é obrigatória. No entanto, caso você deseje incluir referências relacionadas às tecnologias, padrões, ou metodologias que serão usadas no seu trabalho, relacione-as de acordo com a ABNT._

Verifique no link abaixo como devem ser as referências no padrão ABNT:

http://www.pucminas.br/imagedb/documento/DOC\_DSC\_NOME\_ARQUI20160217102425.pdf


**[1]** - _ELMASRI, Ramez; NAVATHE, Sham. **Sistemas de banco de dados**. 7. ed. São Paulo: Pearson, c2019. E-book. ISBN 9788543025001._

**[2]** - _COPPIN, Ben. **Inteligência artificial**. Rio de Janeiro, RJ: LTC, c2010. E-book. ISBN 978-85-216-2936-8._

**[3]** - _CORMEN, Thomas H. et al. **Algoritmos: teoria e prática**. Rio de Janeiro, RJ: Elsevier, Campus, c2012. xvi, 926 p. ISBN 9788535236996._

**[4]** - _SUTHERLAND, Jeffrey Victor. **Scrum: a arte de fazer o dobro do trabalho na metade do tempo**. 2. ed. rev. São Paulo, SP: Leya, 2016. 236, [4] p. ISBN 9788544104514._

**[5]** - _RUSSELL, Stuart J.; NORVIG, Peter. **Inteligência artificial**. Rio de Janeiro: Elsevier, c2013. xxi, 988 p. ISBN 9788535237016._


<a name="apendices"></a>
# 9. APÊNDICES

_Inclua o URL do repositório (Github, Bitbucket, etc) onde você armazenou o código da sua prova de conceito/protótipo arquitetural da aplicação como anexos. A inclusão da URL desse repositório de código servirá como base para garantir a autenticidade dos trabalhos._

## 9.1 Ferramentas

| Ambiente  | Plataforma              |Link de Acesso |
|-----------|-------------------------|---------------|
|Repositório de código | GitHub | https://github.com/XXXXXXX | 
|Hospedagem do site | Heroku |  https://XXXXXXX.herokuapp.com | 
|Protótipo Interativo | MavelApp ou Figma | https://figma.com/XXXXXXX |
|Documentação de teste | Github | https://githun.com/xxxx |
