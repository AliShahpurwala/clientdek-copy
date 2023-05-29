from fastapi import Body, Cookie, Header
from pydantic import Required
from starlette.requests import Request

from utils.exceptions import APIException
from utils.helper_methods import uid_from_jwt, role_from_jwt, uid_from_api_key
from utils.settings import pool


def request_uid_matches_parameter_uid(request: Request,
                              user_id: int = Body(default=Required),
                              clientdek: str = Cookie(default=None),
                              ):
    print(user_id, uid_from_jwt(clientdek))
    if clientdek:
        if user_id != uid_from_jwt(clientdek):
            raise APIException(message="User ID does not match Requested change", error_code=403)
    elif user_id != uid_from_api_key(request.headers.get("X-API-KEY")):
        raise APIException(message="User ID does not match Requested change", error_code=403)


def admin(request: Request):
    """checks if the user's JWT token is an admin token"""
    try:
        request.cookies['clientdek']
    except KeyError:
        # If we're here and there's no jwt, there must be a valid API Key
        # because of our login middleware
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT permission FROM admin.api_keys WHERE api_key = %s", [request.headers["X-API-KEY"]])
                if cursor.fetchone()[0] != "admin":
                    raise APIException("Endpoint reserved for admins", 403)
        return
    if role_from_jwt(request.cookies.get("clientdek")) != "admin":
        raise APIException("Endpoint reserved for admins", 403)
    return
