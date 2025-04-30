#main.py
from database.connection import get_connection
from utils.logger_config import setup_logger
from messaging.messaging import RideRequestConsumer, RabbitMQConnection
from messaging.config import RABBIT_HOST, RABBIT_PORT, RABBIT_USER, RABBIT_PASS, QUEUE_REQUEST

# Setup logger using centralized configuration
logger = setup_logger("rides_matcher")


def testar_conexao():
    """Função que testa a conexão com o banco de dados e retorna True/False"""
    try:
        conn = get_connection()
        logger.info("✅ Conectado ao banco de dados com sucesso!")
        conn.close()
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao conectar ao banco de dados: {e}")
        return False


def iniciar_servico():
    """Função que inicia o serviço de consumo de mensagens se a conexão for bem-sucedida"""
    rabbit_connection = RabbitMQConnection(
        host=RABBIT_HOST,
        port=RABBIT_PORT,
        user=RABBIT_USER,
        password=RABBIT_PASS
    )
    consumer = RideRequestConsumer(rabbit_connection, QUEUE_REQUEST)
    consumer.start_consuming()


def main():
    """Função principal que testa a conexão com o banco e inicia o serviço"""
    if testar_conexao():
        iniciar_servico()
    else:
        logger.warning("⚠️ Serviço encerrado: falha na conexão com o banco de dados.")


if __name__ == "__main__":
    main()
