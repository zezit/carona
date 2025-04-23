import json
import logging
import pika
from datetime import datetime
from services.match_rides import tratar_solicitacao
from messaging.config import (
    RABBIT_HOST, RABBIT_PORT, RABBIT_USER, RABBIT_PASS,
    QUEUE_REQUEST
)

# Configuração do logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)
logger = logging.getLogger("ride_matcher")


class RabbitMQConnection:
    """Classe responsável por estabelecer a conexão com o RabbitMQ e fornecer um canal"""
    
    def __init__(self, host, port, user, password):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
    
    def connect(self):
        """Estabelece a conexão com o RabbitMQ e retorna o canal"""
        creds = pika.PlainCredentials(self.user, self.password)
        params = pika.ConnectionParameters(self.host, self.port, '/', creds)
        conn = pika.BlockingConnection(params)
        channel = conn.channel()
        channel.basic_qos(prefetch_count=1)
        return channel


class MessageProcessor:
    """Classe responsável pelo processamento das mensagens recebidas"""
    
    def __init__(self, channel):
        self.channel = channel
    
    def process_message(self, ch, method, props, body):
        """Processa a mensagem recebida da fila"""
        print()
        try:
            payload = json.loads(body)
            logger.info("Mensagem recebida da fila: %s", payload)
            
            # Converte a dataHoraPartida para datetime e atualiza o payload
            self.convert_and_process_payload(payload)
            
            # Envia o payload tratado para a função tratar_solicitacao
            tratar_solicitacao(payload)  # Não é necessário fazer mais a conversão para string aqui
            
            # Confirma o recebimento e processamento da mensagem
            self.acknowledge_message(ch, method)
            print()
            
        except Exception as e:
            logger.error(f"Erro ao processar a solicitação: {e}")
            self.nacknowledge_message(ch, method)
    
    def convert_and_process_payload(self, payload):
        """Converte a dataHoraPartida para datetime e atualiza o payload"""
        dataHoraPartida = payload.get('dataHoraPartida')
        
        if dataHoraPartida:
            try:
                # Converte a lista para um objeto datetime
                data_obj = datetime(dataHoraPartida[0], dataHoraPartida[1], dataHoraPartida[2], dataHoraPartida[3], dataHoraPartida[4])
                # Atualiza o payload com o objeto datetime
                payload['dataHoraPartida'] = data_obj
                logger.info(f"Data e hora da partida convertida: {data_obj}")
            except Exception as e:
                logger.error(f"Erro ao converter dataHoraPartida: {e}")
                raise  # Relança a exceção para ser capturada no process_message

    def acknowledge_message(self, ch, method):
        """Envia confirmação (ack) para indicar que a mensagem foi processada"""
        ch.basic_ack(delivery_tag=method.delivery_tag)
    
    def nacknowledge_message(self, ch, method):
        """Envia negativa (nack) para indicar que houve erro no processamento"""
        ch.basic_nack(delivery_tag=method.delivery_tag)


class RideRequestConsumer:
    """Classe principal para consumir mensagens da fila"""
    
    def __init__(self, connection: RabbitMQConnection, queue_name: str):
        self.connection = connection
        self.queue_name = queue_name
    
    def start_consuming(self):
        """Inicia o consumo da fila RabbitMQ"""
        channel = self.connection.connect()
        message_processor = MessageProcessor(channel)
        channel.basic_consume(
            queue=self.queue_name,
            on_message_callback=message_processor.process_message
        )
        logger.info(f"Aguardando mensagens na fila {self.queue_name}...")
        channel.start_consuming()
