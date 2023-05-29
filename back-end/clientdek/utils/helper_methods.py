import os

import jwt
from fastapi import Cookie
from starlette.requests import Request
from starlette.responses import JSONResponse
from utils.exceptions import APIException
from utils.settings import pool


def validate_api_key(api_key: str):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM admin.api_keys WHERE api_key=%s", [api_key])
            if cursor.fetchone() is None:
                return JSONResponse("Invalid API Key", 403)
    
    return 1


def validate_jwt_token(jwt_token: str):
    try:
        jwt.decode(jwt_token, os.environ['DJANGO_SECRET_KEY'], algorithms="HS256")
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, jwt.DecodeError):
        return JSONResponse("Invalid JWT", 403)
    return 1


def uid_from_jwt(jwt_token: str) -> int:
    return int(jwt.decode(jwt=jwt_token, key=os.environ['DJANGO_SECRET_KEY'], algorithms="HS256")["user_id"])


def role_from_jwt(jwt_token: str) -> str:
    return jwt.decode(jwt=jwt_token, key=os.environ['DJANGO_SECRET_KEY'], algorithms="HS256")["admin_status"]


def uid_from_api_key(api_key: str) -> int:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM admin.api_keys WHERE api_key = %s", [api_key])
            return cursor.fetchone()[0]


def get_uid(
        request: Request
):
    if "clientdek" in request.cookies.keys():
        return uid_from_jwt(request.cookies.get("clientdek"))
    return uid_from_api_key(request.headers.get("X-API-KEY"))
