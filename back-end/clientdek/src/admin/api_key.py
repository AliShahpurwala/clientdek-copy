import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Form, Depends, Body, Path
from pydantic import Required
from utils.commons import Pagination
from utils.check_existence import check_user_exist
from utils.settings import pool
from utils.router import ClientdekRoute

api_key_router = APIRouter(prefix="/api-key",
                           route_class=ClientdekRoute)


@api_key_router.get(path="/{api_key_id}", status_code=200, summary="Get specific API key details")
def get_api_key(api_key_id: int = Path(default=Required)):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("select id, user_id, description, permission, expiration from \
                            admin.api_keys where id = %s", [api_key_id])
            res = cursor.fetchone()
            if res is None:
                raise APIException(f"No API key found with id : {api_key_id}", 404)
            cols = [col[0] for col in cursor.description]
            return dict(zip(cols, res))

@api_key_router.get(path="", status_code=200, summary="Get a list of API keys",
                    description="GET a list of API keys")
def get_api_keys(
    pagination: Pagination = Depends(Pagination)
):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            utc_today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            cursor.execute("SELECT id, user_id, description, expiration FROM \
                            admin.api_keys WHERE %s < expiration LIMIT %s OFFSET %s", [utc_today, pagination.page_size, (pagination.page - 1) * pagination.page_size])
            res = cursor.fetchall()
            if res is None:
                return []
            else:
                columns = [col[0] for col in cursor.description]
                result = []
                for _key in res:
                    result.append(dict(zip(columns, _key)))
                return result


@api_key_router.post(path="", dependencies=[], status_code=201,
                     summary="Generate an API Key",
                     description="Get an API key for a user with role")
def generate_api_key(
        user_id: int = Form(default=Required,),
        description: str = Form(default=""),
        role: str = Form(default=Required, regex="^(general_user|admin)$"),
        expiration: date = Form(default=None,)
):
    check_user_exist(user_id=user_id)
    generated_api_key = "".join(str(uuid.uuid4()).split("-"))
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO admin.api_keys (user_id, api_key, description, expiration, permission) VALUES (%s, \
                        %s, %s, %s, %s);", [user_id, generated_api_key, description, expiration, role])
            connection.commit()

    return {
        "API-KEY": generated_api_key
    }

@api_key_router.delete(path="", status_code=201, description="Delete an API Key")
def delete_api_key(id: int = Body(default=Required, embed=True)):
    def api_key_exists(id: int):
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM admin.api_keys WHERE id = %s", [id])
                if cursor.fetchone() is None:
                    raise APIException(f"No API Key Found with ID = {id}", 404)
    api_key_exists(id)
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM admin.api_keys WHERE id = %s", [id])
            connection.commit()
    return "Successfully deleted item"

