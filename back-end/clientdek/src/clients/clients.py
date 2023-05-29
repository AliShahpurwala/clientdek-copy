'''This module contains the clients router and all of the endpoints for the clients router'''
from typing import List
from fastapi import APIRouter, Depends, Body, Query, Path, Form
from pydantic import Required
from starlette.responses import JSONResponse
from starlette.exceptions import HTTPException

from utils.dependencies import admin as admin_dependency
from utils.settings import pool
from utils.router import ClientdekRoute
from utils.db_tools import WhereStatement

from src.clients.commons import ClientCreate
from src.clients.dependencies import client_id_exists
from src.clients.specific_client import specific_client as specific_client_router
from src.clients.phone import phone as phone_router, phones as phones_router
from src.clients.email import email as email_router

clients = APIRouter(route_class=ClientdekRoute, 
                    prefix="/clients",
                    dependencies=[],
                    responses={404: {"description": "Not found"}},
                    tags=["Clients"],
                    )

@clients.get('/',
             description="Client Search",
             status_code=200)
def search(
        query: str = Query(default=Required),
        page: int = Query(default=1, ge=1),
        page_size: int = Query(default=10, ge=1)
):
    """Performs a search on the client table and returns a list of clients"""

    def search_query(query: str, page: int, page_size: int):
        """Basic trigram search on first and last name concatenated (very lame)"""
        #if the search query is blank a 400 error is raised
        if query == "":
            raise HTTPException(status_code=400, detail="Search query cannot be blank")
        return '''
            SELECT first, last, n.client_id
            FROM clients.name n
            INNER JOIN (
                SELECT name_join, client_id, clients.similarity(name_join, %s) AS sml
                FROM clients.name_trigram
                ORDER BY sml DESC
                LIMIT %s OFFSET %s
                ) tri on n.client_id = tri.client_id
            ORDER BY tri.sml DESC
            ''', [query.lower(), page_size, (page - 1) * page_size]

    sql_query, args = search_query(query, page, page_size)
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql_query, args)
            rows = cursor.fetchall()
            if rows is None:
                return JSONResponse("No Clients Found", 204)

            descriptions = [col[0] for col in cursor.description]
            results = [dict(zip(descriptions, client)) for client in rows]

    if not results:
        return JSONResponse("No Clients Found", 204)

    return JSONResponse(results, 200)


@clients.get('/names',
             summary="Get the list of client names from a list of ids",
             description="Get client names",
             status_code=200)
def get_client_names(
        ids: List[int] = Query(
            default=None,
            ge=1,
            alias="id",
        ),
):
    '''Get a list of client names from a list of ids'''
    where_statement = WhereStatement("client_id in %s", [tuple(ids)])

    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT client_id, first, last FROM clients.name' + str(where_statement),
                where_statement.params)
            rows = cursor.fetchall()
            descriptions = [col[0] for col in cursor.description]
            results = [dict(zip(descriptions, client)) for client in rows]

            if not results:
                return JSONResponse("No Clients Found", 204)
            return JSONResponse(results, 200)

@clients.post('/',
              summary="Create a client",
              description="Create a client",
              status_code=201
              )
def create_client(
        client: ClientCreate,
):
    '''Creates a client'''
    if not client.dict():
        return JSONResponse(content={'error': 'client data is empty'}, status_code=400)

    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO clients.clients DEFAULT VALUES RETURNING client_id")
            connection.commit()
            client_id = cursor.fetchone()[0]

            if client.contact:
                for email in client.contact.email:
                    if email.email or email.type:
                        cursor.execute(
                            "INSERT INTO clients.email (client_id, email, type) \
                            VALUES (%s, %s, %s)", (client_id, email.email, email.type))
                        connection.commit()

                for phone in client.contact.phone:
                    if phone.phone or phone.type:
                        cursor.execute(
                            "INSERT INTO clients.phone (client_id, number, type) \
                            VALUES (%s, %s, %s)", (client_id, phone.phone, phone.type))
                        connection.commit()

            if client.name:
                cursor.execute(
                    "INSERT INTO clients.name (client_id, first, last, middle, preferred, prefix, suffix) \
                    VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (client_id,
                    client.name.first,
                    client.name.last,
                    client.name.middle,
                    client.name.preferred,
                    client.name.prefix,
                    client.name.suffix))
                connection.commit()

            if client.address:
                with client.address as address:
                    if any(field is not None for field in client.address.dict().values()):
                        cursor.execute(
                            "INSERT INTO clients.address \
                            (client_id, \
                            street_number, \
                            building_name, \
                            street_number_suffix, \
                            street_name, \
                            street_direction, \
                            street_type, \
                            address_type, \
                            address_type_identifier, \
                            local_municipality, \
                            city, \
                            governing_district, \
                            postal_code, \
                            country) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                            (client_id,
                                address.street_number,
                                address.building_name,
                                address.street_number_suffix,
                                address.street_name,
                                address.street_direction,
                                address.street_type,
                                address.address_type,
                                address.address_type_identifier,
                                address.local_municipality,
                                address.city,
                                address.governing_district,
                                address.postal_code,
                                address.country))
                        connection.commit()

            if client.demographics:
                cursor.execute(
                    "INSERT INTO clients.demographics (client_id,gender,date_of_birth)\
                    VALUES (%s, %s, %s)",
                    (client_id, client.demographics.gender, client.demographics.date_of_birth))
                connection.commit()

    return {"Created client:": client_id}



@clients.put(path="/{client_id}/status",
             dependencies=[Depends(client_id_exists), Depends(admin_dependency)],
             description="Set client status")
def set_status(
        client_id: int = Path(default=Required),
        status: str = Body(default=Required, regex="^(active|deactivated)$")
):
    '''Sets the status of a client'''
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE clients.clients SET status = %s \
                WHERE client_id = %s", (status, client_id))
            connection.commit()

clients.include_router(specific_client_router)
clients.include_router(phone_router)
clients.include_router(phones_router)
clients.include_router(email_router)
