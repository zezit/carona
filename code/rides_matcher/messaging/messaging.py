# messaging.py
import json
import logging
import pika

from messaging.config import (
    RABBIT_HOST, RABBIT_PORT, RABBIT_USER, RABBIT_PASS,
    QUEUE_REQUEST
)

# Configura logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)
logger = logging.getLogger("ride_matcher")

def connect_rabbit():
    creds = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
    params = pika.ConnectionParameters(RABBIT_HOST, RABBIT_PORT, '/', creds)
    conn = pika.BlockingConnection(params)
    channel = conn.channel()
    
    channel.basic_qos(prefetch_count=1)
    return channel

def process_request(ch, method, props, body):
    payload = json.loads(body)
    print("mensagem recebida:", payload)
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_consuming():
    channel = connect_rabbit()
    channel.basic_consume(
        queue=QUEUE_REQUEST,
        on_message_callback=process_request
    )
    logger.info(f"Waiting for messages on {QUEUE_REQUEST}...")
    channel.start_consuming()
