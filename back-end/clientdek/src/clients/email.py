from fastapi import APIRouter, Depends, Path, Body
from psycopg2 import sql
from pydantic import Required, EmailStr

from src.clients.commons import EmailPatch
from src.clients.dependencies import client_id_exists, email_type_exists_for_client
from utils.exceptions import APIException
from utils.settings import pool
from utils.router import ClientdekRoute

email = APIRouter(route_class=ClientdekRoute, 
                  prefix="/{client_id}/email/{email_type}",
                  dependencies=[Depends(client_id_exists), Depends(email_type_exists_for_client)],
                  tags=["Clients"])


@email.get(path="/",
           status_code=200,
           summary="Get the email of a client with a client id")
def get_email(
        client_id: int = Path(default=Required),
        email_type: str = Path(default=Required, regex="^(personal|work|other)$")
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT email, type, contact_preference \
                            FROM clients.email \
                            WHERE client_id = %s AND type = %s",
                        [client_id, email_type])

            row = cursor.fetchone()
            if not row:
                raise APIException(f"Email of type {email_type} not found for client {client_id}", 404)
    return {"email": row[0], "type": row[1],
            "contact_preference": row[2]}


@email.delete(path="/", status_code=200,
              summary="Delete the email of a client of a specific type")
def delete_email(
        client_id: int = Path(default=Required),
        email_type: str = Path(default=Required, regex="^(personal|work|other)$")
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM clients.email \
                            WHERE client_id = %s AND type = %s",
                        [client_id, email_type])
            connection.commit()

    return f"Email of type {email_type} deleted from {client_id}"


@email.patch(path="/", status_code=200,
             summary="Patch an email belonging to a client")
def edit_email(
        client_id: int = Path(default=Required),
        email_type: str = Path(default=Required, regex="^(personal|work|other)$"),
        email_patch: EmailPatch = Body(default=Required)
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT type FROM clients.email WHERE client_id = %s", [client_id])
            result = cursor.fetchall()
            if result and email_patch.new_type in result:
                raise APIException(f"Email type {email_patch.new_type} already exists for client {client_id}")
            for field in EmailPatch.__fields__:
                if not email_patch.__getattribute__(field):
                    sql_query = sql.SQL("UPDATE clients.email SET {col} = %s WHERE client_id = %s AND type = %s")
                    cursor.execute(sql_query.format(col=sql.Identifier(field)),
                                [email_patch.__getattribute__(field), client_id, email_type])
                    connection.commit()
    return f"Client {client_id} {email_patch.new_type} email updated"


@email.put(path="/", status_code=200,
           summary="Edit the email of a client")
def edit_email_put(
        client_id: int = Path(default=Required),
        email_type: str = Path(default=Required, regex="^(personal|work|other)$"),
        contact_preference: str = Body(default=Required, regex="^(no_contact|no_marketing|contact)$"),
        new_email: EmailStr = Body(default=Required, )
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE clients.email \
                            SET email = %s, contact_preference = %s \
                            WHERE client_id = %s AND type = %s",
                        [new_email, contact_preference,
                            client_id, email_type])
            connection.commit()
    return f'Client {client_id} {email_type} email updated'
