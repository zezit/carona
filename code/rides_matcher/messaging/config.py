# config.py
import os
from dotenv import load_dotenv

load_dotenv()  # carrega .env na variável de ambiente

RABBIT_HOST    = os.getenv("RABBIT_HOST")
RABBIT_PORT    = int(os.getenv("RABBIT_PORT", 5672))
RABBIT_USER    = os.getenv("RABBIT_USER")
RABBIT_PASS    = os.getenv("RABBIT_PASS")

QUEUE_REQUEST  = os.getenv("QUEUE_REQUEST")
QUEUE_MATCHES  = os.getenv("QUEUE_MATCHES")

API_BASE_URL   = os.getenv("API_BASE_URL")
MAX_DISTANCE_KM= float(os.getenv("MAX_DISTANCE_KM", 5.0))
