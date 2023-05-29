from fastapi import Path
from pydantic import Required

from utils.exceptions import APIException
from utils.settings import pool


def client_id_exists(
        client_id: int = Path(default=Required)
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT client_id FROM clients.clients WHERE client_id = %s", [client_id])
            if not cursor.fetchone():
                raise APIException("Client ID does not exist", 404)


def phone_type_exists(
        client_id: int = Path(default=Required),
        phone_type: str = Path(default=Required, regex="^(work|home|mobile|other)$")
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT client_id FROM clients.phone WHERE client_id = %s AND type = %s",
                        [client_id, phone_type])
            if not cursor.fetchone():
                raise APIException(f"Phone type for client {client_id} does not exist", 404)


def email_type_exists_for_client(
        client_id: int = Path(default=Required),
        email_type: str = Path(default=Required, regex="^(personal|work|other)$")
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT client_id FROM clients.email WHERE client_id = %s AND type = %s",
                        [client_id, email_type])
            if not cursor.fetchone():
                raise APIException(f"Email type for client {client_id} does not exist", 404)
