from fastapi import APIRouter, Depends, Path, Body
from psycopg2 import sql
from pydantic import Required

from src.clients.commons import PhoneIn, NewPhone
from src.clients.dependencies import client_id_exists, phone_type_exists
from src.clients.helper_methods import phone_type_exists_helper
from utils.exceptions import APIException
from utils.settings import pool
from utils.router import ClientdekRoute

phone = APIRouter(route_class=ClientdekRoute, 
                  prefix="/{client_id}/phone/{phone_type}",
                  dependencies=[Depends(client_id_exists), Depends(phone_type_exists)],
                  tags=["Clients"])


@phone.get(path="/", status_code=200,
           summary="Get the phone of a client with a specific type")
def get_phone(
        client_id: int = Path(default=Required),
        phone_type: str = Path(default=Required, regex="home|work|mobile|other")
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT country_code, number, contact_preference FROM clients.phone \
                            WHERE client_id = %s AND type = %s",
                        [client_id, phone_type])
            row = cursor.fetchone()
            if row is None:
                raise APIException("Phone type not found", 404)

            return {"country_code": row[0], "phone": row[1],
                    "contact_preference": row[2]}


@phone.put(path="/", status_code=200, summary="Edit the phone of a client with a specific type")
def edit_phone_put(
        client_id: int = Path(default=Required),
        phone_type: str = Path(default=Required, regex="home|work|mobile|other"),
        put_phone: PhoneIn = Body(default=Required)
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE clients.phone \
                            SET number = %s, country_code = %s, contact_preference = %s \
                            WHERE client_id = %s AND type = %s",
                        [put_phone.phone, put_phone.country_code, put_phone.contact_preference,
                            client_id, phone_type])
            connection.commit()
    return f"{client_id} phone number {phone_type} updated"


@phone.patch(path="/",
             status_code=200,
             summary="Edit the phone of a client with a specific type")
def edit_phone(
        client_id: int = Path(default=Required),
        phone_type: str = Path(default=Required, regex="home|work|mobile|other"),
        patch_phone: PhoneIn = Body(default=None),
):
    if not patch_phone:
        return
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            for field in PhoneIn.__fields__:
                if not patch_phone.__getattribute__(field):
                    sql_query = sql.SQL("UPDATE clients.phone SET {col} = %s WHERE client_id = %s AND type = %s")
                    cursor.execute(sql_query.format(col=sql.Identifier(field)),
                                [patch_phone.__getattribute__(field), client_id, phone_type])
                    connection.commit()


@phone.delete(path="/",
              summary="Delete the phone of a client with a specific type")
def delete_phone(
        client_id: int = Path(default=Required),
        phone_type: str = Path(default=Required, regex="home|work|mobile|other"),
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM clients.phone WHERE client_id = %s AND type = %s", [client_id, phone_type])
            connection.commit()

phones = APIRouter(route_class=ClientdekRoute, 
                   prefix="/{client_id}/phone",
                   dependencies=[Depends(client_id_exists)])


@phones.post(path="/",
             summary="Add a phone for a client")
def add_phone(
        client_id: int = Path(default=Required),
        phone: NewPhone = Body(default=Required)
):
    if phone_type_exists_helper(client_id, phone.phone_type):
        raise APIException(f"Phone type {phone.phone_type} already exists for {client_id}", 403)
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO clients.phone \
                    (client_id, number, country_code, type, contact_preference) \
                VALUES (%s, %s, %s, %s, %s)",
                [client_id, phone.phone_number, phone.country_code,
                phone.phone_type, phone.contact_preference])
            connection.commit()