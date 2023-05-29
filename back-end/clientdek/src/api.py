import os
import jwt
from fastapi import FastAPI, Request, Response, Path 
from pydantic import Required
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import OperationalError, InterfaceError
from starlette.responses import JSONResponse
from src.admin.admin import admin as admin_router
from src.auth import auth as auth_router, create_jwt_token
from src.users.users import users as users_router
from src.clients.clients import clients as clients_router
from src.groups.groups import groups as groups_router
from src.events.events import events as events_router
from src.images.images import images as images_router
from utils.exceptions import NotLoggedInException, APIException
from utils.helper_methods import validate_api_key, validate_jwt_token
from utils.settings import DEBUG
from utils.router import ClientdekRoute


api = FastAPI(
    title="Clientdek API",
    description="API for Clientdek",
    version="0.1.0",
    debug=DEBUG,
)

api.router.route_class = ClientdekRoute

api.include_router(users_router)
api.include_router(admin_router)
api.include_router(auth_router)
api.include_router(clients_router)
api.include_router(groups_router)
api.include_router(events_router)
api.include_router(images_router)

OPEN_ENDPOINTS = (
    "/api/login", "/api/reset-password-logged-out", "/api/change-password-logged-out", "/api/docs", "/api/redoc",
    "/api/openapi.json", "/api/verify-reset-password-token")



@api.middleware("http")
async def login_middleware(request: Request, call_next):
    if request.url.path.startswith(OPEN_ENDPOINTS):
        return await call_next(request)
    try:
        request.cookies["clientdek"]
    except KeyError:
        try:
            request.headers["X-API-KEY"]
        except KeyError:
            return JSONResponse("Not Logged in", 403)
        validation_response = validate_api_key(request.headers["X-API-KEY"])
        if validation_response != 1:
            return JSONResponse("Invalid API Key", 403)
        return await call_next(request)
    validation_response = validate_jwt_token(request.cookies["clientdek"])
    if validation_response != 1:
        return JSONResponse("Invalid JWT Token", 403)
    response = await call_next(request)
    response.set_cookie(key="clientdek", value=create_jwt_token(
        jwt.decode(jwt=request.cookies.get("clientdek"), key=os.environ.get("DJANGO_SECRET_KEY"),
                   algorithms=["HS256"]).get("user_id")
    ), max_age=3600)
    return response


origins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:8080',
    'https://clientdek.com',
    'https://dev.clientdek.com',
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@api.exception_handler(NotLoggedInException)
def not_logged_in_exception_handler(request: Request, exc: NotLoggedInException):
    return JSONResponse(
        status_code=403,
        content={"message": "You're not logged in"}
    )


@api.exception_handler(APIException)
def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.error_code,
        content={"message": exc.message}
    )


@api.exception_handler(OperationalError)
def db_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=500,
        content={"message": "internal error"}
    )


@api.exception_handler(InterfaceError)
def db_exception_handler_interface(request: Request, exc: APIException):
    return JSONResponse(
        status_code=500,
        content={"message": "internal error"}
    )
