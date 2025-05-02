# Guia de Configuração do VS Code - Launch e Tasks

Este documento explica como utilizar as configurações de launch e tasks do VS Code para o projeto Carpool.

## Tasks (Tarefas)

As tasks são comandos que podem ser executados diretamente do VS Code. O projeto possui as seguintes tasks configuradas:

### Start MySQL Database
- **Descrição**: Inicia o banco de dados MySQL necessário para a aplicação
- **Como executar**: 
  - Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no macOS)
  - Digite "Tasks: Run Task"
  - Selecione "Start MySQL Database"

### Run Ngrok and Update API
- **Descrição**: Inicia o Ngrok e atualiza a API com o novo endereço
- **Como executar**:
  - Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no macOS)
  - Digite "Tasks: Run Task"
  - Selecione "Run Ngrok and Update API"

## Launch Configurations (Configurações de Inicialização)

As configurações de launch permitem iniciar diferentes partes do projeto diretamente do VS Code.

### Run Backend API
- **Descrição**: Inicia o servidor backend Spring Boot
- **Pré-requisito**: MySQL Database deve estar rodando
- **Como executar**:
  - Pressione `F5` ou vá ao menu "Run and Debug"
  - Selecione "Run Backend API" no dropdown
  - Clique no botão de play ou pressione `F5`

### Run Ngrok + API Update
- **Descrição**: Inicia o Ngrok e atualiza a configuração da API
- **Como executar**:
  - Pressione `F5` ou vá ao menu "Run and Debug"
  - Selecione "Run Ngrok + API Update" no dropdown
  - Clique no botão de play ou pressione `F5`

### Run Mobile
- **Descrição**: Inicia a aplicação mobile
- **Como executar**:
  - Pressione `F5` ou vá ao menu "Run and Debug"
  - Selecione "Run mobile" no dropdown
  - Clique no botão de play ou pressione `F5`

### Run App (Compound)
- **Descrição**: Inicia todos os componentes da aplicação de uma vez
- **O que inclui**:
  1. Backend API
  2. Ngrok + API Update
  3. mobile
- **Como executar**:
  - Pressione `F5` ou vá ao menu "Run and Debug"
  - Selecione "Run App" no dropdown
  - Clique no botão de play ou pressione `F5`

## Dicas Importantes

1. **Ordem de Execução**: Ao iniciar manualmente os componentes, siga a ordem:
   - Primeiro: MySQL Database
   - Segundo: Backend API
   - Terceiro: Ngrok + API Update
   - Quarto: mobile

2. **Problemas Comuns**:
   - Se o backend não iniciar, verifique se o MySQL está rodando
   - Se o mobile não conectar, verifique se o Ngrok está ativo e se a API foi atualizada corretamente

3. **Atalhos Úteis**:
   - `Ctrl+Shift+P` (ou `Cmd+Shift+P` no macOS): Abre a paleta de comandos
   - `F5`: Inicia a configuração de debug selecionada
   - `Shift+F5`: Para a execução atual
   - `Ctrl+Shift+5` (ou `Cmd+Shift+5` no macOS): Mostra a view de debug