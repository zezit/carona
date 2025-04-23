import mysql.connector
from database.connection import get_connection
from datetime import datetime, timedelta

def buscar_caronas_similares(data_obj):
    """
    Busca caronas com dataHoraPartida dentro de ±30 minutos da data informada.
    """
    intervalo_inicio = data_obj - timedelta(minutes=30)
    intervalo_fim = data_obj + timedelta(minutes=30)

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT * FROM carona
            WHERE dataHoraPartida BETWEEN %s AND %s
        """
        cursor.execute(query, (intervalo_inicio, intervalo_fim))
        resultados = cursor.fetchall()

        cursor.close()
        conn.close()
        return resultados

    except Exception as e:
        print("Erro ao buscar caronas:", e)
        return []
