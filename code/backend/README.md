# Backend da Aplicação Carona?

Este é o serviço de backend para a aplicação Carona?, desenvolvido com Spring Boot.

## Prerequisites

- JDK 21
- Maven
- Docker and Docker Compose

## Pré-requisitos

- JDK 21
- Maven
- Docker e Docker Compose

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

1.1 Configure as variáveis de ambiente

Após criar o arquivo .env, abra-o e preencha os seguintes campos com os valores fornecidos pelo Supabase:

- **SUPABASE_API_KEY:** sua chave de API do Supabase

- **SUPABASE_CODE:** código único do seu projeto no Supabase (ex: abcxyzefgh)

- **SUPABASE_USERPHOTOS_BUCKET_NAME:** nome do bucket onde serão armazenadas as imagens de perfil dos usuários

- **FCM_CREDENTIALS_FILE:** caminho para o arquivo de credenciais do Firebase (ex: carona-firebase-adminsdk.json)

- **FCM_PROJECT_NAME:** nome do projeto no Firebase (ex: carona-c9eba)

- **FCM_BASE_URL:** URL base da API do FCM (padrão: https://fcm.googleapis.com/v1/)

Certifique-se de **não deixar esses campos em branco** para que a aplicação funcione corretamente.

---

1. Modifique os valores no arquivo `.env` conforme necessário.

## Executando os Serviços

### Executando MySQL e RabbitMQ Juntos

Para iniciar tanto o banco de dados MySQL quanto o RabbitMQ juntos:

**Linux/macOS:**
```bash
# Exportar variáveis de ambiente
export $(grep -v '^#' .env | xargs)

chmod +x ./start-db.sh  # Tornar o script executável na primeira vez
./start-db.sh
```

**Windows:**
```cmd
# Exportar variáveis de ambiente
for /f "tokens=*" %i in ('type .env ^| findstr /v "#"') do set %i

docker compose up -d
```

### Executando Apenas o MySQL

Se você precisar apenas do banco de dados MySQL:

**Linux/macOS:**
```bash
# Exportar variáveis de ambiente
export $(grep -v '^#' .env | xargs)

docker compose up -d mysql
```

**Windows:**
```cmd
# Exportar variáveis de ambiente
for /f "tokens=*" %i in ('type .env ^| findstr /v "#"') do set %i

docker compose up -d mysql
```

### Executando Apenas o RabbitMQ

Se você precisar apenas do RabbitMQ:

**Linux/macOS:**
```bash
# Exportar variáveis de ambiente
export $(grep -v '^#' .env | xargs)

docker compose up -d rabbitmq
```

**Windows:**
```cmd
# Exportar variáveis de ambiente
for /f "tokens=*" %i in ('type .env ^| findstr /v "#"') do set %i

docker compose up -d rabbitmq
```

### Parando os Serviços

Para parar todos os serviços:

**Linux/macOS/Windows:**
```bash
docker compose down
```

Para parar apenas um serviço específico:

**Linux/macOS/Windows:**
```bash
# Para parar apenas o MySQL
docker compose stop mysql

# Para parar apenas o RabbitMQ
docker compose stop rabbitmq
```

## Firebase Cloud Messaging (FCM) no Backend (Java)

### 🔐 Arquivo de Credenciais do Firebase
Para que o backend possa se autenticar com os serviços do Firebase e enviar notificações via FCM (Firebase Cloud Messaging), é necessário utilizar o arquivo de credenciais da conta de serviço.

__Instruções:__
1. Acesse o console do Firebase.
2. Vá em Configurações do projeto > Contas de serviço.
3. Clique em Gerar nova chave privada.
4. Baixe o arquivo .json, que terá um nome parecido com:

```pgsql
carona-c9eba-firebase-adminsdk-fbsvc-xxxxxxxx.json
```
5. Renomeie o arquivo para `carona-firebase-adminsdk.json`.
6. Coloque esse arquivo na pasta de resources do backend (por exemplo: `code/backend/src/main/resources`).
7. Configure as variáveis de ambiente no arquivo `.env`:
   - `FCM_CREDENTIALS_FILE`: caminho para o arquivo de credenciais
   - `FCM_PROJECT_NAME`: nome do seu projeto Firebase (geralmente é o ID do projeto no formato 'nome-XXXXX')
   - `FCM_BASE_URL`: URL base da API FCM (manter o valor padrão a menos que seja necessário alterar)

### Segurança e .gitignore:
Esse arquivo contém dados sensíveis, como credenciais da sua conta de serviço no Firebase. *Ele não deve ser versionado no GitHub ou em qualquer outro repositório público.*

>[!warning] Atenção
>Para evitar isso, antes de qualquer commit, verifique >se o seu arquivo de credenciais não foi adicionado para >commit.

## Executando a Aplicação

### Usando Maven

**Linux/macOS:**
```bash
# Exportar variáveis de ambiente
export $(grep -v '^#' .env | xargs)

./mvnw spring-boot:run
```

**Windows:**
```cmd
:: Exportar variáveis de ambiente
for /f "tokens=*" %i in ('type .env ^| findstr /v "#"') do set %i

mvnw.cmd spring-boot:run
```

## Documentação da API

Quando a aplicação estiver em execução, você pode acessar a documentação da API em:

- Swagger UI: http://localhost:8080/api/swagger
- Especificação OpenAPI: http://localhost:8080/api/docs

## Variáveis de Ambiente

Veja o arquivo `.env.example` para uma lista de variáveis de ambiente disponíveis.

## Debug

Para depurar a aplicação:

**VS Code:**
1. Vá para a guia "Run and Debug"
2. Selecione "Debug Carpool Application"
3. Clique no botão de play

## Testes

Para executar os testes (rodar os testes automatizados da aplicação):

Antes de executar os testes, exporte as variáveis de ambiente:

**Linux/macOS:**
```bash
export $(grep -v '^#' .env | xargs)
```

**Windows:**
```cmd
for /f "tokens=*" %i in ('type .env ^| findstr /v "#"') do set %i
```

Depois, execute os comandos abaixo:

**Linux/macOS:**
```bash
./mvnw test  # "mvnw" é o wrapper do Maven para facilitar o uso sem instalação global
```

**Windows:**
```cmd
mvnw.cmd test  :: "mvnw.cmd" é o wrapper do Maven para Windows
```

## Arquivos Docker

- `docker compose.yml`: Configuração do ambiente Docker
- `start-db.sh`: Script para iniciar o banco de dados e aguardar que esteja pronto
