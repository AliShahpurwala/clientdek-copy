from fastapi import APIRouter, Path, Body, Depends
from psycopg2 import sql
from pydantic import Required

from src.clients.commons import AddressPut
from src.clients.dependencies import client_id_exists
from utils.settings import pool
from utils.router import ClientdekRoute

address = APIRouter(route_class=ClientdekRoute, 
                    prefix="/{client_id}/address",
                    dependencies=[Depends(client_id_exists)])


@address.get(path="/",
             status_code=200,
             summary="Get the address of a client",
             description="Get the address of a client with their client id")
def get_address(
        client_id: int = Path(default=Required),
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            # Get address data
            cursor.execute('SELECT * FROM clients.address WHERE client_id = %s', [client_id])
            address_data = cursor.fetchone()
            columns = [col[0] for col in cursor.description]
            if address_data is None:
                rows = [None] * len(columns)
            else:
                rows = list(address_data)
    results = dict(zip(columns, rows))
    # remove the client id from the results
    results.pop('client_id')
    return results


@address.put(path="/", status_code=200,
             summary="Edit an address with the client id")
def edit_address_all(
        client_id: int = Path(default=Required),
        new_address: AddressPut = Body(default=None)
):
    if new_address is None:
        return
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            for field in AddressPut.__fields__:
                sql_query = sql.SQL("UPDATE clients.address SET {col} = %s WHERE client_id = %s")
                cursor.execute(sql_query.format(col=sql.Identifier(field)),
                            [new_address.__getattribute__(field), client_id])
                connection.commit()


@address.patch(path="/", status_code=200,
               summary="Edit an address with a client id")
def edit_address(
        client_id: int = Path(default=Required),
        new_address: AddressPut = Body(default=None)
):
    return edit_address_all(client_id, new_address)
