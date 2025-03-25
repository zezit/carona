# Carpool Application Backend

This is the backend service for the Carpool application, built with Spring Boot.

# Backend da Aplicação de Caronas

Este é o serviço de backend para a aplicação de Caronas, desenvolvido com Spring Boot.

## Prerequisites

- JDK 21
- Maven
- Docker and Docker Compose

## Pré-requisitos

- JDK 21
- Maven
- Docker e Docker Compose

## Setup Environment

1. Copy the `.env.example` file to create a new `.env` file:

   **Linux/macOS:**
   ```bash
   cp .env.example .env
   ```

   **Windows:**
   ```cmd
   copy .env.example .env
   ```

2. Modify the values in the `.env` file if needed.

## Configuração do Ambiente

1. Copie o arquivo `.env.example` para criar um novo arquivo `.env`:

   **Linux/macOS:**
   ```bash
   cp .env.example .env
   ```

   **Windows:**
   ```cmd
   copy .env.example .env
   ```

2. Modifique os valores no arquivo `.env` conforme necessário.

## Run the Database

To start the MySQL database using Docker:

**Linux/macOS:**
```bash
chmod +x ./start-db.sh  # Na primeira vez, para tornar o script executável
./start-db.sh
```

**Windows:**
```cmd
docker-compose up -d mysql
```

To stop the database:

**Linux/macOS/Windows:**
```bash
docker-compose down
```

## Executar o Banco de Dados

Para iniciar o banco de dados MySQL usando Docker:

**Linux/macOS:**
```bash
chmod +x ./start-db.sh  # Na primeira vez, para tornar o script executável
./start-db.sh
```

**Windows:**
```cmd
docker-compose up -d mysql
```

Para parar o banco de dados:

**Linux/macOS/Windows:**
```bash
docker-compose down
```

## Run the Application

### Using Maven

**Linux/macOS:**
```bash
./mvnw spring-boot:run
```

**Windows:**
```cmd
mvnw.cmd spring-boot:run
```

### Usando Maven

**Linux/macOS:**
```bash
./mvnw spring-boot:run
```

**Windows:**
```cmd
mvnw.cmd spring-boot:run
```

### Using VS Code

VS Code launch configurations are included in this project:

1. **Run Carpool Application** - Starts the database and then runs the application
2. **Debug Carpool Application** - Starts the database and runs the application in debug mode
3. **Launch with Hot Reload** - Runs with Spring DevTools for hot reloading
4. **Launch without Database** - Runs the application without starting the database

Simply open the Debug panel in VS Code and select the appropriate launch configuration.

### Usando VS Code

As configurações de execução do VS Code estão incluídas neste projeto:

1. **Run Carpool Application** - Inicia o banco de dados e executa a aplicação
2. **Debug Carpool Application** - Inicia o banco de dados e executa a aplicação em modo de depuração
3. **Launch with Hot Reload** - Executa com Spring DevTools para recarga automática
4. **Launch without Database** - Executa a aplicação sem iniciar o banco de dados

Basta abrir o painel de Debug no VS Code e selecionar a configuração de execução apropriada.

## API Documentation

When the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI Spec: http://localhost:8080/v3/api-docs

## Documentação da API

Quando a aplicação estiver em execução, você pode acessar a documentação da API em:

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Especificação OpenAPI: http://localhost:8080/v3/api-docs

## Authentication

The API uses JWT tokens for authentication. To get a token, use the `/api/auth/signin` endpoint.

## Autenticação

A API usa tokens JWT para autenticação. Para obter um token, use o endpoint `/api/auth/signin`.

## Environment Variables

See the `.env.example` file for a list of available environment variables.

## Variáveis de Ambiente

Veja o arquivo `.env.example` para uma lista de variáveis de ambiente disponíveis.

## Estrutura do Projeto

```
src
├── main
│   ├── java
│   │   └── com
│   │       └── br
│   │           └── puc
│   │               └── carona
│   │                   ├── config       # Configurações do Spring
│   │                   ├── controller   # Controladores REST
│   │                   ├── dto          # Objetos de Transferência de Dados
│   │                   ├── enums        # Enumeradores
│   │                   ├── exception    # Tratamento de exceções
│   │                   ├── mapper       # Mapeadores entre entidades e DTOs
│   │                   ├── model        # Entidades do domínio
│   │                   ├── repository   # Repositórios JPA
│   │                   ├── service      # Lógica de negócio
│   │                   └── util         # Classes utilitárias
│   └── resources
│       ├── application.yml  # Configurações da aplicação
│       └── messages.properties # Mensagens de validação
```

## Debug

Para depurar a aplicação:

**VS Code:**
1. Vá para a guia "Run and Debug"
2. Selecione "Debug Carpool Application"
3. Clique no botão de play verde

**IntelliJ IDEA:**
1. Clique com o botão direito no arquivo `CaronaApplication.java`
2. Selecione "Debug 'CaronaApplication.main()'"

## Testes

Para executar os testes:

**Linux/macOS:**
```bash
./mvnw test
```

**Windows:**
```cmd
mvnw.cmd test
```

## Arquivos Docker

- `docker-compose.yml`: Configuração do ambiente Docker
- `start-db.sh`: Script para iniciar o banco de dados e aguardar que esteja pronto
