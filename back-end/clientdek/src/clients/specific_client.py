import re
from fastapi import APIRouter, Path, Body, Depends
from psycopg2 import sql
from pydantic import Required

from src.clients.commons import Client, Email, Phone, Demographics, Name, Contact, ClientPatch
from src.clients.dependencies import client_id_exists
from src.clients.helper_methods import get_address
from utils.settings import connection, pool
from utils.router import ClientdekRoute


specific_client = APIRouter(route_class=ClientdekRoute,
                            prefix="/{client_id}",
                            dependencies=[Depends(client_id_exists)],
                            tags=["Clients"])


@specific_client.get(path="/",
                     status_code=200,
                     response_model=Client,
                     summary="View details of a specific client")
def view_client_details(
        client_id: int = Path(default=Required)
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            # Get client_id and status
            cursor.execute(
                'SELECT status FROM clients.clients WHERE client_id = %s', [client_id])
            status = cursor.fetchone()[0]

            address = get_address(client_id)

            cursor.execute('SELECT gender, date_of_birth FROM clients.demographics\
                        WHERE client_id = %s',
                        [client_id])
            demo_data = cursor.fetchone()
            if demo_data is not None:
                demographics = Demographics(
                    gender=demo_data[0], date_of_birth=demo_data[1])
            else:
                demographics = Demographics()

            # Get client email data
            cursor.execute('SELECT type, email, contact_preference FROM clients.email\
                        WHERE client_id = %s',
                        [client_id])
            client_email_data = cursor.fetchall()

            if client_email_data is not None:
                email = [Email(type=e[0], email=e[1], contact_preference=e[2])
                        for e in client_email_data]
            else:
                email = []

            # Get client phone data
            cursor.execute('SELECT type, country_code, number, contact_preference\
                        FROM clients.phone WHERE client_id = %s',
                        [client_id])
            client_phone_data = cursor.fetchall()
            if client_phone_data is not None:
                phone = [Phone(type=p[0], country_code=p[1], phone=p[2], contact_preference=p[3])
                        for p in client_phone_data]
            else:
                phone = []
            contact = Contact(email=email, phone=phone)

            # Get client name data
            cursor.execute('SELECT first, last, middle, preferred, prefix, suffix\
                            FROM clients.name WHERE client_id =%s', [client_id])
            client_name_data = cursor.fetchone()
            if client_name_data is not None:
                name = Name(
                    first=client_name_data[0],
                    last=client_name_data[1],
                    middle=client_name_data[2],
                    preferred=client_name_data[3],
                    prefix=client_name_data[4],
                    suffix=client_name_data[5])
            else:
                name = Name()

    client = Client(
        status=status,
        name=name,
        contact=contact,
        address=address,
        demographics=demographics)
    return client

@specific_client.patch(path="/",
                       status_code=200,
                       summary="Edit a specific client")
def edit_client(
        client_id: int = Path(default=Required),
        client: Client = Body(default=None)
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            # Update name fields
            for field, value in client.name.dict().items():
                if value:
                    col_identifier = field
                    sql_query = "UPDATE clients.name SET {column} = %s WHERE client_id = %s"
                    cursor.execute(sql.SQL(sql_query).format(column=sql.Identifier(col_identifier)),
                                [value, client_id])
                    connection.commit()

            # Update contact fields
            for email in client.contact.email:
                for field, value in email.dict().items():
                    if value:
                        sql_query = "UPDATE clients.email SET {column} = %s WHERE client_id = %s"
                        cursor.execute(sql.SQL(sql_query).format(column=sql.Identifier(field)),
                                    [value, client_id])
                        connection.commit()

            for phone in client.contact.phone:
                for field, value in phone.dict().items():
                    if value:
                        sql_query = "UPDATE clients.phone SET {column} = %s WHERE client_id = %s"
                        cursor.execute(sql.SQL(sql_query).format(column=sql.Identifier(field)),
                                    [value, client_id])
                        connection.commit()

            # Update address fields
            for field, value in client.address.dict().items():
                if value:
                    sql_query = "UPDATE clients.address SET {column} = %s WHERE client_id = %s"
                    cursor.execute(sql.SQL(sql_query).format(column=sql.Identifier(field)),
                                    [value, client_id])
                    connection.commit()

            # Update demographics fields
            for field, value in client.demographics.dict().items():
                if value:
                    sql_query = "UPDATE clients.demographics SET {column} = %s WHERE client_id = %s"
                    cursor.execute(sql.SQL(sql_query).format(column=sql.Identifier(field)),
                                [value, client_id])
                    connection.commit()

    return {"Message": "Client updated successfully"}


@specific_client.put(path="/",
                     status_code=200,
                     summary="Replace a specific client's data")
def replace_client(
        client_id: int = Path(default=Required),
        client: Client = Body(default=None)
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            # Update name fields
            for field, value in client.name.dict().items():
                col_identifier = field
                sql_query = "UPDATE clients.name SET {column} = %s WHERE client_id = %s"
                cursor.execute(sql.SQL(sql_query).format(column=sql.Identifier(col_identifier)),
                            [value, client_id])
                connection.commit()

            # Update contact fields
            # Delete existing email and phone entries for the client
            cursor.execute(
                "DELETE FROM clients.email WHERE client_id = %s", [client_id])
            connection.commit()
            cursor.execute(
                "DELETE FROM clients.phone WHERE client_id = %s", [client_id])
            connection.commit()

            # Insert new email and phone entries
            for email in client.contact.email:
                cursor.execute("INSERT INTO clients.email (client_id, type, email, contact_preference)\
                            VALUES (%s, %s, %s, %s)",
                            [client_id, email.type, email.email, email.contact_preference])
                connection.commit()

            for phone in client.contact.phone:
                cursor.execute("INSERT INTO clients.phone (client_id, type, country_code, number, contact_preference)\
                                VALUES (%s, %s, %s, %s, %s)",
                            [client_id, phone.type, phone.country_code, phone.phone, phone.contact_preference])
                connection.commit()

            # Update address fields
            for field, value in client.address.dict().items():
                sql_query = "UPDATE clients.address SET {column} = %s WHERE client_id = %s"
                cursor.execute(sql.SQL(sql_query).format(column=sql.Identifier(field)),
                                [value, client_id])
                connection.commit()

            # Update demographics fields
            for field, value in client.demographics.dict().items():
                sql_query = "UPDATE clients.demographics SET {column} = %s WHERE client_id = %s"
                cursor.execute(sql.SQL(sql_query).format(column=sql.Identifier(field)),
                            [value, client_id])
                connection.commit()

    return {"Message": "Client data replaced successfully"}


@specific_client.delete(path="/",
                        status_code=200,
                        summary="Delete a client")
def delete_client(
        client_id: int = Path(default=Required)
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE clients.clients SET status = 'deactivated' WHERE client_id = %s", [client_id])
            connection.commit()
