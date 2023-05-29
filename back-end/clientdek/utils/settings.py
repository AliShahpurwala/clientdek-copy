import psycopg2
import psycopg
from psycopg_pool import ConnectionPool
from dotenv import load_dotenv
import os
import redis

load_dotenv()
connection = psycopg2.connect(dbname=os.environ['DB_NAME'],
                              user=os.environ['DB_USER'],
                              password=os.environ['DB_PASSWORD'],
                              host=os.environ['DB_URL'],
                              )
pool = ConnectionPool(
    f"postgresql://{os.environ['DB_USER']}:{os.environ['DB_PASSWORD']}@{os.environ['DB_URL']}:5432/{os.environ['DB_NAME']}", 
    open=False)
redis_connection = redis.Redis(host="redis-instance", port=6379, password=os.environ['REDIS_PASSWORD'], decode_responses=True)
connection.autocommit = True
PASSWORD_RESET_EXPIRY = 60  # In minutes
DB_NAME = os.environ['DB_NAME']
DB_PASS = os.environ['DB_PASSWORD']
DB_USER = os.environ['DB_USER']
DB_URL = os.environ['DB_URL']
SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

DEBUG = os.environ['DEBUG'] == 'True'
