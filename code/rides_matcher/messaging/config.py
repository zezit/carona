# config.py
import os
from dotenv import load_dotenv

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
dotenv_path = os.path.join(project_root, 'backend', '.env')

load_dotenv(dotenv_path=dotenv_path)

RABBIT_HOST    = os.getenv("RABBITMQ_HOST")
RABBIT_PORT    = int(os.getenv("RABBITMQ_PORT", 5672))
RABBIT_USER    = os.getenv("RABBITMQ_USER")
RABBIT_PASS    = os.getenv("RABBITMQ_PASSWORD")

QUEUE_REQUEST  = os.getenv("QUEUE_REQUEST")
QUEUE_MATCHES  = os.getenv("QUEUE_MATCHES")
QUEUE_NOTIFICATIONS = os.getenv("QUEUE_NOTIFICATIONS")
QUEUE_RIDE_CREATED = os.getenv("QUEUE_RIDE_CREATED")
QUEUE_RIDE_UPDATED = os.getenv("QUEUE_RIDE_UPDATED")

API_BASE_URL   = os.getenv("API_BASE_URL")
MAX_DISTANCE_KM= float(os.getenv("MAX_DISTANCE_KM", 5.0))
