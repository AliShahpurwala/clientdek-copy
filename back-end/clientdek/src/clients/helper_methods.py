from utils.settings import pool
from src.clients.commons import Address

def get_address(client_id: int):
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
    return Address(**results)


def phone_type_exists_helper(client_id: int, phone_type: str):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT type FROM clients.phone WHERE client_id = %s", [client_id])
            result = cursor.fetchall()
            print(result)
            if not result:
                return False
            else:
                return True if phone_type in result[0] else False
