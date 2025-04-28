#match_rides.py
from database.rides_repository import buscar_caronas_similares
import logging

# Configuração do logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)
logger = logging.getLogger("ride_matcher")

def tratar_solicitacao(payload):
    data_partida = payload.get("dataHoraPartida")
    if not data_partida:
        logger.error("dataHoraPartida ausente na mensagem")
        raise ValueError("dataHoraPartida ausente na mensagem")

    try:
        caronas_similares = buscar_caronas_similares(data_partida)
        logger.info(f"🔍 {len(caronas_similares)} caronas encontradas com horário próximo:")
        for carona in caronas_similares:
            logger.info(f"➡️ {carona}")
    except Exception as e:
        logger.error(f"Erro ao tratar solicitação: {e}")
        raise e  # ou retorne um valor indicando falha
