# Guia para Desenvolvedores Mobile

Este guia fornece instruções para configurar o ambiente de desenvolvimento, executar a API backend e conectar a aplicação mobile no Windows e Linux.

## 1. Executando a API Backend

### Pré-requisitos
- Docker & Docker Compose
- Java 21 (apenas para desenvolvimento sem Docker)
- Maven (apenas para desenvolvimento sem Docker)

### Executando o banco de dados com Docker (recomendado)

O jeito mais simples de trabalhar é executando apenas o banco de dados MySQL no Docker enquanto você executa a API localmente para facilitar o desenvolvimento:

#### Windows:

1. Crie um arquivo `.env` baseado no `.env.example`:
   ```bash
   copy .env.example .env
   ```

2. Exporte as variáveis de ambiente do arquivo:
```bash
set -a
source .env
set +a
```
> **Nota:** O comando `source` não é nativo do Windows. Você pode usar o PowerShell ou o Git Bash para executar comandos semelhantes.

3. Inicie o banco de dados:
   ```bash
   docker-compose up -d mysql
   ```

4. Execute a aplicação:
   ```bash
   mvn spring-boot:run
   ```

#### Linux:

2. Crie um arquivo `.env` baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Exporte as variáveis de ambiente do arquivo:
```bash
export $(cat .env | xargs)
```

4. Inicie o banco de dados:
   ```bash
   docker-compose up -d mysql
   ```

5. Execute a aplicação:
   ```bash
   ./mvnw spring-boot:run
   # Ou se o Maven estiver instalado globalmente
   mvn spring-boot:run
   ```

6. Acesse a documentação da API:
   ```
   http://localhost:8080/api/swagger
   ```

## 2. Configurando o ngrok para desenvolvimento mobile

O ngrok permite que a API em sua máquina local seja acessada remotamente, o que é útil para testar o aplicativo em um dispositivo físico.

### Instalação do ngrok via npm (recomendado)

1. Certifique-se de ter o Node.js instalado no seu sistema

2. Instale o ngrok globalmente via npm:
   ```bash
   npm install ngrok -g
   ```

3. Autentique sua conta ngrok (necessário apenas uma vez):
   - Crie uma conta gratuita em [https://ngrok.com](https://ngrok.com)
   - Obtenha seu token de autenticação no dashboard
   - Configure o token:
   ```bash
   ngrok config add-authtoken SEU_TOKEN_AQUI
   ```

4. Inicie o ngrok apontando para sua API local:
   ```bash
   # Já que configuramos CONTEXT_PATH=/api no backend
   ngrok http 8080
   ```

### Utilizando o ngrok

Após iniciar o ngrok, você verá uma tela como esta:

```
Session Status                online
Account                       seu_nome (Plan: Free)
Version                       3.4.0
Region                        South America (sa)
Latency                       23ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xxx-xx-xx.ngrok-free.app -> http://localhost:8080
```

Copie o URL de encaminhamento (por exemplo: `https://xxxx-xxx-xx-xx.ngrok-free.app`). Este é o URL que você usará para acessar sua API de qualquer lugar.

### Observações importantes sobre o ngrok:

- O URL muda cada vez que você reinicia o ngrok (na versão gratuita)
- Limite de 40 conexões por minuto na versão gratuita
- A sessão expira após algumas horas na versão gratuita
- Para verificar as requisições recebidas, acesse a interface web do ngrok em `http://127.0.0.1:4040`

## 3. Configurando a aplicação mobile para usar o backend via ngrok

### 3.1. Conectando a aplicação mobile à API

Você tem duas opções para configurar sua aplicação mobile para usar a API via ngrok:

#### Opção 1: Atualizar o arquivo .env

Edite o arquivo `.env` no diretório do frontend:

```properties
# Atual configuração no .env
# API_BASE_URL=https://carona-z4nn.onrender.com/api

# Substitua pelo URL do seu ngrok
API_BASE_URL=https://seu-url-ngrok-aqui.ngrok-free.app/api
```

#### Opção 2: Modificar diretamente o apiClient.js

Você também pode editar diretamente o arquivo `apiClient.js`:

```javascript
// Em apiClient.js
const getBaseUrl = () => {
  // Substitua a URL do ngrok atual pela sua
  return 'https://seu-url-ngrok-aqui.ngrok-free.app/api';
};
```

Exemplo baseado no arquivo atual:
```javascript
// Ao invés de 
return 'https://20bd-191-5-86-85.ngrok-free.app/api';

// Coloque seu URL do ngrok
return 'https://seu-url-ngrok-aqui.ngrok-free.app/api';
```

### 3.2. Reconstrua a aplicação mobile

Depois de atualizar a configuração da API:

```bash
cd ../frontEnd
npm install
npm start --tunnel
```

## 4. Testando a conexão com a API

1. Depois de iniciar a aplicação mobile, verifique se ela está se conectando corretamente à API
2. Você pode monitorar as requisições através da interface web do ngrok em `http://127.0.0.1:4040`
3. Os logs do backend também mostrarão as requisições recebidas

## Links úteis

- [Documentação do ngrok](https://ngrok.com/docs)
