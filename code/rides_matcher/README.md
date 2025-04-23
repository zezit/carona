# Ride Matcher Service

Micro-serviço Python para processar solicitações de carona:

- Consome `carpool.rides.request`
- Consulta API REST (solicitações e ofertas)
- Calcula Haversine e filtra por distância
- Publica em `carpool.rides.matches`

## Como rodar?

### 1. Requisitos
Antes de começar, verifique se você tem as seguintes ferramentas instaladas:
- Python 3.10+
- pip (gerenciador de pacotes do Python)
- RabbitMQ em execução (localhost:5672) - É executado junto ao backend principal
- A API de caronas deve estar acessível via API_BASE_URL (definido em messaging/config.py)

### 2. Crie e ative o ambiente virtual
Um ambiente virtual isola as dependências do projeto, evitando conflitos com outros projetos Python na sua máquina.


```bash
python3 -m venv venv
source venv/bin/activate  # No Windows use: venv\Scripts\activate
```

### 3. Instale as dependências
O projeto usa bibliotecas como ```requests```, ```pika``` (para RabbitMQ) e ```haversine```. Elas estão listadas no ```requirements.txt```.
```bash
pip install -r requirements.txt
```

### 4. Configure o Ambiente
Verifique se as variáveis de configuração no arquivo messaging/config.py estão corretas, principalmente:

- RABBIT_HOST, RABBIT_PORT, RABBIT_USER, RABBIT_PASS
- QUEUE_REQUEST
- API_BASE_URL
- MAX_DISTANCE_KM

### 5. Execute o serviço
Com o ambiente virtual ativado e o RabbitMQ rodando:

```bash
python3 main.py

```

Você verá no terminal logs indicando que o serviço está escutando a fila carpool.rides.request.

